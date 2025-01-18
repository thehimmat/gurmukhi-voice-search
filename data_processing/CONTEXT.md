# Project Context & Decisions

## Data Sources Overview
1. Audio Files
   - Format: Multiple page recordings (need splitting)
   - Source: Audio recordings of scripture readings
   - Challenge: Need to split into verse-level segments

2. Legacy Gurmukhi Text
   - Format: PDF with formatting artifacts
   - Source: Complete scripture text in legacy format
   - Challenge: Contains page numbers, TOC, border designs to filter

3. Unicode Gurmukhi Text
   - Format: PDF with similar formatting issues
   - Source: Complete scripture text in Unicode
   - Challenge: Same formatting cleanup needed as legacy

4. Metadata CSV
   - Content: Gurmukhi legacy, translations, transliterations
   - Additional: Spanish translation, other metadata
   - Structure: Will need column mapping configuration

## Key Technical Decisions
1. Database: PostgreSQL chosen for:
   - Full-text search capabilities
   - Vector storage (embeddings)
   - Unicode support
   - JSON support for flexible metadata

2. Processing Strategy:
   - Process each source independently
   - Validate before database insertion
   - Keep raw files for reprocessing
   - Store processing artifacts for debugging

3. Validation Requirements:
   - Cross-reference between sources
   - Character encoding verification
   - Audio quality checks
   - Completeness validation

## Next Steps
1. Start with CSV processing as it contains core metadata
2. Set up database schema
3. Create PDF extraction pipeline
4. Begin audio processing implementation

## Reference Files
- Main project roadmap: ROADMAP.md
- Processing scripts: scripts/*
- Database models: scripts/models.py

## Notes for Future Development
- Keep all raw files in version control
- Document any variant readings or discrepancies
- Consider caching strategy early
- Plan for incremental updates 

## Audio Processing Details
1. Input Format Requirements
   - Preferred: WAV format (16-bit PCM)
   - Acceptable: MP3, AAC (will convert to WAV)
   - Sample rate: 16kHz or higher
   - Channels: Mono preferred for speech processing

2. Audio Processing Pipeline
   - Convert to standard format if needed
   - Split long recordings into verse segments
   - Generate verse-level timestamps
   - Create audio fingerprints for matching
   - Store both raw and processed files

3. Relevant Technologies
   - Wav2Vec2: Pre-trained model for speech recognition
   - Whisper: OpenAI's multilingual speech recognition
   - Montreal Forced Aligner: For text-audio alignment
   - Punjabi ASR models from AI4Bharat
   - Indic-TTS for validation/comparison

4. Text-Audio Alignment Strategy
   - Use forced alignment when timestamps unavailable
   - Generate phonetic representations for matching
   - Consider multiple pronunciation variants
   - Store alignment confidence scores

5. Known Challenges
   - Limited Punjabi-specific speech models
   - Handling different reading styles/speeds
   - Matching across different audio versions
   - Dealing with background sounds/music

6. Useful Resources
   - AI4Bharat Speech Models: https://ai4bharat.org/models
   - Common Voice Punjabi Dataset
   - IIT Madras TTS Project
   - OpenSLR Punjabi Resources

## Future Investigation Needed
1. Evaluate AI4Bharat's Punjabi ASR accuracy
2. Test Montreal Forced Aligner with Gurmukhi
3. Explore fine-tuning Whisper for Punjabi
4. Research Punjabi-specific audio preprocessing 