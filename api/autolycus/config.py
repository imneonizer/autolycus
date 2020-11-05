import os

config = dict(
    HOST = os.environ.get("HOST", "0.0.0.0"),
    PORT = os.environ.get("PORT", 5000),
    URI = os.environ.get("SQLALCHEMY_DATABASE_URI", "sqlite:///torrents.sqlite3"),
    # URI="sqlite:///:memory:",
    DEBUG = True if os.environ.get("DEBUG") else False,
    DEFAULT_SAVE_PATH = "/downloads"
)