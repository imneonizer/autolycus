from flask import request, make_response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from shared.factories import db, fs, seedr
from shared.utils import json_utils as JU
from models.torrents import Torrent

from collections import namedtuple
import os, shutil

class AddTorrent(Resource):
    @jwt_required()
    def get(self):
        magnet = request.args.get('magnet', None)
        if not magnet: return JU.make_response("parameter '?magnet=' required", 400)
        Hash = seedr.add_magnet(magnet, username=get_jwt_identity())
        if not Hash: return JU.make_response("invalid magnet", 400)
        return make_response({"hash": Hash}, 200)
    
    @jwt_required()
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
    @jwt_required()
    def get(self):
        Hash = request.args.get('hash', None)
        if not Hash: return JU.make_response("parameter '?hash=' required", 400)
        
        # delete torrent if exists in db
        status = seedr.remove_torrent(Hash, username=get_jwt_identity())
        
        # check if torrent still exists on disk
        if not status:
            download_path = os.path.join("/downloads", get_jwt_identity(), Hash)
            if os.path.exists(download_path):
                try:
                    shutil.rmtree(download_path)
                    if not os.path.exists(download_path):
                        status = True
                except: pass
        
        if not status: return JU.make_response(f"torrent '{Hash}' not found", 404)
        return JU.make_response(f"torrent '{Hash}' removed", 200)
    
    @jwt_required()
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
    @jwt_required()
    def get(self):
        Hash = request.args.get('hash', None)
        if not Hash: return make_response({"torrents": seedr.list_torrents(username=get_jwt_identity())}, 200)
        status = seedr.torrent_status(Hash)
        if not status: return JU.make_response(f"torrent '{Hash}' not found", 404)
        return make_response(status, 200)
    
    @jwt_required()
    def post(self):
        hashes = JU.extract_keys(request.get_json(), "hashes")
        if JU.null_values(hashes):
            return JU.make_response("invalid data", 400)
        return make_response({"torrents": seedr.list_torrents(hashes)}, 200)

class FileStructure(Resource):
    @jwt_required()
    def get(self):
        Hash = request.args.get('hash', None)
        if not Hash: return JU.make_response("parameter '?hash=' required", 400)
        
        # check if torrent exists in db
        torrent = Torrent.find_by_hash_and_username(Hash, username=get_jwt_identity())
        
        # check if torrent exists on disk
        if not torrent:
            download_path = os.path.join("/downloads", get_jwt_identity(), Hash)
            if os.path.exists(download_path):
                DummyTorrent = namedtuple('DummyTorrent', ['download_path'])
                torrent = DummyTorrent(download_path)
        
        if not torrent: return JU.make_response("torrent not found", 404)

        structure = fs.json_tree(torrent.download_path)
        if not structure: return JU.make_response("download path error", 404)
        return make_response(structure, 200)