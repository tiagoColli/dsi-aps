from app.database import db
from sqlalchemy import ARRAY

class User(db.Model):
    __tablename__ = 'users'  

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}
    
class Image(db.Model):
    __tablename__ = 'images'  
    
    id = db.Column(db.Integer, primary_key=True)
    image_identifier = db.Column(db.String(100), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    signal = db.Column(db.PickleType, nullable=False)
    algorithm = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    initial_date = db.Column(db.DateTime, nullable=True)
    final_date = db.Column(db.DateTime, nullable=True)
    size = db.Column(db.Integer, nullable=False)
    iterations = db.Column(db.String(100), nullable=True)
    final_image = db.Column(db.PickleType, nullable=True)

    user = db.relationship("User", backref=db.backref("images", uselist=True))

    def get_image_filename(self):
        """Generate the expected filename for this image"""
        return f"{self.image_identifier}_{self.algorithm}_{self.model}.png"

    def to_dict(self):
        return {
            "id": self.id, 
            "image_identifier": self.image_identifier, 
            "user": self.user.to_dict() if self.user else None, 
            "signal": self.signal, 
            "algorithm": self.algorithm, 
            "model": self.model, 
            "initial_date": self.initial_date, 
            "final_date": self.final_date, 
            "size": self.size, 
            "iterations": self.iterations,
            "final_image": self.final_image
        }

    def to_summary_dict(self):
        return {
            "id": self.id,
            "image_identifier": self.image_identifier,
            "user": self.user.to_dict() if self.user else None,
            "algorithm": self.algorithm,
            "model": self.model,
            "initial_date": self.initial_date,
            "final_date": self.final_date,
            "size": self.size,
            "iterations": self.iterations
        }
