import os, shutil
import threading
import time, datetime
import hashlib
from .torrent_schema import Torrent

class TorrentRecord:
    def __init__(self, app, db, libtorrent_session):
        self.db = db; self.app = app
        self.libtorrent_session = libtorrent_session
        self.torrents = {}
        threading.Thread(target=self.auto_update_torrent_records).start()
    
    def auto_update_torrent_records(self):
        with self.app.app_context():
            while True:
                time.sleep(2)
                try:
                    for (Hash, t) in self.torrents.items():
                        s = t.status()
                        self.db.session.query(Torrent).filter(Torrent.Hash == Hash).update(dict(
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
                        self.db.session.commit()

                        if t.is_seed():
                            self.db.session.query(Torrent).filter(Torrent.Hash == Hash).update(dict(
                                download_speed=0,
                                is_paused=True,
                                num_connections=0,
                                num_peers=0,
                                num_seeds=0,
                                num_trackers=0,
                                upload_speed=0
                            ), synchronize_session = False)
                            self.libtorrent_session.remove_torrent(self.torrents[Hash])
                            del self.torrents[Hash]
                            self.db.session.commit()
                except Exception as e:
                    print("Error from auto update thread:", e)
    
    def get_hash(self, string):
        return hashlib.sha1(string.encode()).hexdigest()

    def remove_path(self, path):
        if os.path.exists(path):
            shutil.rmtree(path)

    def add_record(self, magnet, Hash, save_path, torrent):
        self.torrents[Hash] = torrent
        self.db.session.add(Torrent(
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
        self.db.session.commit()
        return Torrent.query.filter(Torrent.Hash == Hash).first().Hash
    
    def remove_record(self, Hash):
        try:
            if Hash in self.torrents:
                self.libtorrent_session.remove_torrent(self.torrents[Hash])
                del self.torrents[Hash]
            
            record = self.get_record(Hash)
            if record:
                self.remove_path(record.download_path)
                self.db.session.delete(record)
                self.db.session.commit()
                return True
        except Exception as e:
            print(e)

    def get_record(self, Hash):
        record = Torrent.query.filter(Torrent.Hash == Hash).first() 
        return record if record else None