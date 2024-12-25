FROM python:3.9-slim

WORKDIR /app

# Install all system dependencies at once
RUN apt-get update && apt-get install -y \
    flac \
    libportaudio2 \
    libsndfile1 \
    ffmpeg \
    portaudio19-dev \
    python3-pyaudio \
    gcc \
    libasound2-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install all Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"] 