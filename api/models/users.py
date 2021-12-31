import time
from shared.factories import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String, unique=True)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Integer, default=int(time.time()))
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)

    @classmethod
    def find_by_username(self, username):
        return self.query.filter_by(username=username).first()
    
    @classmethod
    def find_by_email(self, email):
        return self.query.filter_by(email=email).first()

    @staticmethod
    def verify(original_password, input_password):
        return check_password_hash(original_password, input_password)

    @staticmethod
    def hashify(password):
        return generate_password_hash(password, method='sha256')
    
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    @property
    def JSON(self):
        return {
        "name": self.name,
        "username": self.username,
        "email": self.email,
        "phone": self.phone,
        "created_at": self.created_at,
        "email_verified": self.email_verified,
        "phone_verified": self.phone_verified
        }

    def __repr__(self):
       return str(self.JSON)