import requests

# Define the data
data = {
    "no of travellers": 11,
    "date of the event": "2023-12-12",
    "name": "Dixith",
    "pickup time": "22:00",
    "pickup location": "Car Street, 12th house",
    "event location": "Rar Street, 16th house",
    "return trip time": None,
    "special requests": None,
    "phone": "354647564",
    "email": "dixith@tabrobotics.com"
}

# Define the URL
url = "https://hook.us1.make.com/p3q2z2hzuqytm8n8x2b2giq6cjmslugr"

# Send the POST request
response = requests.post(url, json=data)

# Print the response
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
