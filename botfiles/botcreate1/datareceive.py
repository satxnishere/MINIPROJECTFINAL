import os
import json
import importlib
import sys
from werkzeug.utils import secure_filename


def load_config(app, CONFIG_PATH):
    try:
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)
        app.logger.info(f"Loaded config: {config}")
    except FileNotFoundError:
        app.logger.warning(
            f"Config file not found at {CONFIG_PATH}. Using default values.")
        config = {}
    except json.JSONDecodeError:
        app.logger.error(
            f"Error decoding JSON from {CONFIG_PATH}. Using default values.")
        config = {}

    # Provide default values for all expected keys
    default_config = {
        "prompt":
        "Role: You are an AI bot for the Advanced Medical Treatment Center, providing information and assistance about medical services and treatments.\r\n\r\nGuidelines:\r\n1. Use clear, empathetic, and professional language.\r\n2. Ensure accurate information based on medical services.\r\n3. Provide general information about treatments, facilities, and services.\r\n4. Direct users to appropriate resources or personnel as needed.\r\n5. Be respectful and maintain confidentiality.\r\n\r\nGather: Patient's inquiry, relevant symptoms, medical history, appointment scheduling, contact information.\r\n\r\nRules:\r\n- Provide accurate and up-to-date information.\r\n- Maintain professionalism and empathy in responses.\r\n- Avoid giving medical advice that should come from a healthcare professional.\r\n- Be clear and concise in your responses.\r\n\r\nStages:\r\n1. Greeting: Welcome the user and ask about their medical concerns.\r\n2. Inquiry details: Gather information about their symptoms or questions.\r\n3. Medical history: Collect relevant background information if needed.\r\n4. Appointment scheduling: Assist with booking or provide information on how to book.\r\n5. Contact information: Gather contact details if necessary for follow-up.\r\n6. Conclusion: Summarize the information provided and confirm any next steps.\r\n\r\nServices and other information : {data_kb}",
        "chatbot_video": "patricia.mp4",
        "chat_icon": "small.png",
        "xlt_image": "bluecolor.png",
        "chatbot_icon": "person1.jpg",
        "dataset_pdf": "dataset.pdf",
        "pdf_name": "dataset.pdf",
        "data_py": "data.py",
        "model": "gpt-4-1106-preview",
        "heading1": "XLT Transportation",
        "sub_heading1": "Xellence Limousine Transportation",
        "heading2": "XLT Transportation",
        "sub_heading2": "Xellence Limousine Transportation",
        "initial_message": "Hey, this is Patricia. Thanks for stopping by. How can I help?"
    }

    # Update default config with loaded config
    default_config.update(config)

    app.logger.info(f"Final config: {default_config}")
    return default_config


def allowed_file(filename, ALLOWED_EXTENSIONS):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_latest_data_kb(app):
    try:
        if 'data' in sys.modules:
            importlib.reload(sys.modules['data'])
        from data import data_kb
        app.logger.info(f"Loaded data_kb: {data_kb[:100]}..."
                        )  # Log the first 100 characters
        return data_kb
    except Exception as e:
        app.logger.error(f"Error loading data_kb: {str(e)}")
        raise


def upload_file(app, file, client):
    try:
        app.logger.info(f"Uploading file: {file}")
        if isinstance(file, str):  # If it's a file path
            with open(file, 'rb') as f:
                response = client.files.create(file=f, purpose="assistants")
        else:  # If it's a file object
            response = client.files.create(file=file, purpose="assistants")
        app.logger.info(f"File upload response: {response}")
        return response
    except Exception as e:
        app.logger.error(f"Error uploading file: {str(e)}")
        raise

def save_previous_config(app, CONFIG_PATH):
    try:
        with open(CONFIG_PATH, 'r') as f:
            current_config = json.load(f)
        
        PREVIOUS_CONFIG_PATH = 'previous_config.json'
        with open(PREVIOUS_CONFIG_PATH, 'w') as f:
            json.dump(current_config, f, indent=4)
        
        app.logger.info(f"Saved previous config to {PREVIOUS_CONFIG_PATH}")
    except Exception as e:
        app.logger.error(f"Error saving previous config: {str(e)}")
        

def update_config(app, request, BASE_DIR, UPLOAD_FOLDER, CONFIG_PATH, ALLOWED_EXTENSIONS):
    try:
        app.logger.info("Received update-config request")
        
        # Save current config as previous config
        save_previous_config(app, CONFIG_PATH)
        
        config = load_config(app, CONFIG_PATH)
        app.logger.info(f"Loaded config: {config}")


        # Process file uploads
        for file_key in [
                'chatbot_video', 'chat_icon', 'xlt_image', 'chatbot_icon',
                'dataset_pdf', 'data_py'
        ]:
            if file_key in request.files:
                file = request.files[file_key]
                if file and file.filename and allowed_file(
                        file.filename, ALLOWED_EXTENSIONS):
                    filename = secure_filename(file.filename)
                    if file_key in ['dataset_pdf', 'data_py']:
                        filename = file_key.split(
                            '_')[0] + '.' + file_key.split('_')[1]
                        file_path = os.path.join(BASE_DIR, filename)
                    else:
                        file_path = os.path.join(UPLOAD_FOLDER, filename)

                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    file.save(file_path)
                    config[file_key] = filename
                    app.logger.info(
                        f"Saved new file for {file_key}: {filename}")

        # Update text fields only if they are provided and not empty
        for key in ['prompt', 'model', 'heading1', 'sub_heading1', 'heading2', 'sub_heading2', 'initial_message']:
            if key in request.form and request.form[key].strip():
                config[key] = request.form[key].strip()
                app.logger.info(f"Updated {key}: {config[key]}")

        # Write updated config to file
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=4)
        app.logger.info(f"Wrote updated config to file: {CONFIG_PATH}")

        return {
            "success": True,
            "message": "Configuration updated successfully"
        }

    except Exception as e:
        app.logger.error(f"Error updating config: {str(e)}")
        return {"success": False, "error": str(e)}  
    
    
def restore_previous_config(app, CONFIG_PATH):
    try:
        PREVIOUS_CONFIG_PATH = 'previous_config.json'
        with open(PREVIOUS_CONFIG_PATH, 'r') as f:
            previous_config = json.load(f)
        
        with open(CONFIG_PATH, 'w') as f:
            json.dump(previous_config, f, indent=4)
        
        app.logger.info(f"Restored previous config from {PREVIOUS_CONFIG_PATH}")
        return {"success": True, "message": "Previous configuration restored successfully"}
    except Exception as e:
        app.logger.error(f"Error restoring previous config: {str(e)}")
        return {"success": False, "error": str(e)}