import time
from shared.factories import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String)
    username = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    created_at = db.Column(db.Integer)

    @staticmethod
    def filter_by_username(username):
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_time():
        return int(time.time())

    @staticmethod
    def verify(original_password, input_password):
        return check_password_hash(original_password, input_password)

    @staticmethod
    def hashify(password):
        return generate_password_hash(password, method='sha256')

    @property
    def JSON(self):
        return {
        "name": self.name,
        "username": self.username,
        "password": self.password,
        "created_at": self.created_at
        }

    def __repr__(self):
       return str(self.JSON)