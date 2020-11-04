import libtorrent as lt
import os, shutil
import time, datetime
import threading
import hashlib
import math

class Autolycus:
    def __init__(self, default_save_path="/tmp"):
        self.session = lt.session()
        self.default_save_path = default_save_path
        self.torrents = {}
        os.makedirs(self.default_save_path, exist_ok=True)

    def active_torrents(self):
        return self.session.get_torrents()
    
    def get_hash(self, string):
        return hashlib.sha1(string.encode()).hexdigest()
    
    def remove_path(self, path):
        if os.path.exists(path):
            shutil.rmtree(path)
    
    def convert_size(self, size_bytes):
        if size_bytes == 0: return "0B"
        size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 2)
        return "%s %s" % (s, size_name[i])
    
    def convert_bandwidth(self, speed):
        speed = speed / 1000.0
        if speed > 1000.0:
            speed = str(round(speed / 1024.0, 2))+" Mb/s"
        else:
            speed = str(round(speed, 2))+" Kb/s"
        return speed

    def add_magnet(self, magnet, save_path=None):
        base_path = save_path or self.default_save_path
        Hash = self.get_hash(magnet)
        if Hash in self.torrents: return Hash
        save_path = os.path.join(base_path, Hash)
        os.makedirs(save_path, exist_ok=True)
        self.torrents[Hash] = {"magnet": magnet, "path":save_path, "torrent": lt.add_magnet_uri(self.session, magnet, {"save_path": save_path})}
        return Hash
    
    def remove_torrent(self, Hash):
        if Hash not in self.torrents: return
        try:
            self.session.remove_torrent(self.torrents[Hash]["torrent"])
            self.remove_path(self.torrents[Hash]["path"])
            del self.torrents[Hash]
            return True
        except Exception as e:
            print(e)
    
    def torrent_status(self, Hash):
        if Hash not in self.torrents: return
        t = self.torrents[Hash]["torrent"]; s = t.status()
        return {
            "name": t.name(),
            "added_time": datetime.datetime.fromtimestamp(s.added_time),
            "queue_position": t.queue_position(),
            "download_path": s.save_path,
            "hash": Hash,
            "progress": int(s.progress*100),
            "total_bytes": self.convert_size(s.total_wanted),
            "downloaded_bytes": self.convert_size(s.total_wanted_done),
            "download_speed": self.convert_bandwidth(s.download_rate),
            "upload_speed": self.convert_bandwidth(s.upload_rate),
            "num_peers": s.num_peers,
            "num_seeds": s.num_seeds,
            "num_trackers": len(t.trackers()),
            "num_connections": s.num_connections,
            "is_paused": s.paused,
            "is_finished": t.is_finished()
        }
    
    def list_torrents(self, hashes=None):
        torrents = []
        for Hash in hashes or self.torrents:
            status = self.torrent_status(Hash)
            if not status: continue
            torrents.append(status)
        return torrents

if __name__ == "__main__":

    al = Autolycus()

# {
#   "magnets": [
#     "magnet:?xt=urn:btih:123C7F0673A0EC7447B874FCE624898045CA91FC&dn=Win+Rar+v3.80+Pro+no+Cerial+Needed&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce",
#     "magnet:?xt=urn:btih:bb9a6234cc6fefbc2e50f3775c61d59fc5e767ea&dn=The+English+Tenses+Exercise+Book&xl=1323682&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2F9.rarbg.to:2710/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.uw0.xyz:6969/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announc4&tr=udp%3A%2F%2Fzephir.monocul.us:6969/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451/announce&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Ftracker.zum.bi:6969/announce&tr=udp%3A%2F%2Fopentracker.i2p.rocks:6969/announce"
#   ]
# }

    magnet_link1="magnet:?xt=urn:btih:bb9a6234cc6fefbc2e50f3775c61d59fc5e767ea&dn=The+English+Tenses+Exercise+Book&xl=1323682&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2F9.rarbg.to:2710/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.uw0.xyz:6969/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announc4&tr=udp%3A%2F%2Fzephir.monocul.us:6969/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451/announce&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Ftracker.zum.bi:6969/announce&tr=udp%3A%2F%2Fopentracker.i2p.rocks:6969/announce"
    magnet_link2="magnet:?xt=urn:btih:123C7F0673A0EC7447B874FCE624898045CA91FC&dn=Win+Rar+v3.80+Pro+no+Cerial+Needed&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce"
    al.add_magnet_uri(magnet_link1, "/tmp")
    al.add_magnet_uri(magnet_link2, "/tmp")

    # print(dir(al.queue[0]))
    # print(dir(al.queue[0].status()))

    t = list(al.torrents.values())[0]
    for i in dir(t):
        print(i)
    
    # t.is_paused
    # t.pause()
    # t.resume()
    # t.set_download_limit(<int>)
    # t.queue_position()
    # t.queue_position_bottom()
    # t.queue_position_down()
    # t.queue_position_top()
    # t.queue_position_up()

    paramater = lambda : t.queue_position()
    print(paramater())

    import sys
    B = int(sys.argv[1])

    while B:
        try:
            for index, torrent in enumerate(al.queue):
                if not torrent.is_seed():
                    s = torrent.status()

                    # originally bytes
                    download_speed = round(s.download_rate / 1000, 2) #kbps
                    if download_speed > 1000:
                        download_speed = str(round(download_speed /1024, 2))+" Mb/s"
                    else:
                        download_speed = str(download_speed)+" Kb/s"
                    
                    size = s.total_wanted/1000/1024
                    if size > 1024:
                        size = str(round(size/1024, 2))+" GB"
                    else:
                        size = str(round(size, 2))+" MB"
                    
                    description = " ".join([download_speed, str(s.state).replace("_", " "), size])
                    print(description)
                    print(paramater())
                    import time
                    time.sleep(0.05)

                    # progress = int(s.progress * 100)
                    # pbar.refresh()
                    # pbar.n = progress
                    # pbar.desc = description
                else:
                    al.session.remove_torrent(torrent)
                    print(torrent.name(), "| Complete")
                    # raise StopIteration

        except StopIteration:
            break