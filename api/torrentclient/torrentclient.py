import os, shutil
import time, datetime
import threading, hashlib

import libtorrent as lt
import urllib
import urllib.parse
from shared.factories import db
from models.torrents import Torrent
import re

class TorrentClient:
    def __init__(self, default_save_path="/downloads"):
        self.default_save_path = default_save_path
        os.makedirs(self.default_save_path, exist_ok=True)

        self.lt_session = lt.session()
        threading.Thread(target=self.auto_update_torrent_records).start()
        self.lock = threading.Lock()

    def auto_update_torrent_records(self):
        from app import app
        with app.app_context():

            while True:
                self.lock.acquire()
                try:
                    for t in self.lt_session.get_torrents():
                        s = t.status()
                        torrent = Torrent.find_by_hash(str(s.info_hash).lower())

                        if not torrent: continue
                        Hash = str(s.info_hash).lower()

                        torrent.update_to_db(Hash, dict(
                            download_speed=s.download_rate,
                            downloaded_bytes=s.total_wanted_done,
                            is_finished=t.is_finished(),
                            is_paused=s.paused,
                            name=t.name() if t.name() else "NA",
                            num_connections=s.num_connections,
                            num_peers=s.num_peers,
                            num_seeds=s.num_seeds,
                            num_trackers=len(t.trackers()),
                            progress=int(s.progress*100),
                            queue_position=t.queue_position(),
                            total_bytes=s.total_wanted,
                            upload_speed=s.upload_rate
                        ))

                        if t.is_seed():
                            torrent.update_to_db(Hash, dict(
                                download_speed=0,
                                is_paused=True,
                                num_connections=0,
                                num_peers=0,
                                num_seeds=0,
                                num_trackers=0,
                                upload_speed=0
                            ))
                            self.lt_session.remove_torrent(t)
                            del torrent
                except Exception as e:
                    print("Error from auto update thread:", e)

                time.sleep(2)
                self.lock.release()
    
    def get_hash(self, string):
        return str(hashlib.sha1(string.encode()).hexdigest())
    
    def get_info_hash(self, magnet):
        try:
            info_hash = re.findall(r"btih:.*", magnet)[0][5:45].lower()
            if len(info_hash) == 40:
                return info_hash
        except Exception as e:
            print("Error from get_info_hash:", str(e))

    def add_torrent(self, magnet, save_path):
        try:
            return lt.add_magnet_uri(self.lt_session, magnet, {"save_path": save_path})
        except Exception as e:
            print("Error from add_torrent:", str(e))

    def remove_path(self, path):
        if os.path.exists(path):
            shutil.rmtree(path)

    def add_magnet(self, magnet, save_path=None):
        save_path = save_path or self.default_save_path
        magnet = urllib.parse.unquote(magnet)
        Hash = self.get_info_hash(magnet)

        if not Hash: return
        if Torrent.find_by_hash(Hash): return Hash

        save_path = os.path.join(save_path, Hash)
        os.makedirs(save_path, exist_ok=True)
        
        t = self.add_torrent(magnet, save_path)
        if not t:
            self.remove_path(save_path)
            return

        torrent = Torrent(
            added_time=int(time.time()),
            download_path=save_path,
            download_speed=0,
            downloaded_bytes=0,
            Hash=Hash,
            magnet=magnet,
            is_finished=False,
            is_paused=False,
            name="NA",
            num_connections=0,
            num_peers=0,
            num_seeds=0,
            num_trackers=0,
            progress=0,
            queue_position=-1,
            total_bytes=0,
            upload_speed=0
        ); torrent.save_to_db()

        return Hash
    
    def remove_torrent(self, Hash):
        torrent = Torrent.find_by_hash(Hash)
        if not torrent: return
        try:
            self.remove_path(torrent.download_path)
            torrent.delete_from_db()
            return True
        except Exception as e:
            print(e)
    
    def torrent_status(self, Hash):
        torrent = Torrent.find_by_hash(Hash)
        return torrent.JSON if torrent else None

    def list_torrents(self, hashes=None):
        if hashes:
            return [self.torrent_status(Hash) for Hash in hashes if Torrent.find_by_hash(Hash)]
        return [t.JSON for t in Torrent.query.all()]