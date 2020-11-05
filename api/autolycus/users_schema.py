from .database import db

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)

    # user imformation
    name = db.Column(db.String)
    username = db.Column(db.String, unique=True)
    email = db.Column(db.String, unique=True)
    email_verified = db.Column(db.Boolean, default=False)
    phone = db.Column(db.String, unique=True)
    email_verified = db.Column(db.Boolean, default=False)
    password = db.Column(db.String)
    created_at = db.Column(db.Integer)
    auth_token = db.Column(db.String)

    @property
    def json(self):
        return {
        "added_time": self.added_time,
        }
        
    def __repr__(self):
       return str(self.json)