from sentence_transformers import SentenceTransformer
import numpy as np

class TextEmbeddingGenerator:
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding from text"""
        return self.model.encode(text)
