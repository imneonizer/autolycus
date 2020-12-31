from flask import request, Response, make_response, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jti, decode_token
from flask_restful import Resource

from shared.factories import db, fs
from torrentclient import seedr
from shared.utils import json_utils as JU
from models.torrents import Torrent
from models.users import User
from models.public_urls import PublicURLS

import time
import os
import re
import base64
import hashlib
import mimetypes

class PublicUrl(Resource):
    @jwt_required
    def post(self, *args, **kwargs):
        file_path = JU.extract_keys(request.get_json(), "file_path")
        if not file_path: return JU.make_response("invalid data", 400)

        username = get_jwt_identity()
        user = User.find_by_username(username)
        if not user: return JU.make_response(f"user '{username}' doesn't exists", 404)

        if os.path.exists(file_path):
            record = PublicURLS.find_by_file_path(file_path=file_path)
            if record: return record.as_dict()

            created_at = int(time.time())
            
            file_path_hash = hashlib.sha1(str(file_path).encode()).hexdigest()[:10]
            expire_after = int(current_app.config.get('PUBLIC_URL_EXPIRES').total_seconds())
            record = PublicURLS(file_path=file_path, public_url_hash=file_path_hash, username=username, created_at=created_at, expire_after=expire_after)
            record.save_to_db()
            return record.as_dict()
        else:
            return JU.make_response(f"file '{file_path}' doesn't exists", 404)
    
    def get(self, public_url_hash):
        query = PublicURLS.find_by_public_url_hash(public_url_hash=public_url_hash)
        stream = True if request.args.get('stream', None) else False
        if not query: return JU.make_response(f"url not found", 404)
        if not query.is_valid: return JU.make_response(f"url expired", 410)

        return self.send_file(query.file_path, stream)
    
    def send_file(self, path, stream=False):
        if not os.path.exists(path):
            return JU.make_response("invalid path", 400)
            
        elif os.path.isdir(path):
            return JU.make_response("downloading directories not allowed", 400)

        elif os.path.exists(path):

            if stream:
                range_header = request.headers.get('Range', None)
                byte1, byte2 = 0, None
                if range_header:
                    match = re.search(r'(\d+)-(\d*)', range_header)
                    groups = match.groups()

                    if groups[0]:
                        byte1 = int(groups[0])
                    if groups[1]:
                        byte2 = int(groups[1])

                mimetype = mimetypes.guess_type(path)
                chunk, start, length, file_size = self.get_chunk(path, byte1, byte2)
                resp = Response(chunk, 206, mimetype=mimetype,
                                content_type=mimetype, direct_passthrough=True)
                resp.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(start, start + length - 1, file_size))
                return resp

            else:
                return send_file(path, mimetype='application/octet-stream', attachment_filename=os.path.basename(path), as_attachment=True)

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