from flask import Flask, make_response, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from autolycus import Autolycus
from autolycus.config import config
from autolycus.database import db
from autolycus.users_schema import User
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = config['URI']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

db.init_app(app)
with app.app_context(): db.create_all()
seedr = Autolycus(app=app, db=db, default_save_path=config['DEFAULT_SAVE_PATH'])

@app.route("/")
def index():
    return make_response({"message": "success"}, 200)

@app.route("/api/signup", methods=['POST'])
def signup ():
    JSON = request.get_json()
    email = JSON.get('email', None)
    phone = JSON.get('phone', None)
    name = JSON.get('name', None)
    username = JSON.get('username', None)
    password = JSON.get('password', None)

    user = User.query.filter_by(email=email).first()
    if user: return make_response({"message": "user already exists"}, 403)
    
    auth_token = secrets.token_urlsafe(100)
    new_user = User(
        name=name,
        username=username,
        email=email,
        phone=phone,
        auth_token=auth_token,
        password=generate_password_hash(password, method='sha256'))
    db.session.add(new_user)
    db.session.commit()
    return make_response({"message": "success"}, 200)

@app.route("/api/login", methods=["POST"])
def login():
    JSON = request.get_json()
    username = JSON.get('username', None)
    password = JSON.get('password', None)
    remember = True if JSON.get('remember', None) else False

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return make_response({"message": "invalid credentials"}, 401)
    return make_response({"auth_token": user.auth_token}, 200)

@app.route("/api/logout", methods=["POST"])
def logout():
    JSON = request.get_json()
    username = JSON.get('username', None)
    user = User.query.filter_by(username=username).first()
    if not user: return make_response({"message": "no such username exists"}, 403)
    
    auth_token = secrets.token_urlsafe(100)
    db.session.query(User).filter(User.username == username).update(dict(auth_token=auth_token))
    db.session.commit()
    return make_response({"message": "success"}, 200)

@app.route("/api/add", methods=["GET", "POST"])
def add_torrent():
    if request.method == "GET":
        magnet = request.args.get('magnet', None)
        if not magnet: return make_response({"message": "parameter: '?magnet=' not found"}, 400)
        Hash = seedr.add_magnet(magnet)
        if not Hash: return make_response({"message": "invalid magnet"}, 400)
        return make_response({"hash": Hash}, 200)
    
    elif request.method == "POST":
        magnets = request.get_json().get("magnets", None)
        if (not magnets) or (not isinstance(magnets, list)): return make_response({"message": "magnets not found in json"}, 400)
        hashes = []
        for magnet in magnets:
            Hash = seedr.add_magnet(magnet)
            if not Hash: continue
            hashes.append(Hash)
        return make_response({"hash": hashes}, 200)

@app.route("/api/remove", methods=["GET", "DELETE"])
def remove_torrent():
    if request.method == "GET":
        Hash = request.args.get('hash', None)
        if not Hash: return make_response({"message": "parameter: '?hash=' not found"}, 400)
        status = seedr.remove_torrent(Hash)
        if not status: return make_response({"message": "not found: {}".format(Hash)}, 404)
        return make_response({"removed": Hash}, 200)

    elif request.method == "DELETE":
        hashes = request.get_json().get("hashes", None)
        if not hashes: return make_response({"message": "key: 'hashes' not found in json"}, 400)
        removed = []
        for Hash in hashes:
            status = seedr.remove_torrent(Hash)
            if not status: continue
            removed.append(Hash)
        return make_response({"removed": removed}, 200)

@app.route("/api/status", methods=["GET", "POST"])
def torrent_status():
    if request.method == "GET":
        Hash = request.args.get('hash', None)
        if not Hash: return make_response({"torrents": seedr.list_torrents()}, 200)
        status = seedr.torrent_status(Hash)
        if not status: return make_response({"message": "not found: {}".format(Hash)}, 404)
        return make_response(status, 200)
    
    elif request.method == "POST":
        hashes = request.get_json().get("hashes", None)
        if not hashes: return make_response({"message": "key: 'hashes' not found in json"}, 400)
        return make_response({"torrents": seedr.list_torrents(hashes)}, 200)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

# {
#   "magnets": [
#     "magnet:?xt=urn:btih:123C7F0673A0EC7447B874FCE624898045CA91FC&dn=Win+Rar+v3.80+Pro+no+Cerial+Needed&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce",
#     "magnet:?xt=urn:btih:bb9a6234cc6fefbc2e50f3775c61d59fc5e767ea&dn=The+English+Tenses+Exercise+Book&xl=1323682&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2F9.rarbg.to:2710/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.uw0.xyz:6969/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announc4&tr=udp%3A%2F%2Fzephir.monocul.us:6969/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451/announce&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Ftracker.zum.bi:6969/announce&tr=udp%3A%2F%2Fopentracker.i2p.rocks:6969/announce"
#   ]
# }