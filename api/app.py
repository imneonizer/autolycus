from flask import Flask, make_response, request
from autolycus import Autolycus

app = Flask(__name__)
seedr = Autolycus(default_save_path="/downloads")

@app.route("/")
def index():
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
        if not magnets: return make_response({"message": "key: 'magnets' not found in json"}, 400)
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