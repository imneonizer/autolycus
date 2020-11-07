from shared.factories import db
from shared.factories import cache
from sqlalchemy import event

class RevokedToken(db.Model):
    __tablename__ = 'revoked_tokens'
    id = db.Column(db.Integer, primary_key = True)
    jti = db.Column(db.String(120))
    
    def add(self):
        if not self.is_jti_blacklisted(self.jti):
            db.session.add(self)
            db.session.commit()
    
    @classmethod
    @cache.memoize()
    def is_jti_blacklisted(self, jti):
        query = self.query.filter_by(jti=jti).first()
        return bool(query)

@event.listens_for(RevokedToken, 'after_insert')
def execute_when_token_revoked(mapper, connection, target):
    cache.delete_memoized(RevokedToken.is_jti_blacklisted, RevokedToken, target.jti)