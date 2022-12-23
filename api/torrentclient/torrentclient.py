import os, shutil
import time, datetime
import threading, hashlib

import libtorrent as lt
import urllib
import urllib.parse
from models.torrents import Torrent
import re

from shared.utils import get_dir_size


class TorrentClient:
    def __init__(self, app=None, default_save_path="/downloads"):
        self.app = app
        if app is not None:
            self.init_app(app)

        self.default_save_path = default_save_path
        os.makedirs(self.default_save_path, exist_ok=True)

    def init_app(self, app):
        self.app = app
        self.lt_session = lt.session()

        settings = self.lt_session.get_settings()
        settings.update(
            {
                "alert_mask": lt.alert.category_t.all_categories,
                "connections_limit": 500,
                "enable_outgoing_utp": False,
                "enable_incoming_utp": False,
            }
        )

        self.lt_session.apply_settings(settings) if hasattr(
            self.lt_session, "apply_settings"
        ) else self.lt_session.set_settings(settings)

        self.lock = threading.Lock()
        t = threading.Thread(target=self.auto_update_torrent_records)
        t.daemon = True
        t.start()

    def auto_update_torrent_records(self):
        with self.app.app_context():
            while True:
                self.lock.acquire()
                try:
                    for t in self.lt_session.get_torrents():
                        s = t.status()
                        Hash = str(s.info_hash).lower()
                        torrent = Torrent.find_by_hash(Hash)
                        if not torrent:
                            # forcefully remove from lt_session
                            self.lt_session.remove_torrent(t)
                            self.remove_path(t.save_path())
                            continue

                        torrent.update_to_db(
                            Hash,
                            dict(
                                download_speed=s.download_rate,
                                downloaded_bytes=s.total_wanted_done,
                                is_finished=t.is_finished(),
                                is_paused=s.paused,
                                name=t.name() if t.name() else "Unknown",
                                num_connections=s.num_connections,
                                num_peers=s.num_peers,
                                num_seeds=s.num_seeds,
                                num_trackers=len(t.trackers()),
                                progress=int(s.progress * 100),
                                queue_position=t.queue_position(),
                                total_bytes=s.total_wanted,
                                upload_speed=s.upload_rate,
                            ),
                        )

                        if t.is_seed():
                            torrent.update_to_db(
                                Hash,
                                dict(
                                    download_speed=0,
                                    is_paused=True,
                                    num_connections=0,
                                    num_peers=0,
                                    num_seeds=0,
                                    num_trackers=0,
                                    upload_speed=0,
                                ),
                            )
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

    def _validate_magnet_uri(self, magnet):
        # Parse the magnet link into its individual components
        parsed_link = urllib.parse.urlparse(magnet)

        # Check that the scheme is "magnet"
        if parsed_link.scheme != "magnet":
            return False

        # Check that the link includes a "xt" (exact topic) parameter
        # with a value that starts with "urn:btih:"
        query_dict = urllib.parse.parse_qs(parsed_link.query)
        if "xt" not in query_dict or not query_dict["xt"][0].startswith("urn:btih:"):
            return False

        # Check that the info hash is a base32-encoded string of 40 characters
        info_hash = query_dict["xt"][0][9:]
        if len(info_hash) != 40 or any(
            c not in "0123456789abcdefghijklmnopqrstuvwxyz" for c in info_hash
        ):
            return False

        # Check that the "dn" (display name) parameter, if present, is a valid UTF-8 string
        if "dn" in query_dict:
            try:
                query_dict["dn"][0].encode("utf-8")
            except UnicodeEncodeError:
                return False

        # Check that the "tr" (tracker) parameters, if present, are valid URLs
        if "tr" in query_dict:
            for tracker in query_dict["tr"]:
                try:
                    urllib.parse.urlparse(tracker)
                except ValueError:
                    return False

        # If all checks pass, the magnet link is valid
        return True

    def clean_magnet(self, magnet):
        magnet = magnet.strip().lower()

        if ("magnet:?xt=urn:btih:" in magnet) and (
            not magnet.startswith("magnet:?xt=urn:btih:")
        ):
            # Most probably magnet link is from vidmate
            # where file name is pre appended to magnet link
            magnet = magnet.split("magnet:?xt=urn:btih:")[1]
            magnet = f"magnet:?xt=urn:btih:{magnet}"

        elif not magnet.startswith("magnet:?xt=urn:btih:"):
            # Most probably magnet link is from TPB
            # where only info_hash is present
            magnet = f"magnet:?xt=urn:btih:{magnet}"

        if self._validate_magnet_uri(magnet):
            return magnet
        else:
            raise ValueError("invalid magnet uri")

    def add_torrent(self, magnet, save_path):
        try:
            return lt.add_magnet_uri(self.lt_session, magnet, {"save_path": save_path})
        except Exception as e:
            print("Error from add_torrent:", str(e))

    def remove_path(self, path):
        if not os.path.exists(path):
            return
        if os.path.isfile(path) or os.path.islink(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)

    def add_magnet(self, magnet, username=None, save_path=None):
        save_path = save_path or self.default_save_path
        magnet = urllib.parse.unquote(magnet)
        magnet = self.clean_magnet(magnet)
        Hash = self.get_info_hash(magnet)

        if not Hash:
            return
        if Torrent.find_by_hash(Hash):
            return Hash

        save_path = os.path.join(save_path, username, Hash)
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
            username=username,
            is_finished=False,
            is_paused=False,
            name="Unknown",
            num_connections=0,
            num_peers=0,
            num_seeds=0,
            num_trackers=0,
            progress=0,
            queue_position=-1,
            total_bytes=0,
            upload_speed=0,
        )
        torrent.save_to_db()

        return Hash

    def remove_torrent(self, Hash, username=None):
        torrent = Torrent.find_by_hash_and_username(Hash, username)
        if not torrent:
            return
        try:
            for t in self.lt_session.get_torrents():
                s = t.status()
                info_hash = str(s.info_hash).lower()
                if info_hash == Hash:
                    self.lt_session.remove_torrent(t)
            self.remove_path(torrent.download_path)
            if not os.path.exists(torrent.download_path):
                torrent.delete_from_db()
                return True
        except Exception as e:
            print(e)

    def torrent_status(self, Hash, username):
        torrent = Torrent.find_by_hash_and_username(Hash, username)
        return torrent.JSON if torrent else None

    def list_torrents(self, hashes=None, username=None):
        if hashes:
            return [
                self.torrent_status(Hash, username)
                for Hash in hashes
                if self.torrent_status(Hash, username)
            ]

        torrent_db = sorted(
            [t.JSON for t in Torrent.find_by_username(username)],
            key=lambda k: k.get("added_time"),
            reverse=True,
        )

        torrent_db_hash = [x.get("hash") for x in torrent_db]
        download_dir = os.path.join(self.default_save_path, username)
        if not os.path.exists(download_dir):
            os.makedirs(download_dir)
        torrent_disk_hash = os.listdir(os.path.join(self.default_save_path, username))

        # append unknown disk files which are removed from db
        for h in torrent_disk_hash:
            if h not in torrent_db_hash:
                download_path = os.path.join(self.default_save_path, username, h)
                download_size = get_dir_size(download_path)
                try:
                    name = os.listdir(download_path)[0]
                except:
                    name = "Unknown"

                torrent_db.append(
                    {
                        "added_time": os.path.getmtime(download_path),
                        "download_path": download_path,
                        "download_speed": 0,
                        "downloaded_bytes": download_size,
                        "hash": h,
                        "magnet": "magnet:?xt=urn:btih:" + h,
                        "is_finished": True,
                        "is_paused": False,
                        "name": name,
                        "username": username,
                        "num_connections": -1,
                        "num_peers": -1,
                        "num_seeds": -1,
                        "num_trackers": -1,
                        "progress": 100,
                        "queue_position": -1,
                        "total_bytes": download_size,
                        "upload_speed": 0,
                    }
                )

        return torrent_db
