import faiss
import numpy as np
from rag.embedder import get_embedding

dimension = 384
index = faiss.IndexFlatL2(dimension)

documents = []

def add_to_vector_db(text):

    vector = get_embedding(text)

    index.add(np.array([vector]).astype("float32"))

    documents.append(text)


def search_vector_db(query):

    if len(documents) == 0:
        return []

    vector = get_embedding(query)

    D, I = index.search(np.array([vector]).astype("float32"), 3)

    return [documents[i] for i in I[0]]
