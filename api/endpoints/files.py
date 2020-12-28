from flask import request, Response, make_response, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jti, decode_token
from flask_restful import Resource

from shared.factories import db, fs
from torrentclient import seedr
from shared.utils import json_utils as JU
from models.torrents import Torrent

import time
import os
import re
import base64

class SendFileByToken(Resource):
    def get(self):
        auth, path = request.args.get("auth"), request.args.get("path")
        if not auth: return JU.make_response("parameter '?auth=' required", 400)
        if not path: return JU.make_response("parameter '?path=' required", 400)
        
        access_token = decode_token(auth)
        if time.time() > access_token.get('exp'): JU.make_response("token expired", 401)

        try:
            path = base64.b64decode(path).decode('utf-8')
        except:
            return JU.make_response("invalid path", 400)
        
        if (not path.startswith("/downloads/{}".format(access_token.get("identity")))) or \
           (not os.path.exists(path)):
            return JU.make_response("invalid path", 400)

        if os.path.isdir(path):
            return JU.make_response("downloading directories not allowed", 400)
        elif os.path.exists(path):
            return send_file(path, mimetype='application/octet-stream', attachment_filename=os.path.basename(path), as_attachment=True)

class StreamFileByToken(Resource):
    def get(self):
        auth, path = request.args.get("auth"), request.args.get("path")
        if not auth: return JU.make_response("parameter '?auth=' required", 400)
        if not path: return JU.make_response("parameter '?path=' required", 400)
        
        access_token = decode_token(auth)
        if time.time() > access_token.get('exp'): JU.make_response("token expired", 401)

        try:
            path = base64.b64decode(path).decode('utf-8')
        except:
            return JU.make_response("invalid path", 400)
        
        if (not path.startswith("/downloads/{}".format(access_token.get("identity")))) or \
           (not os.path.exists(path)):
            return JU.make_response("invalid path", 400)
        
        range_header = request.headers.get('Range', None)
        byte1, byte2 = 0, None
        if range_header:
            match = re.search(r'(\d+)-(\d*)', range_header)
            groups = match.groups()

            if groups[0]:
                byte1 = int(groups[0])
            if groups[1]:
                byte2 = int(groups[1])

        chunk, start, length, file_size = self.get_chunk(path, byte1, byte2)
        resp = Response(chunk, 206, mimetype='video/mp4',
                        content_type='video/mp4', direct_passthrough=True)
        resp.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(start, start + length - 1, file_size))
        return resp
    
    def get_chunk(self, full_path, byte1=None, byte2=None):
        file_size = os.stat(full_path).st_size
        start = 0
        length = 102400

        if byte1 < file_size:
            start = byte1
        if byte2:
            length = byte2 + 1 - byte1
        else:
            length = file_size - start

        with open(full_path, 'rb') as f:
            f.seek(start)
            chunk = f.read(length)

        return chunk, start, length, file_size