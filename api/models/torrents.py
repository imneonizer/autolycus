from shared.factories import db
from psycopg2 import OperationalError, errorcodes, errors
from flask import current_app

class Torrent(db.Model):
    __tablename__ = 'torrents'
    id = db.Column(db.Integer, primary_key=True)

    # Torrent related information
    name = db.Column(db.String)
    added_time = db.Column(db.Integer) # epoch time
    download_path = db.Column(db.String)
    magnet = db.Column(db.String)
    Hash = db.Column(db.String)
    username = db.Column(db.String)

    # File size related information
    total_bytes = db.Column(db.BigInteger) #Bytes
    downloaded_bytes = db.Column(db.BigInteger) #Bytes

    # connection related information
    num_connections = db.Column(db.Integer)
    num_peers = db.Column(db.Integer)
    num_seeds = db.Column(db.Integer)
    num_trackers = db.Column(db.Integer)

    # speed related information
    upload_speed = db.Column(db.Integer) #Bytes/s
    download_speed = db.Column(db.Integer) #Bytes/s

    # Progress related information
    queue_position = db.Column(db.Integer)
    progress = db.Column(db.Integer)
    is_paused = db.Column(db.Boolean)
    is_finished = db.Column(db.Boolean)

    @classmethod
    def find_by_hash(self, Hash):
        return self.query.filter_by(Hash=Hash).first()
    
    @classmethod
    def find_by_username(self, username):
        return self.query.filter_by(username=username)
    
    @classmethod
    def find_by_magnet(self, magnet):
        return self.query.filter_by(magnet=magnet).first()
    
    @classmethod
    def find_by_hash_and_username(self, Hash, username):
        torrent = None
        try:
            torrent = self.query.filter_by(Hash=Hash).first()
            if not torrent.username == username:
                torrent = None
        except Exception as e:
            print(e)
        return torrent

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def update_to_db(self, Hash, fields, synchronize_session = False):
        torrent = Torrent.query.filter_by(Hash=Hash).update(fields)
        try:
            db.session.commit()
        except Exception as e:
            current_app.logger.error(e)
            
    @property
    def JSON(self):
        return {
        "added_time": self.added_time,
        "download_path": self.download_path,
        "download_speed": self.download_speed,
        "downloaded_bytes": self.downloaded_bytes,
        "hash": self.Hash,
        "magnet": self.magnet,
        "is_finished": self.is_finished,
        "is_paused": self.is_paused,
        "name": self.name,
        "username": self.username,
        "num_connections": self.num_connections,
        "num_peers": self.num_peers,
        "num_seeds": self.num_seeds,
        "num_trackers": self.num_trackers,
        "progress": self.progress,
        "queue_position": self.queue_position,
        "total_bytes": self.total_bytes,
        "upload_speed": self.upload_speed
        }
        
    def __repr__(self):
       return str(self.JSON)

if __name__ == "__main__":
    print(Torrent.query.all())