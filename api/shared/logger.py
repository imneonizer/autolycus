import os
import logging
from logging.handlers import RotatingFileHandler

class Logger:

    def init_app(self, app):
        os.makedirs('logs', exist_ok=True)
        logHandler = RotatingFileHandler(os.path.join('logs', 'application.log'),
                                         maxBytes=100000000, backupCount=5)
        formatter = logging.Formatter(fmt='[%(asctime)s]:[%(levelname)s]:%(message)s',
                                      datefmt='%Y-%m-%d %H:%M:%S')
        logHandler.setFormatter(formatter)
        logHandler.setLevel(logging.DEBUG)
        app.logger.setLevel(logging.DEBUG)
        app.logger.addHandler(logHandler)
        return app

logger = Logger()