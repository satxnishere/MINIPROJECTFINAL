from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import time
import re
import traceback
import shelve
from threading import Lock
from flask import send_file
from gtts import gTTS
import tempfile
import json
import requests
import argparse

# Import functions from datareceive.py
from datareceive import load_config, update_config, get_latest_data_kb, upload_file, save_previous_config, restore_previous_config

parser = argparse.ArgumentParser(description='Run the bot server.')
parser.add_argument('--port', type=int, default=5000, help='Port to run the server on.')
args = parser.parse_args()
# Load API key
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if api_key is None:
    raise ValueError("API key not found. Please set the OPENAI_API_KEY in the .env file.")
client = OpenAI(api_key=api_key)

# Flask app setup
app = Flask(__name__)
CORS(app)

# Define absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'images')
CONFIG_PATH = 'config.json'
JSON_FOLDER = os.path.join(BASE_DIR, 'json_data')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'pdf', 'py'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Print config file path at startup
print(f"Config file path: {CONFIG_PATH}")

# Global variables
assistant = None
file = None
config_lock = Lock()


class ConfigManager:

    def __init__(self, config_path, cache_duration=10):
        self.config_path = config_path
        self.cache_duration = cache_duration
        self.last_load_time = 0
        self.config_data = None
        self.lock = Lock()

    def get_config(self):
        with self.lock:
            current_time = time.time()
            if self.config_data is None or (
                    current_time - self.last_load_time) > self.cache_duration:
                self.reload_config()
            return self.config_data

    def reload_config(self):
        try:
            self.config_data = load_config(app, self.config_path)
            self.last_load_time = time.time()
            app.logger.info(f"Config reloaded: {self.config_data}")
        except Exception as e:
            app.logger.error(f"Error loading config: {str(e)}")
            self.config_data = {}

    def force_reload(self):
        with self.lock:
            self.reload_config()


config_manager = ConfigManager(CONFIG_PATH)


def create_assistant(file, prompt, prompt_2, config):
    try:
        app.logger.info(
            f"Creating assistant with file ID: {file.id}, prompt: {prompt[:100]}..., model: {config['model']}"
        )
        response = client.beta.assistants.create(
            name="Patricia",
            instructions=f"{prompt}\n\n{prompt_2}",
            tools=[{
                "type": "retrieval"
            }],
            model=config['model'],
            file_ids=[file.id],
        )
        app.logger.info(f"Create assistant response: {response}")
        return response
    except Exception as e:
        app.logger.error(f"Error creating assistant: {str(e)}")
        raise


def initialize_assistant_and_file():
    global assistant, file
    config = config_manager.get_config()

    file_path = config.get('dataset_pdf', 'dataset.pdf')
    file = upload_file(app, file_path, client)

    latest_data_kb = get_latest_data_kb(app)
    prompt = config.get('prompt', '').format(data_kb=latest_data_kb)
    prompt_2 = """If the conversation is finished and the customer is done booking you should output this word: CONVERSATION_FINISHED and then output the customer data in this json format if there is no data say none:

    Type of senior living service interested in
    Beneficiary of the services
    Transition timeline
    Full name of the potential resident
    Age of the person joining
    Current living arrangement
    Health concerns or care needs
    Name 
    phone
    email
    """

    assistant = create_assistant(file, prompt, prompt_2, config)


initialize_assistant_and_file()


# Thread management functions
def check_if_thread_exists(wa_id):
    with shelve.open("threads_db") as threads_shelf:
        return threads_shelf.get(wa_id, None)


def store_thread(wa_id, thread_id):
    with shelve.open("threads_db", writeback=True) as threads_shelf:
        threads_shelf[wa_id] = thread_id


def generate_response(message_body, wa_id, name):
    global assistant, file

    try:
        app.logger.info(
            f"Starting generate_response for {name} with wa_id {wa_id}")
        config = config_manager.get_config()
        latest_data_kb = get_latest_data_kb(app)

        # Check if there is already a thread_id for the wa_id
        thread_id = check_if_thread_exists(wa_id)

        # If a thread doesn't exist, create one and store it
        if thread_id is None:
            app.logger.info(
                f"Creating new thread for {name} with wa_id {wa_id}")
            thread = client.beta.threads.create()
            store_thread(wa_id, thread.id)
            thread_id = thread.id
        else:
            app.logger.info(
                f"Retrieving existing thread for {name} with wa_id {wa_id}")

        message = client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message_body,
        )

        current_instructions = config.get('prompt',
                                          '').format(data_kb=latest_data_kb)
        prompt_2 = """If the conversation is finished and the customer is done booking you should output this word: CONVERSATION_FINISHED and then output the customer data in this json format:

        no of travellers
        date of the event
        name
        pickup time
        pickup location
        event location
        return trip time (if available)
        special requests
        phone
        email"""

        if f"{current_instructions}\n\n{prompt_2}" != assistant.instructions or config.get(
                'model') != assistant.model:
            assistant = create_assistant(file, current_instructions, prompt_2,
                                         config)

        new_message = run_assistant(thread_id, assistant.id)
        app.logger.info(f"To {name}: {new_message[:100]}...")

        # Check if the conversation is finished
        if "CONVERSATION_FINISHED" in new_message:
            conversation_parts = new_message.split("CONVERSATION_FINISHED", 1)
            response = conversation_parts[0].strip()
            customer_data = conversation_parts[1].strip()

            # Save customer data to JSON file
            save_customer_data(customer_data, wa_id)

            return f"Thank you for your booking. Your information has been saved. Our representative will contact you shortly."
        else:
            cleaned_response = re.sub(r'【.*】', '', new_message)
            final_response = re.sub(r'!(.*?)\(([^)]+)\)', r'\1\2',
                                    cleaned_response)
            return final_response

    except Exception as e:
        app.logger.error(f"Error in generate_response: {str(e)}")
        app.logger.error(f"Error type: {type(e).__name__}")
        app.logger.error(f"Error traceback: {traceback.format_exc()}")
        return f"I'm sorry, but I'm having trouble accessing my knowledge base at the moment. Please try again later or contact support."


def save_customer_data(customer_data, wa_id):
    try:
        # Ensure JSON folder exists
        os.makedirs(JSON_FOLDER, exist_ok=True)

        # Extract the JSON part from the customer_data
        json_start = customer_data.find('{')
        json_end = customer_data.rfind('}') + 1
        json_str = customer_data[json_start:json_end]

        # Parse the JSON string
        data = json.loads(json_str)

        # Save to JSON file
        filename = os.path.join(JSON_FOLDER, f"{wa_id}_booking.json")
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)

        app.logger.info(f"Customer data saved to {filename}")

        # Send the data to google.com/request
        send_data_to_google(data)

    except Exception as e:
        app.logger.error(f"Error saving customer data: {str(e)}")


def send_data_to_google(data):
    try:
        response = requests.post(
            'https://hook.us1.make.com/p3q2z2hzuqytm8n8x2b2giq6cjmslugr',
            json=data)
        response.raise_for_status()
        app.logger.info(
            f"Data sent successfully to google.com/request. Response: {response.text}"
        )
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error sending data to google.com/request: {str(e)}")


def run_assistant(thread_id, assistant_id):
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id,
    )

    while run.status != "completed":
        time.sleep(0.1)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id,
                                                run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread_id)
    new_message = messages.data[0].content[0].text.value
    print(f"Generated message: {new_message}")
    return new_message


@app.route('/undo-config', methods=['POST'])
def undo_config():
    try:
        result = restore_previous_config(app, CONFIG_PATH)
        if result['success']:
            config_manager.force_reload()
            initialize_assistant_and_file(
            )  # Re-initialize the assistant with the restored config
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        app.logger.error(f"Unexpected error in undo_config: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


# Flask routes
@app.route('/')
def home():
    config = config_manager.get_config()
    return render_template('index.html',
                           config=config,
                           chatbot_video=config.get('chatbot_video'),
                           chat_icon=config.get('chat_icon'),
                           xlt_image=config.get('xlt_image'),
                           chatbot_icon=config.get('chatbot_icon'))


@app.route('/get-response', methods=['POST'])
def get_response():
    user_input = request.json['message'].lower().strip()
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({'response': "Error: User ID is missing or invalid."})

    flask_output = generate_response(user_input, wa_id=user_id, name="User")
    return jsonify({'response': flask_output})


@app.route('/update-config', methods=['POST'])
def update_config_route():
    try:
        app.logger.info(f"Received update-config request.")
        app.logger.info(f"Request method: {request.method}")
        app.logger.info(f"Request headers: {dict(request.headers)}")
        app.logger.info(f"Form data: {request.form.to_dict()}")
        app.logger.info(f"Files: {list(request.files.keys())}")

        result = update_config(app, request, BASE_DIR, UPLOAD_FOLDER,
                               CONFIG_PATH, ALLOWED_EXTENSIONS)
        app.logger.info(f"Update config result: {result}")

        if result.get('success', False):
            return jsonify(result), 200
        else:
            return jsonify(
                result), 400  # Bad request if update wasn't successful

    except Exception as e:
        app.logger.error(f"Unexpected error in update_config_route: {str(e)}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500


@app.route('/synthesize', methods=['POST'])
def synthesize():
    text = request.form['text']
    tts = gTTS(text=text, lang='en')

    # Save the audio file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
        tts.save(temp_file.name)
        temp_filename = temp_file.name

    # Send the audio file
    return send_file(temp_filename, mimetype="audio/mp3")


if __name__ == '__main__':
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Ensure JSON folder exists
    os.makedirs(JSON_FOLDER, exist_ok=True)

    # Print current config file contents
    try:
        with open(CONFIG_PATH, 'r') as f:
            print(f"Current config file contents: {f.read()}")
    except FileNotFoundError:
        print(f"Config file not found at {CONFIG_PATH}")


    app.run(port=args.port)