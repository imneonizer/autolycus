from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask_caching import Cache
cache = Cache()

from shared.file_system import FileSystem
fs = FileSystem()