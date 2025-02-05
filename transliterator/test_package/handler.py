import os
import sys

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from api.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="auto") 