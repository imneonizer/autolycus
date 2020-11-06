import os
from shared.utils import random_string

class Config(object):
    DEBUG = False
    TESTING = False
    JWT_SECRET_KEY = random_string(50)
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
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