from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask_caching import Cache
cache = Cache()

# from pymemcache.client import base
# import os
# os.system("service memcached start")
# memcache = base.Client(('localhost', 11211))