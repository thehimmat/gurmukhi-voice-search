import sounddevice as sd
import wave

# Function to record audio
def record_audio(filename="query.wav", duration=5, sample_rate=16000):
    print("Recording... Speak into your microphone.")
    audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype="int16")
    sd.wait()  # Wait until recording is finished
    print("Recording complete. Saving audio to file...")

    # Save the audio as a WAV file
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(1)  # Mono
        wf.setsampwidth(2)  # 16-bit audio
        wf.setframerate(sample_rate)  # Sampling rate
        wf.writeframes(audio.tobytes())

    print(f"Audio saved as {filename}")

# Call the function
record_audio()
