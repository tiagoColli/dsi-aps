from flask import Blueprint, request, jsonify, send_file, Response
from app.database import db
from app.models import User, Image
from app.worker import task_queue
from app.tasks import rebuild_image
import datetime
import numpy as np
import pandas as pd
import os
import base64
import json
import re
from datetime import datetime, timedelta

routes = Blueprint('routes', __name__)

@routes.route("/users", methods=["POST"])
def create_user():
    data = request.json
    new_user = User(name=data["name"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@routes.route("/images", methods=["GET"])
def get_images():
    include_files = request.args.get('include_files', 'false').lower() == 'true'
    images = db.session.query(Image).all()
    
    if include_files:
        result = []
        for image in images:
            image_data = image.to_summary_dict()
            try:
                filename = image.get_image_filename()
                file_path = os.path.join(os.path.dirname(__file__), "results", filename)
                
                if os.path.exists(file_path):
                    with open(file_path, 'rb') as f:
                        image_bytes = f.read()
                        image_data['image_file'] = {
                            'filename': filename,
                            'data': base64.b64encode(image_bytes).decode('utf-8'),
                            'mime_type': 'image/png'
                        }
                else:
                    image_data['image_file'] = None
            except Exception as e:
                image_data['image_file'] = None
            
            result.append(image_data)
        
        return jsonify(result), 200
    else:
        return jsonify([image.to_summary_dict() for image in images]), 200

@routes.route("/images", methods=["POST"])
def create_image():
    data = request.json
    image = db.session.query(Image).filter_by(image_identifier=data["image_identifier"]).first()

    if(image):
        if "signal" not in data:
            return jsonify({"error": "Missing 'signal' field"}), 400
        
        if isinstance(image.signal, list) and isinstance(data["signal"], list):
            image.signal = image.signal + data["signal"]
            print(f"Image piece received for {image.image_identifier}")
        else:
            return jsonify({"error": "Signal type mismatch"}), 400
    else:
        if "signal" not in data:
            return jsonify({"error": "Missing 'signal' field"}), 400
            
        image = Image(user_id=data["user_id"], image_identifier=data["image_identifier"], signal=data["signal"], algorithm=data["algorithm"], model=data["model"], size=data["size"])
        print(f"Image piece received for {image.image_identifier}")

    db.session.add(image)
    db.session.commit()

    if(data["start_reconstruction"]):
        print(f"Starting reconstruction for {image.image_identifier}")
        job = task_queue.enqueue(rebuild_image, image.id, job_timeout=600)
        return jsonify({"message": "Image reconstruction started with success", "job_id": job.id}), 201
    else:
        return jsonify({"message": "Signal saved with success"}), 201

@routes.route("/server-logs", methods=["GET"])
def get_server_logs():
    try:
        minutes = int(request.args.get('minutes', '2'))
        hours = int(request.args.get('hours', '0'))
        days = int(request.args.get('days', '0'))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid time parameters. Use integers for minutes, hours, and days.'}), 400
    
    now = datetime.now()
    start_time = now - timedelta(days=days, hours=hours, minutes=minutes)
    
    log_path = "/app/app/monitoring.log"
    logs = []
    
    try:
        if os.path.exists(log_path):
            with open(log_path, 'r') as f:
                for line in f:
                    match = re.match(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] SYSTEM CPU: ([\d.]+)% \| RAM: ([\d.]+) MB', line.strip())
                    if match:
                        timestamp_str, cpu, ram = match.groups()
                        log_time = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                        
                        if log_time >= start_time:
                            logs.append({
                                'timestamp': timestamp_str,
                                'cpu_percent': float(cpu),
                                'ram_mb': float(ram)
                            })
        
        return jsonify({
            'logs': logs,
            'period': {
                'start_time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': now.strftime('%Y-%m-%d %H:%M:%S'),
                'minutes': minutes,
                'hours': hours,
                'days': days
            },
            'total_entries': len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error reading server logs: {str(e)}'}), 500
