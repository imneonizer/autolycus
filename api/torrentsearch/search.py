import requests
import inspect
import re
from bs4 import BeautifulSoup
import json
import traceback

from .tpb import TPB
from .x1337 import X1337
from .yify import YIFY
from .imdb import IMDB
import textwrap
import threading
import os
from os.path import join, dirname
import time


class Thread(threading.Thread):
    def __init__(self, group=None, target=None, name=None, args=(), kwargs=None, *, daemon=None):
        threading.Thread.__init__(self, group, target, name, args, kwargs, daemon=daemon)
        self._return = None

    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args, **self._kwargs)

    def join(self):
        threading.Thread.join(self)
        return self._return


class TorrentSearch:
    def __init__(self):
        self.services = {
            "tpb": TPB(),
            "x1337": X1337()
        }
        self.imdb = IMDB()

    def search(self, keyword, max_results=None, is_retry=False):
        if not keyword: return
        
        threads = []
        for s in self.services.values():
            t = Thread(target=s.search, args=(keyword,))
            t.start(); threads.append(t)
        
        results = []
        for t in threads:
            results += t.join() or []
        
        results.sort(key=lambda k:k.get('source'))
        return results
    
    def get_magnet(self, r):
        return self.services.get(r['source'].lower()).get_magnet(r)
    
    def get_details(self, r):
        r.update({"magnet": self.get_magnet(r)})
        details = self.imdb.get_details(r.get("imdb", {}).get("url"))
        details["torrent_name"] = r["name"]
        if 'url' in details:
            del details['url']
        r.update(details)
        return r