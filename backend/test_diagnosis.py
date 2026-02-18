import requests

url = "http://localhost:8000/diagnose"
files = {'file': ('test.jpg', b'fake image data', 'image/jpeg')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
