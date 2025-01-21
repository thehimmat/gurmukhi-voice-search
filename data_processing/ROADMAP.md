# Project Roadmap

## Data Sources
1. Audio Files
   - Multiple ang recordings to be split into verses
   - Need to handle multiple readers/versions
   - Will need timestamp/silence detection for splitting

2. Text Sources
   - Legacy Gurmukhi PDF (with formatting to clean)
   - Unicode Gurmukhi PDF
   - CSV with metadata, translations, transliterations
   - Future: Additional translations and commentaries

## Database Design (PostgreSQL)
1. Core Tables
   - scriptures (SGGS, Dasam Granth, etc.)
   - angs (correct terminology for pages)
   - verses
   - translations
   - commentaries
   - audio_segments
   - embeddings
   - metadata

2. Key Features
   - Full-text search support
   - Vector storage for embeddings
   - Unicode character handling
   - Version control for content

## Processing Pipeline
1. Text Processing
   - PDF extraction and cleaning
   - Character encoding validation
   - Structure detection (angs/verses)
   - Translation mapping

2. Audio Processing
   - File splitting
   - Quality validation
   - Metadata extraction
   - Multiple reader support

3. Data Validation
   - Cross-reference checking
   - Completeness verification
   - Character encoding validation
   - Audio quality checks

## Implementation Order
1. Phase 1: Basic Infrastructure
   - Set up database schema
   - Implement basic PDF processing
   - Create CSV import pipeline

2. Phase 2: Core Content
   - Process legacy Gurmukhi text
   - Process Unicode text
   - Import translations
   - Basic validation

3. Phase 3: Audio Integration
   - Implement audio splitting
   - Add audio metadata
   - Link audio to verses

4. Phase 4: Advanced Features
   - Generate embeddings
   - Implement search
   - Add version control
   - Enhanced validation

## Future Considerations
- Additional scripture texts
- More translations/commentaries
- Multiple audio versions
- Enhanced search capabilities
- API integration
- Backup/restore procedures

## Notes
- All processors should support incremental updates
- Need to maintain data integrity across sources
- Consider caching for performance
- Plan for scalability
- Keep validation rules configurable 