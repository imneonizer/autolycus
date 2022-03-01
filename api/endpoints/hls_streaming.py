from flask import request, send_file
from flask_restful import Resource
from shared.utils import json_utils as JU
from models.public_urls import PublicURLS
from shared.hls_converter import hls

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
            if os.path.exists(file_path):
                output_file = os.path.join(os.path.dirname(os.path.dirname(file_path)), os.path.splitext(os.path.basename(file_path))[0]+".mp4")
                output_file = hls.convert_to_mp4(file_path, output_file)
            
            if output_file:
                return send_file(output_file, mimetype='application/octet-stream', attachment_filename=os.path.basename(output_file), as_attachment=True)
            else:
                return JU.make_response("conversion error", 400)
        
        return send_file(file_path, mimetype='application/octet-stream', attachment_filename=os.path.basename(filename))
    
class PrivateHls(Resource):        
    def get(self, access_token, bs64_file_path, filename):
        file_path = base64.b64decode(bs64_file_path).decode()
        file_path = os.path.join(file_path, filename)
        if not os.path.exists(file_path): return JU.make_response(f"invalid path: {file_path}", 400)
        
        if request.args.get('download', None):
            return JU.make_response(f"hls needs to be converted to mp4 first", 200)
        
        return send_file(file_path, mimetype='application/octet-stream', attachment_filename=os.path.basename(filename))
    