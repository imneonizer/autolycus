from flask import Flask, make_response, request
from autolycus import Autolycus

app = Flask(__name__)
seedr = Autolycus(default_path="/tmp")

@app.route("/")
def index():
    return make_response({"message": "success"}, 200)

@app.route("/add", methods=["POST"])
def add():
    magnet = request.get_json().get("magnet", None)
    if magnet:
        message, code = seedr.add_magnet_uri(magnet)
        return make_response({"message": message }, code)
    return make_response({"message": "bad request"}, 400)

@app.route("/remove", methods=["DELETE"])
def delete():
    magnet = request.get_json().get("magnet", None)
    if magnet:
        message, code = seedr.remove_torrent(magnet)
        return make_response({"message": message}, code)
    return make_response({"message": "bad request"}, 400)

@app.route("/status", methods=["POST"])
def status():
    magnet = request.get_json().get("magnet", None)
    if magnet:
        JSON, code = seedr.torrent_status(magnet)
        return make_response(JSON, code)
    return make_response({"message": "bad request"}, 400)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)