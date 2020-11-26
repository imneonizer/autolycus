import os
import glob
import json

class FileSystem:

    def json_tree(self, path):
        try:
            def path_to_dict(path):
                d = {'name': os.path.basename(path)}
                if os.path.isdir(path):
                    d['type'] = "directory"
                    d['path'] = os.path.realpath(path)
                    d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir(path)]
                else:
                    d['type'] = "file"
                    d['path'] = os.path.realpath(path)
                    d['ext'] = os.path.splitext(path)[1]
                    d['size'] = os.stat(path).st_size
                return d

            return json.dumps(path_to_dict(glob.glob(path+"/*")[0]), indent=2)
        except Exception as e:
            print(e)