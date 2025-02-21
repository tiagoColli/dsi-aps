from flask import Blueprint, request, jsonify
from app.database import db
from app.models import User, Image
from app.worker import task_queue
from app.tasks import rebuild_image
import datetime
import numpy as np
import pandas as pd

routes = Blueprint('routes', __name__)

# Create a new user
@routes.route("/users", methods=["POST"])
def create_user():
    data = request.json
    new_user = User(name=data["name"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

# Create new image entry
@routes.route("/images", methods=["POST"])
def create_image():
    data = request.json

    image = db.session.query(Image).filter_by(image_identifier=data["image_identifier"]).first()
    

    if(image):
        print("------- SINGAL BEFORE --------")
        print(len(image.signal))
        image.signal = image.signal + data["signal"]
    else:
        image = Image(user_id=data["user_id"], image_identifier=data["image_identifier"], signal=data["signal"], algorithm=data["algorithm"], model=data["model"], size=data["size"])

    print("------- SINGAL AFTER --------")
    print(type(image.signal))
    print(len(image.signal))

    db.session.add(image)
    db.session.commit()

    if(data["start_reconstruction"]):
        job = task_queue.enqueue(rebuild_image, image.id, job_timeout=600)
        return jsonify({"message": "Image reconstruction started with success"}), 201
    else:
        return jsonify({"message": "Signal saved with success"}), 201
