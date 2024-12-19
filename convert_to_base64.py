import base64

# Path to your audio file
file_path = "query.wav"  # Replace with your actual file name if it's different

# Convert the file to Base64
with open(file_path, "rb") as audio_file:
    base64_audio = base64.b64encode(audio_file.read()).decode("utf-8")

# Print the Base64-encoded string
print(base64_audio)
