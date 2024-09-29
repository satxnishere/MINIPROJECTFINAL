
import os
import shutil
import json
import subprocess
import socket
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the frontend

# Configure logging
logging.basicConfig(
    filename='backend.log',
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s:%(message)s'
)

# Base directory for all bot configurations
BASE_BOTFILES_PATH = r"C:\Users\harsh\OneDrive\Documents\MINIPROJECTFINAL\botfiles"

# Dictionary to keep track of bot_id and their processes
bot_processes = {}

def get_bot_directory(bot_id):
    return os.path.join(BASE_BOTFILES_PATH, f'botcreate{bot_id}')

def get_config_file_path(bot_id):
    return os.path.join(get_bot_directory(bot_id), 'config.json')

def find_free_port():
    """
    Finds a free port on the host.

    Returns:
        int: A free port number.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))  # Bind to a free port provided by the host.
        return s.getsockname()[1]

def generate_next_bot_id():
    """
    Generates the next available bot_id by scanning existing bot directories.

    Returns:
        int: The next available bot_id.
    """
    existing_ids = []
    for dirname in os.listdir(BASE_BOTFILES_PATH):
        if dirname.startswith('botcreate'):
            try:
                bot_id = int(dirname[len('botcreate'):])
                existing_ids.append(bot_id)
            except ValueError:
                continue
    return max(existing_ids, default=0) + 1

def clone_bot_directory(new_bot_dir):
    """
    Clones the base bot directory to create a new bot directory.

    Args:
        new_bot_dir (str): The path to the new bot directory.
    """
    base_bot_dir = os.path.join(BASE_BOTFILES_PATH, 'botcreate1')
    if not os.path.exists(base_bot_dir):
        os.makedirs(base_bot_dir)
        with open(os.path.join(base_bot_dir, 'config.json'), 'w') as f:
            json.dump({}, f)
    shutil.copytree(base_bot_dir, new_bot_dir)
    logging.info(f"Cloned bot directory to {new_bot_dir}")

def run_main_py(bot_dir, port, bot_id):
    """
    Runs the main.py script in the specified bot directory on the given port.

    Args:
        bot_dir (str): The directory where main.py is located.
        port (int): The port number to run the bot on.
        bot_id (int): The unique identifier for the bot.
    """
    main_py_path = os.path.join(bot_dir, 'main.py')
    if not os.path.exists(main_py_path):
        error_msg = f"main.py does not exist in {bot_dir}"
        logging.error(error_msg)
        raise FileNotFoundError(error_msg)

    try:
        # Start main.py as a separate process
        process = subprocess.Popen(
            [sys.executable, 'main.py', '--port', str(port)],
            cwd=bot_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=False
        )
        bot_processes[bot_id] = process
        logging.info(f"Started main.py for bot_id {bot_id} on port {port}")
    except Exception as e:
        logging.error(f"Failed to start main.py for bot_id {bot_id}: {str(e)}")
        raise

@app.route('/create-bot', methods=['POST'])
def create_bot():
    """
    Creates a new bot by cloning the base bot directory and assigning a unique bot_id and port.
    Returns:
        JSON response indicating success or failure.
    """
    try:
        bot_id = generate_next_bot_id()
        # Check if bot_id already exists to prevent duplication
        if os.path.exists(get_bot_directory(bot_id)):
            error_msg = f'Bot {bot_id} already exists.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400

        new_bot_dir = get_bot_directory(bot_id)
        clone_bot_directory(new_bot_dir)
        
        # Assign a unique free port
        port = find_free_port()
        
        # Update config.json with the assigned port
        config_path = get_config_file_path(bot_id)
        with open(config_path, 'r') as f:
            config = json.load(f)
        config['port'] = port
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        logging.info(f"Assigned port {port} to bot_id {bot_id}")

        # Run main.py automatically on the assigned port
        run_main_py(new_bot_dir, port, bot_id)
        
        return jsonify({'success': True, 'bot_id': bot_id, 'port': port}), 201

    except Exception as e:
        logging.error(f"Error creating bot: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/terminate-bot/<int:bot_id>', methods=['POST'])
def terminate_bot(bot_id):
    """
    Terminates the main.py process associated with the given bot_id.

    Args:
        bot_id (int): The unique identifier for the bot.

    Returns:
        JSON response indicating success or failure.
    """
    try:
        process = bot_processes.get(bot_id)
        if process and process.poll() is None:  # Check if process is running
            process.terminate()
            try:
                process.wait(timeout=5)
                logging.info(f"Terminated bot_id {bot_id} successfully.")
            except subprocess.TimeoutExpired:
                process.kill()
                logging.warning(f"Force killed bot_id {bot_id} after timeout.")
            del bot_processes[bot_id]
            return jsonify({'success': True, 'message': f'Bot {bot_id} terminated successfully.'}), 200
        else:
            error_msg = f'Bot {bot_id} is not running.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400
    except Exception as e:
        logging.error(f"Error terminating bot_id {bot_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/update-config/<int:bot_id>', methods=['POST'])
def update_config(bot_id):
    """
    Updates the configuration for the specified bot_id.

    Args:
        bot_id (int): The unique identifier for the bot.

    Returns:
        JSON response indicating success or failure.
    """
    try:
        config_path = get_config_file_path(bot_id)
        if not os.path.exists(config_path):
            error_msg = 'Configuration not found.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 404

        data = request.get_json()
        if not data:
            error_msg = 'No data provided.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400

        # Load existing configuration
        with open(config_path, 'r') as f:
            config = json.load(f)

        # Update configuration with incoming data
        config.update(data)

        # Write back the merged configuration
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        logging.info(f"Updated config.json for bot_id {bot_id}")

        # Fetch the updated port from config.json
        new_port = config.get('port')
        if not new_port:
            error_msg = 'Port not specified in configuration.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400

        # Terminate existing process if running
        terminate_response = terminate_bot(bot_id)
        # Check the response status code
        if terminate_response[1] != 200:
            error_msg = f"Failed to terminate existing bot process for bot_id {bot_id}."
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400

        # Run main.py with the new port
        run_main_py(get_bot_directory(bot_id), new_port, bot_id)

        return jsonify({'success': True, 'message': 'Configuration updated and bot restarted.'}), 200

    except Exception as e:
        logging.error(f"Error updating config for bot_id {bot_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/get-config/<int:bot_id>', methods=['GET'])
def get_config(bot_id):
    """
    Retrieves the configuration for the specified bot_id.

    Args:
        bot_id (int): The unique identifier for the bot.

    Returns:
        JSON response with the bot configuration.
    """
    try:
        config_path = get_config_file_path(bot_id)
        if not os.path.exists(config_path):
            error_msg = 'Configuration not found.'
            logging.warning(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 404

        with open(config_path, 'r') as f:
            config = json.load(f)

        logging.info(f"Fetched config.json for bot_id {bot_id}")
        return jsonify({'success': True, 'config': config}), 200

    except Exception as e:
        logging.error(f"Error fetching config for bot_id {bot_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)