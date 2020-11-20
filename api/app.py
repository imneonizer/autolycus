from flask import Flask, Blueprint
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager

from config import config
from shared.factories import db
from shared.factories import cache
from shared.logger import logger
from shared.utils import check_db
from models.revoked_tokens import RevokedToken

from endpoints.torrents import (
    AddTorrent, RemoveTorrent,TorrentStatus,
    FileStructure
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
    api.add_resource(DeleteAccount, '/auth/delete-acount')

    api.add_resource(TokenRefresh, '/auth/refresh-token')
    api.add_resource(RevokeAccessToken, '/auth/revoke-access-token')
    api.add_resource(RevokeRefreshToken, '/auth/revoke-refresh-token')

    api.add_resource(AddTorrent, '/torrents/add')
    api.add_resource(RemoveTorrent, '/torrents/remove')
    api.add_resource(TorrentStatus, '/torrents/status')
    
    api.add_resource(FileStructure, '/torrents/files')
    
    db.app = app
    db.init_app(app)
    logger.init_app(app)
    cache.init_app(app)

    jwt = JWTManager(app)
    
    @jwt.token_in_blacklist_loader
    def check_if_token_in_blacklist(decrypted_token):
        jti = decrypted_token['jti']
        return RevokedToken.is_jti_blacklisted(jti)
    
    @jwt.expired_token_loader
    def my_expired_token_callback(expired_token):
        token_type = expired_token['type']
        return {'message': 'token has expired'}, 401

    with app.app_context():
        if not check_db(db): exit(1)

    return app

app = create_app("dev")

if __name__ == "__main__":
    config = config["dev"]
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)

# {
#   "magnets": [
#     "magnet:?xt=urn:btih:123C7F0673A0EC7447B874FCE624898045CA91FC&dn=Win+Rar+v3.80+Pro+no+Cerial+Needed&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce",
#     "magnet:?xt=urn:btih:bb9a6234cc6fefbc2e50f3775c61d59fc5e767ea&dn=The+English+Tenses+Exercise+Book&xl=1323682&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2F9.rarbg.to:2710/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.uw0.xyz:6969/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announc4&tr=udp%3A%2F%2Fzephir.monocul.us:6969/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451/announce&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Ftracker.zum.bi:6969/announce&tr=udp%3A%2F%2Fopentracker.i2p.rocks:6969/announce"
#   ]
# }