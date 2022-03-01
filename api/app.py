import os
from flask import Flask, Blueprint
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager

from config import config
from shared.factories import db, cache, migrate, seedr
from shared.logger import logger
from shared.utils import check_db
from models.revoked_tokens import RevokedToken
from models.users import User

from endpoints.torrents import (
    AddTorrent, RemoveTorrent,TorrentStatus,
    FileStructure
)

from endpoints.files import (
    PublicUrl, CopyFile, DeleteFile,
    RenameFile, ConvertMp4toHls, ConvertHlstoMp4
)

from endpoints.ping import Ping
from endpoints.search_torrent import TorrentSearch
from endpoints.storage_status import StorageStatus
from endpoints.hls_streaming import PublicHls, PrivateHls

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
    
    # in production url_prefix is added in nginx config
    url_prefix = "/api" if os.environ.get('FLASK_ENVIRONMENT', 'dev') == 'dev' else "/"    
    app.register_blueprint(api_bp, url_prefix=url_prefix)

    api.add_resource(Ping, '/ping')
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
    api.add_resource(TorrentSearch, '/torrents/search')
    api.add_resource(CopyFile, '/torrents/files/copy-file')
    api.add_resource(DeleteFile, '/torrents/files/delete-file')
    api.add_resource(RenameFile, '/torrents/files/rename-file')
    api.add_resource(ConvertMp4toHls, '/torrents/files/convert-mp4-to-hls')
    api.add_resource(ConvertHlstoMp4, '/torrents/files/convert-hls-to-mp4')

    api.add_resource(PublicUrl, '/public/<string:public_url_hash>')
    api.add_resource(PublicHls, '/public/hls/<string:public_url_hash>/<string:filename>')
    api.add_resource(PrivateHls, '/hls/<string:access_token>/<string:bs64_file_path>/<string:filename>')
    
    api.add_resource(StorageStatus, '/storage-status')

    db.app = app
    db.init_app(app)
    logger.init_app(app)
    cache.init_app(app)
    migrate.init_app(app, db)
    seedr.init_app(app)

    jwt = JWTManager(app)
    
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(header, payload):
        jti = payload['jti']
        return RevokedToken.is_jti_blacklisted(jti)
    
    @jwt.expired_token_loader
    def my_expired_token_callback(header, payload):
        token_type = payload['type']
        return {'message': f'{token_type} token has expired'}, 401
    
    @app.after_request
    def after_request(response):
        response.headers.add('Accept-Ranges', 'bytes')
        return response

    with app.app_context():
        if not check_db(db): exit(1)
        
        # generate admin account
        username = os.environ.get('ADMIN_USERNAME', None)
        password = os.environ.get('ADMIN_PASSWORD', None)
        
        try:
            if username and password:
                new_user = User(name=username, username=username, email=username, password=User.hashify(password))
                new_user.save_to_db()
                app.logger.info(f"user {username} with admin privileges created!")
        except: pass

    return app

config_name = os.environ.get('FLASK_ENVIRONMENT', 'dev')
app = create_app(config_name)

if __name__ == "__main__":
    config = config[config_name]
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)