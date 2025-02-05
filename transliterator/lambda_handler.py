import os
import sys

from transliterator.api.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="auto")