from flask import request, make_response, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from shared.utils import json_utils as JU
import rapidjson as json
import os
from pathlib import Path
import shutil

class StorageStatus(Resource):
    @jwt_required()
    def get(self):
        username = get_jwt_identity()
        stats = self.status_disk("/downloads/"+username)
        return make_response(json.dumps(stats), 200)
    
    def status_disk(self, folder):
        try:            
            total_storage_size = shutil.disk_usage("/").total
            space_used_by_all_user = shutil.disk_usage("/").used
            space_used_by_current_user = sum([f.stat().st_size for f in Path(folder).glob("**/*")])            
            available_free_space = total_storage_size - space_used_by_all_user + space_used_by_current_user
            return {
                'totalBytes': available_free_space,
                'usedBytes': space_used_by_current_user,
                'driveCapacity': total_storage_size
            }
        except:
            return {'totalBytes': 0, 'usedBytes': 0, 'driveCapacity': 0}