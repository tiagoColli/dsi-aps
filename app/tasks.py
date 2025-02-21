from app.database import SessionLocal
from app.algorithms import Algorithms
import datetime
import numpy as np
from app.models import Image
import torch
import pandas as pd

def rebuild_image(image_id):
    db = SessionLocal()
    image = db.query(Image).get(image_id)

    image.initial_date = datetime.datetime.now()
    
    H = __open_model(image.model)

    if(image.algorithm == 'cgne'):
        final_image, iterations = Algorithms.cgne(H, image)
    else:
        final_image, iterations = Algorithms.cgnr(H, image)
    
    image.final_image = final_image
    image.iterations = iterations
    image.final_date = datetime.datetime.now()

    db.add(image)
    db.commit()
    
def __open_model(model_name):
    try:
        if(model_name == "H-1"):
            return torch.tensor(pd.read_csv("app/reconstruction_models/H-1.csv", header=None).values, dtype=torch.float32)
        elif(model_name == "H-2"):
            return torch.tensor(pd.read_csv("app/reconstruction_models/H-2.csv", header=None).values, dtype=torch.float32)
    except Exception as e:
        print("ERROR OPENING MODEL ------------", flush=True)
        print(e, flush=True)
