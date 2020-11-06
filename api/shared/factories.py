from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from autolycus.torrent_client import TorrentClient
seedr = TorrentClient()