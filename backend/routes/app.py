from flask import Flask
from flask_cors import CORS
from db import db
from routes.questionnaire import questionnaire_bp 

app = Flask(__name__)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///techprep.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

# Initialize database
db.init_app(app)

# Register routes
app.register_blueprint(questionnaire_bp, url_prefix='/api')

# Create tables
with app.app_context():
    db.create_all()

# Run the server
if __name__ == '__main__':
    app.run(debug=True)
