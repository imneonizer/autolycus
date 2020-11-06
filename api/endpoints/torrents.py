from flask import request, make_response, current_app
from flask_restful import Resource

from shared.factories import db
from shared.factories import seedr
from shared.utils import json_utils as JU
from models.torrents import Torrent

class AddTorrent(Resource):
    def get(self):
        magnet = request.args.get('magnet', None)
        if not magnet: return JU.make_response("parameter '?magnet=' required", 400)
        Hash = seedr.add_magnet(magnet)
        if not Hash: return JU.make_response("invalid magnet", 400)
        return make_response({"hash": Hash}, 200)
    
    def post(self):
        magnets = JU.extract_keys(request.get_json(), "magnets")
        if JU.null_values(magnets):
            return JU.make_response("invalid data", 400)

        hashes = []
        for magnet in magnets:
            Hash = seedr.add_magnet(magnet)
            if not Hash: continue
            hashes.append(Hash)
        return make_response({"hashes": hashes}, 200)

class RemoveTorrent(Resource):
    def get(self):
        Hash = request.args.get('hash', None)
        if not Hash: return JU.make_response("parameter '?hash=' required", 400)
        status = seedr.remove_torrent(Hash)
        if not status: return JU.make_response(f"hash '{Hash}' not found", 404)
        return JU.make_response(f"hash '{Hash}' removed", 200)
    
    def post(self):
        hashes = JU.extract_keys(request.get_json(), "hashes")
        if JU.null_values(hashes):
            return JU.make_response("invalid data", 400)

        removed = []
        for Hash in hashes:
            status = seedr.remove_torrent(Hash)
            if not status: continue
            removed.append(Hash)
        return make_response({"removed": removed}, 200)

class TorrentStatus(Resource):
    def get(self):
        Hash = request.args.get('hash', None)
        if not Hash: return make_response({"torrents": seedr.list_torrents()}, 200)
        status = seedr.torrent_status(Hash)
        if not status: return JU.make_response(f"hash '{Hash}' not found", 404)
        return make_response(status, 200)
    
    def post(self):
        hashes = JU.extract_keys(request.get_json(), "hashes")
        if JU.null_values(hashes):
            return JU.make_response("invalid data", 400)
        return make_response({"torrents": seedr.list_torrents(hashes)}, 200)