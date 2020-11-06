import os, shutil
import time, datetime
import threading, hashlib

import libtorrent as lt
import urllib
from shared.factories import db
from models.torrents import Torrent

class TorrentClient:
    def __init__(self, default_save_path="/downloads"):
        self.default_save_path = default_save_path
        os.makedirs(self.default_save_path, exist_ok=True)

        self.torrents = {}
        self.lt_session = lt.session()
        threading.Thread(target=self.auto_update_torrent_records).start()

    def auto_update_torrent_records(self):
        from app import app
        with app.app_context():
            while True:
                try:
                    for (Hash, t) in self.torrents.items():
                        s = t.status()
                        db.session.query(Torrent).filter(Torrent.Hash == Hash).update(dict(
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
                        ), synchronize_session = False)
                        db.session.commit()

                        if t.is_seed():
                            db.session.query(Torrent).filter(Torrent.Hash == Hash).update(dict(
                                download_speed=0,
                                is_paused=True,
                                num_connections=0,
                                num_peers=0,
                                num_seeds=0,
                                num_trackers=0,
                                upload_speed=0
                            ), synchronize_session = False)
                            self.lt_session.remove_torrent(self.torrents[Hash])
                            del self.torrents[Hash]
                            db.session.commit()
                except Exception as e:
                    print("Error from auto update thread:", e)
                
                time.sleep(2)
    
    def get_hash(self, string):
        return hashlib.sha1(string.encode()).hexdigest()

    def remove_path(self, path):
        if os.path.exists(path):
            shutil.rmtree(path)

    def add_magnet(self, magnet, save_path=None):
        save_path = save_path or self.default_save_path
        magnet = urllib.parse.unquote(magnet)
        Hash = self.get_hash(magnet)
        if Hash in self.torrents or self.get_record(Hash): return Hash
        try:
            save_path = os.path.join(save_path, Hash)
            os.makedirs(save_path, exist_ok=True)
            torrent = lt.add_magnet_uri(self.lt_session, magnet, {"save_path": save_path})

            self.torrents[Hash] = torrent
            db.session.add(Torrent(
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
            ))
            db.session.commit()

            return Torrent.query.filter(Torrent.Hash == Hash).first().Hash
        except RuntimeError:
            pass
    
    def remove_torrent(self, Hash):
        if not self.get_record(Hash): return
        try:
            if Hash in self.torrents:
                self.lt_session.remove_torrent(self.torrents[Hash])
                del self.torrents[Hash]
            
            record = self.get_record(Hash)
            if record:
                self.remove_path(record.download_path)
                db.session.delete(record)
                db.session.commit()
                return True
        except Exception as e:
            print(e)

    def get_record(self, Hash):
        record = Torrent.query.filter(Torrent.Hash == Hash).first() 
        return record if record else None
    
    def torrent_status(self, Hash):
        torrent = self.get_record(Hash)
        return torrent.json if torrent else None
    
    def list_torrents(self, hashes=None):
        if hashes:
            return [self.torrent_status(Hash) for Hash in hashes if self.torrent_status(Hash)]
        return [t.json for t in Torrent.query.all()]