import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# Paths
base_path = os.path.abspath(os.path.dirname(__file__))
sqlite_url = 'sqlite:///' + base_path + '/StatusOfServerServices.db'

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret!@#'

db = SQLAlchemy(app)
ma = Marshmallow(app)
