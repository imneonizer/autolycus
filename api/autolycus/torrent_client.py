import libtorrent as lt
import os, shutil, time
import threading

class Autolycus:
    def __init__(self, default_path="/tmp"):
        self.session = lt.session()
        self.default_path = default_path
        self.torrents = {}
        os.makedirs(self.default_path, exist_ok=True)
        threading.Thread(target=self.pause_when_finish).start()    

    @property
    def queue(self):
        return self.session.get_torrents()
    
    @property
    def num_connections(self):
        return self.session.num_connections()
    
    def pause_when_finish(self):
        # this will prevent from seeding and eating bandwidth
        while True:
            try:
                for t in self.torrents.values():
                    if t.is_finished():
                        t.pause()
            except Exception as e:
                print(e)

            time.sleep(2)

    def add_magnet_uri(self, magnet, save_path=None):
        save_path = self.default_path if not save_path else save_path
        if magnet in self.torrents: return ("already exist", 202)
        self.torrents[magnet] = lt.add_magnet_uri(self.session, magnet, {"save_path": save_path})
        return ("added", 200)
    
    def remove_torrent(self, magnet):
        if magnet not in self.torrents: return ("not found", 404)
        self.session.remove_torrent(self.torrents[magnet])
        del self.torrents[magnet]
        return ("removed", 200)
    
    def torrent_status(self, magnet):
        if magnet not in self.torrents: return ({"message": "not found"}, 404)
        t = self.torrents[magnet]
        s = t.status()

        return ({
            "name": t.name(),
            "added_time": s.added_time,
            "queue_position": t.queue_position(),
            "save_path": s.save_path,
            "hash": str(s.info_hash),
            "progress": s.progress,
            "total_bytes": s.total_wanted,
            "downloaded_bytes": s.total_wanted_done,
            "download_speed": s.download_rate,
            "upload_speed": s.upload_rate,
            "num_peers": s.num_peers,
            "num_seeds": s.num_seeds,
            "num_trackers": len(t.trackers()),
            "num_connections": s.num_connections,
            "is_valid": t.is_valid(),
            "is_paused": s.paused,
            "is_seeding": t.is_seed(),
            "is_finished": t.is_finished()
        
        }, 200)

if __name__ == "__main__":

    al = Autolycus()

    # {
    #   "magnet": "magnet:?xt=urn:btih:123C7F0673A0EC7447B874FCE624898045CA91FC&dn=Win+Rar+v3.80+Pro+no+Cerial+Needed&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce"
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