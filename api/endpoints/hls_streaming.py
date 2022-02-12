from flask import request, send_file
from flask_restful import Resource
from shared.utils import json_utils as JU
from models.public_urls import PublicURLS

import time
import os

import base64

class PublicHls(Resource):        
    def get(self, public_url_hash, filename):
        query = PublicURLS.find_by_public_url_hash(public_url_hash=public_url_hash)
        if not query: return JU.make_response(f"url not found", 404)
        if not query.is_valid: return JU.make_response(f"url expired", 410)
        
        file_path = os.path.join(query.file_path, filename)
        if not os.path.exists(file_path): return JU.make_response(f"invalid path: {file_path}", 400)
        
        if request.args.get('download', None):
            return JU.make_response(f"hls needs to be converted to mp4 first", 200)
        
        return send_file(file_path, mimetype='application/octet-stream', attachment_filename=os.path.basename(filename))
    
class PrivateHls(Resource):        
    def get(self, access_token, bs64_file_path, filename):
        file_path = base64.b64decode(bs64_file_path).decode()
        file_path = os.path.join(file_path, filename)
        if not os.path.exists(file_path): return JU.make_response(f"invalid path: {file_path}", 400)
        
        if request.args.get('download', None):
            return JU.make_response(f"hls needs to be converted to mp4 first", 200)
        
        return send_file(file_path, mimetype='application/octet-stream', attachment_filename=os.path.basename(filename))
    