import libtorrent as lt
import os, shutil
import time, datetime
import threading
import hashlib
import math
from .torrent_record import TorrentRecord
from .torrent_schema import Torrent

class Autolycus(TorrentRecord):
    def __init__(self, app, db, default_save_path="/tmp"):
        self.session = lt.session()
        super().__init__(app, db, self.session)
        self.default_save_path = default_save_path
        os.makedirs(self.default_save_path, exist_ok=True)

    def active_torrents(self):
        return self.session.get_torrents()
    
    def add_magnet(self, magnet, save_path=None):
        save_path = save_path or self.default_save_path
        Hash = self.get_hash(magnet)
        if Hash in self.torrents or self.get_record(Hash): return Hash
        try:
            save_path = os.path.join(save_path, Hash)
            os.makedirs(save_path, exist_ok=True)
            torrent = lt.add_magnet_uri(self.session, magnet, {"save_path": save_path})
            return self.add_record(magnet, Hash, save_path, torrent)
        except RuntimeError:
            pass
    
    def remove_torrent(self, Hash):
        if not self.get_record(Hash): return
        return self.remove_record(Hash)
    
    def torrent_status(self, Hash):
        torrent = self.get_record(Hash)
        return torrent.json if torrent else None

    def list_torrents(self, hashes=None):
        if hashes:
            return [self.torrent_status(Hash) for Hash in hashes if self.torrent_status(Hash)]
        return [t.json for t in Torrent.query.all()]