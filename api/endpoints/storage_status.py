from flask import request, make_response, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from shared.utils import json_utils as JU
import rapidjson as json
import os
from pathlib import Path

class StorageStatus(Resource):
    @jwt_required
    def get(self):
        username = get_jwt_identity()
        stats = self.status_disk("/downloads/"+username)
        return make_response(json.dumps(stats), 200)
    
    def status_disk(self, folder):
        try:
            disk = os.statvfs(folder)
            # totalSpace = float(disk.f_bsize * disk.f_blocks)
            totalUsedSpace = sum([f.stat().st_size for f in Path(folder).glob("**/*")])
            totalAvailSpaceNonRoot = float(disk.f_bsize * disk.f_bavail)
            # totalAvailSpace = float(disk.f_bsize * disk.f_bfree)
            return {
                'totalBytes': totalAvailSpaceNonRoot,
                'usedBytes': totalUsedSpace,
            }
        except:
            return {'totalBytes': 0, 'usedBytes': 0}