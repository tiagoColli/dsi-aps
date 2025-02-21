from flask import Flask
from app.database import db
from app.config import Config
from app.routes import routes
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # Initialize Flask-Migrate
    migrate = Migrate(app, db)

    app.register_blueprint(routes, url_prefix='/')

    return app
