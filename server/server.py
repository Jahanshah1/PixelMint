from flask import Flask, request, jsonify, send_from_directory, url_for
import openai
from PIL import Image
import requests
from io import BytesIO
import os
from flask_cors import CORS
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

load_dotenv()
# Set the upload folder to the static directory within the server folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static')

# Ensure the static directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize the API client
openai.api_key = os.getenv('OPENAI_KEY')

def generate_image(prompt):
    try:
        # Call the DALL-E API to generate an image
        response = openai.Image.create(
            model="dall-e-3", # Specify the model version
            prompt=prompt,
            n=1,  # Number of images to generate
            size="1024x1024"  # Image resolution
        )
        
        # Get the image URL from the response
        image_url = response['data'][0]['url']
        
        # Download the image from the URL
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content))
        
        # Save the image locally
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'generated_image.png')
        img.save(image_path)
        print(f"Image saved at: {image_path}")  # Log the image save path
        print(f"Absolute image path: {os.path.abspath(image_path)}")  # Log the absolute image path
        return image_path

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data['prompt']
    image_path = generate_image(prompt)
    if image_path:
        # Generate the full URL to the image
        image_url = url_for('serve_image', filename='generated_image.png', _external=True)
        print(f"Image URL: {image_url}")  # Print the image URL
        return jsonify({'image_url': image_url})
    else:
        return jsonify({'error': 'An error occurred while generating the image.'}), 500

@app.route('/static/<path:filename>')
def serve_image(filename):
    print(f"Serving image: {filename}")  # Log the filename being served
    try:
        print("Contents of static directory:", os.listdir(app.config['UPLOAD_FOLDER']))  # Log contents of the static directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error serving image: {e}")
        return jsonify({'error': 'An error occurred while serving the image.'}), 500

if __name__ == '__main__':
    app.run(debug=True)



#contract deployed : https://testnet.bscscan.com/tx/0x0f779c850a443d083a07d8069dfcdca6c9aec2cb7d665a39dc49c3de6b5bc60d
#CA : 0x528268f80fe98669d712f524aa4a66141218bbc5

