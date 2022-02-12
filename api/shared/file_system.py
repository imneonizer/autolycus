import os
import glob
import json
import re
from .torrent_name_parser import parse_name

class FileSystem:
    def sort_names(self, data): 
        convert = lambda text: int(text) if text.isdigit() else text.lower() 
        alphanum_key = lambda key: [ convert(c) for c in re.split('([0-9]+)', key) ]  
        return sorted(data, key=alphanum_key)

    def json_tree(self, path):
        try:
            def path_to_dict(path):
                d = {'name': os.path.basename(path)}
                if os.path.isdir(path):
                    hls_index_file =  os.path.exists(os.path.join(path, ".hlskeep"))
                    if hls_index_file:
                        dtype = "hls"
                        d['info'] = parse_name(os.path.basename(path))
                        d['ext'] = ".m3u8"
                    else:
                        dtype = "directory"
                    
                    d['type'] = dtype
                    d['path'] = os.path.realpath(path)
                    d['size'] = sum(x.stat().st_size for x in os.scandir(path) if x.is_file())
                    
                    if hls_index_file:
                        # d['hls_children'] = [path_to_dict(os.path.join(path,x)) for x in self.sort_names(os.listdir(path))]
                        pass
                    else:
                        d['children'] = [path_to_dict(os.path.join(path,x)) for x in self.sort_names(os.listdir(path))]
                else:
                    d['type'] = "file"
                    d['path'] = os.path.realpath(path)
                    d['ext'] = os.path.splitext(path)[1]
                    d['size'] = os.stat(path).st_size
                return d

            files = os.listdir(path)

            for f in files:
                if os.path.isfile(os.path.join(path, f)):
                    return json.dumps(path_to_dict(path), indent=2)

            return json.dumps(path_to_dict(glob.glob(path+"/*")[0]), indent=2)
        except Exception as e:
            print(e)