from shared.factories import db
from shared.factories import cache
from sqlalchemy import event
import time

class PublicURLS(db.Model):
    __tablename__ = 'public_urls'
    id = db.Column(db.Integer, primary_key = True)
    public_url_hash = db.Column(db.String, unique=True)
    file_path = db.Column(db.String)
    username = db.Column(db.String)
    created_at = db.Column(db.Integer)
    expire_after = db.Column(db.Integer, default=60*60*24*7) # 1 week

    @classmethod
    # @cache.memoize()
    def find_by_public_url_hash(self, public_url_hash):
        query = self.query.filter_by(public_url_hash=public_url_hash).first()
        return query
    
    @classmethod
    def find_by_file_path(self, file_path):
        query = self.query.filter_by(file_path=file_path).first()
        if query:
            if query.is_valid:
                return query
            else:
                query.delete_from_db()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()
    
    def as_dict(self):
        return dict(
            public_url_hash = self.public_url_hash,
            file_path = self.file_path,
            username = self.username,
            created_at = self.created_at,
            expire_after = self.expire_after
        )

    @property
    def is_valid(self):
        return time.time() - self.created_at < self.expire_after

    @classmethod
    @cache.memoize()
    def is_jti_blacklisted(self, jti):
        query = self.query.filter_by(jti=jti).first()
        return bool(query)

# @event.listens_for(PublicURLS, 'after_insert')
# def execute_when_token_revoked(mapper, connection, target):
#     cache.delete_memoized(RevokedToken.is_jti_blacklisted, RevokedToken, target.jti)