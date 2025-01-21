"""Database initialization and migration management."""

import os
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from models import Base

def init_database():
    """Initialize the database and create tables."""
    # Get database URL from environment variable or use default
    DATABASE_URL = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/scripture_db'
    )
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        print(f"Created database: {engine.url}")
    
    # Create all tables
    Base.metadata.create_all(engine)
    print("Created all database tables")
    
    return engine

if __name__ == "__main__":
    init_database() 