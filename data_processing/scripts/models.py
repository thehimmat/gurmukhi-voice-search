"""
SQLAlchemy models for scripture database.

TODO:
1. Define Scripture model
2. Define Ang model
3. Define Verse model
4. Define Translation model
5. Define Audio model
6. Define Embedding model
7. Set up relationships between models
8. Add indexes for common queries
"""

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, DateTime, Enum, Float
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class ScriptureType(enum.Enum):
    """Types of scriptures we might handle"""
    SGGS = "Sri Guru Granth Sahib"
    DASAM = "Dasam Granth"
    SARBLOH = "Sarbloh Granth"

class Scripture(Base):
    """Base model for different scriptures"""
    __tablename__ = 'scriptures'
    
    id = Column(Integer, primary_key=True)
    type = Column(Enum(ScriptureType), nullable=False)
    name = Column(String(255), nullable=False)
    total_angs = Column(Integer, nullable=False)  # Changed from total_pages
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    angs = relationship("Ang", back_populates="scripture")  # Changed from pages

class Ang(Base):  # Changed from Page
    """Model for scripture angs"""
    __tablename__ = 'angs'  # Changed from pages
    
    id = Column(Integer, primary_key=True)
    scripture_id = Column(Integer, ForeignKey('scriptures.id'), nullable=False)
    ang_number = Column(Integer, nullable=False)  # Changed from page_number
    header = Column(Text)
    footer = Column(Text)
    
    # Relationships
    scripture = relationship("Scripture", back_populates="angs")  # Changed from pages
    verses = relationship("Verse", back_populates="ang")  # Changed from page

class Verse(Base):
    """Model for individual verses"""
    __tablename__ = 'verses'
    
    id = Column(Integer, primary_key=True)
    ang_id = Column(Integer, ForeignKey('angs.id'), nullable=False)  # Changed from page_id
    verse_number = Column(Integer, nullable=False)
    gurmukhi_unicode = Column(Text, nullable=False)
    gurmukhi_legacy = Column(Text)
    
    # Metadata
    raag = Column(String(255))
    author = Column(String(255))
    line_type = Column(String(255))
    
    # Embeddings for search
    text_embedding = Column(ARRAY(Float))
    
    # Relationships
    ang = relationship("Ang", back_populates="verses")  # Changed from page
    translations = relationship("Translation", back_populates="verse")
    audio_segments = relationship("AudioSegment", back_populates="verse") 