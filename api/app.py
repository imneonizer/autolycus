from flask import Flask, Blueprint
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager

from config import config
from shared.factories import db, cache, migrate
from shared.logger import logger
from shared.utils import check_db
from models.revoked_tokens import RevokedToken

from endpoints.torrents import (
    AddTorrent, RemoveTorrent,TorrentStatus,
    FileStructure
)

from endpoints.files import (
    PublicUrl
)

from endpoints.auth import (
    UserExists, EmailExists, Signup, Login,
    Logout, RevokeAccessToken, RevokeRefreshToken,
    DeleteAccount, UserDetails, TokenRefresh
)

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    CORS(app)

    api_bp = Blueprint('api', __name__)
    api = Api(api_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    api.add_resource(Signup, '/auth/signup')
    api.add_resource(Login, '/auth/login')
    api.add_resource(Logout, '/auth/logout')
    api.add_resource(UserExists, '/auth/user-exists')
    api.add_resource(EmailExists, '/auth/email-exists')
    api.add_resource(UserDetails, '/auth/user-details')
    api.add_resource(DeleteAccount, '/auth/delete-account')

    api.add_resource(TokenRefresh, '/auth/refresh-token')
    api.add_resource(RevokeAccessToken, '/auth/revoke-access-token')
    api.add_resource(RevokeRefreshToken, '/auth/revoke-refresh-token')

    api.add_resource(AddTorrent, '/torrents/add')
    api.add_resource(RemoveTorrent, '/torrents/remove')
    api.add_resource(TorrentStatus, '/torrents/status')
    
    api.add_resource(FileStructure, '/torrents/files')
    api.add_resource(PublicUrl, '/public/<string:public_url_hash>')

    db.app = app
    db.init_app(app)
    logger.init_app(app)
    cache.init_app(app)
    migrate.init_app(app, db)

    jwt = JWTManager(app)
    
    @jwt.token_in_blacklist_loader
    def check_if_token_in_blacklist(decrypted_token):
        jti = decrypted_token['jti']
        return RevokedToken.is_jti_blacklisted(jti)
    
    @jwt.expired_token_loader
    def my_expired_token_callback(expired_token):
        token_type = expired_token['type']
        return {'message': 'token has expired'}, 401
    
    @app.after_request
    def after_request(response):
        response.headers.add('Accept-Ranges', 'bytes')
        return response

    with app.app_context():
        if not check_db(db): exit(1)

    return app

app = create_app("dev")

if __name__ == "__main__":
    config = config["dev"]
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)