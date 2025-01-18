# Scripture Data Processing

This module handles the processing and ingestion of various scripture data sources.

## Directory Structure
- `scripts/`: Processing scripts for different data types
- `input/`: Raw input files
  - `audio/`: Audio recordings
  - `text/`: PDF and CSV files
- `output/`: Processed data and error reports

## Setup
```bash
pip install -r requirements.txt
```

## Usage
1. Place input files in appropriate directories
2. Run processing scripts:
   ```bash
   python -m scripts.process_audio
   python -m scripts.process_legacy_pdf
   python -m scripts.process_unicode_pdf
   ```
3. Check output/errors for results

## Adding New Data
Use `DataIngestion` class for adding new content:
```python
from scripts.data_ingestion import DataIngestion
ingestion = DataIngestion()
ingestion.add_audio("path/to/new/audio.wav", "reader_id")
```

TODO: Add more detailed documentation for each processor
