import os

class Config(object):
    DEBUG = False
    TESTING = False
    DATABASE_URI = 'sqlite://:memory:'
    DEFAULT_SAVE_PATH = "/downloads"
    HOST = "0.0.0.0"
    PORT = 5000

class DevelopmentConfig(Config):
    DEBUG = True
    DATABASE_URI = "sqlite:///autolycus.sqlite3"

class ProductionConfig(Config):
    pass

config = {
    "dev": DevelopmentConfig,
    "prod": ProductionConfig
}