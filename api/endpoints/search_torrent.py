from flask import request, make_response, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from shared.utils import json_utils as JU
from shared.factories import tsearch as ts
import rapidjson as json
import requests

class TorrentSearch(Resource):
    @jwt_required()
    def get(self):
        query = request.args.get('query', None)
        if not query: return JU.make_response("parameter '?query=' required", 400)
        
        try:
            torrents = ts.search(query, max_results=20)
        except Exception as e:
            torrents = []
        
        return make_response(json.dumps(torrents), 200)
    
    @jwt_required()
    def post(self, *args, **kwargs):
        item = JU.extract_keys(request.get_json(), "item")
        if not item: return JU.make_response("invalid data", 400)
        
    
        if "magnet" in item.keys():
            return {"magnet": item.get("magnet")}
        
        magnet = ts.get_magnet(item)
        return {"magnet": magnet}

if __name__ == "__main__":
    print(ts.search("spiderman"))