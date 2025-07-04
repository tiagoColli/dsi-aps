from app.database import SessionLocal
from app.algorithms import Algorithms
import datetime
import numpy as np
from app.models import Image
import torch
import pandas as pd
from app.image_saver import save_reconstructed_image

def rebuild_image(image_id):
    db = SessionLocal()
    image = db.query(Image).get(image_id)

    image.initial_date = datetime.datetime.now()
    
    H = __open_model(image.model)
    g = torch.tensor(image.signal, dtype=torch.float32).reshape(-1, 1)

    if(image.algorithm == 'cgne'):
        final_image, iterations = Algorithms.cgne(H, g)
    else:
        final_image, iterations = Algorithms.cgnr(H, g)
    
    image.final_image = final_image
    image.iterations = iterations
    image.final_date = datetime.datetime.now()

    save_reconstructed_image(image, final_image)

    db.add(image)
    db.commit()
    
    print(f"Finished reconstruction for {image.image_identifier}")
    
def __open_model(model_name):
    try:
        if(model_name == "H-1"):
            return torch.tensor(pd.read_csv("app/reconstruction_models/H-1.csv", header=None).values, dtype=torch.float32)
        elif(model_name == "H-2"):
            return torch.tensor(pd.read_csv("app/reconstruction_models/H-2.csv", header=None).values, dtype=torch.float32)
    except Exception as e:
        print(f"Error opening model {model_name}: {e}")
