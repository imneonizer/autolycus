#https://flask-jwt-extended.readthedocs.io/en/stable/options/#configuration-options
import os
import datetime

class Config(object):
    SQLALCHEMY_DATABASE_URI = "sqlite://:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CACHE_TYPE = "simple"
    CACHE_IGNORE_ERRORS = True
    CACHE_THRESHOLD = 100

    SECRET_KEY = os.environ.get("SECRET_KEY", "super_secret")
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    JWT_BLACKLIST_ENABLED = True
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(minutes=60)
    JWT_REFRESH_TOKEN_EXPIRES = datetime.timedelta(days=15)
    PUBLIC_URL_EXPIRES = datetime.timedelta(days=7)

    DEFAULT_SAVE_PATH = "/downloads"
    DEBUG = False
    HOST = "0.0.0.0"
    PORT = 5000

class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///autolycus.sqlite3"
    DEBUG = True

class ProductionConfig(Config):
    pass

config = {
    "dev": DevelopmentConfig,
    "prod": ProductionConfig
}