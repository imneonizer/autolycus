from flask import request, make_response, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jti, decode_token
from flask_restful import Resource

from shared.factories import db, fs
from torrentclient import seedr
from shared.utils import json_utils as JU
from models.torrents import Torrent

import time
import os
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
            return JU.make_response("this is a directory's path", 400)
        elif os.path.exists(path):
            return send_file(path, mimetype='application/octet-stream', attachment_filename=os.path.basename(path), as_attachment=True)


#http://localhost:5000/api/torrent-files?path=L2Rvd25sb2Fkcy9yYWkvOTZiZjUyOWEwYjg3NWVkOTZkNDA2MTYyMzAyNjcwM2QyM2NiN2Y5OC9MYXhtaWkgQm9tYiAoMjAyMCkgSGluZGkgNzIwcCBXRUJETCB4MjY0IEFBQy4gRVN1Yi5ta3Y=&auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDYzOTE4MDQsIm5iZiI6MTYwNjM5MTgwNCwianRpIjoiMDAyYzY4ZWUtZmFmZi00ODFiLTlmNGMtYmUwMTg3YjVmZGNjIiwiZXhwIjoxNjA2Mzk1NDA0LCJpZGVudGl0eSI6InJhaSIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.zyEcvFxozuavTJv3074VZ139B1Q-9eDZIlyAFpHstV0