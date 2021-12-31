import os
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask_migrate import Migrate
migrate = Migrate()

from flask_caching import Cache
cache = Cache()

from shared.file_system import FileSystem
fs = FileSystem()

from torrentclient import TorrentClient
seedr = TorrentClient()

from torrentsearch import TorrentSearch
tsearch = TorrentSearch()