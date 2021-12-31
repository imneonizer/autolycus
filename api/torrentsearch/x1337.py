import requests
import inspect
import re
from bs4 import BeautifulSoup
import json
import os
import time

from .user_agents import get_ua_header

class X1337:
    def __init__(self, domain="https://www.1377x.to", proxy="", retry=5):
        self.domain = domain
        self.proxy = proxy
        self.retry = retry
    
    def search(self, query, page=1, encode_query=True):
        if encode_query:
            query = requests.utils.quote(query)
        
        url = "{}/search/{}/{}".format(self.domain, query, page)
        
        retry_count = 0
        while retry_count < self.retry:
            try:
                if self.proxy:
                    # response = requests.post(self.proxy, json={"url": url}, timeout=10,  headers={'User-Agent':str(UA.random)})
                    response = requests.get(url, timeout=10, proxies={"https" :self.proxy()}, headers=get_ua_header())
                else:
                    response = requests.get(url, timeout=10, headers=get_ua_header())

                results = self.parse(response)
                retry_count = self.retry + 1
                return results
            except requests.exceptions.ConnectionError:
                time.sleep(1)
                retry_count += 1
        
        return []
    
    def parse(self, response):
        data = []
        for row in BeautifulSoup(response.text, features="lxml")("tr")[1:-1]:
            d = {}
            for i, cell in enumerate(row("td")):
                text = inspect.cleandoc(cell.text)

                for a in cell.find_all("a"):
                    if a.get("href").startswith("/torrent"):
                        d.update({"url": a.get("href")})

                if i == 0:
                    d.update({"name": text})

                elif i == 1:
                    d.update({"seed": text})

                elif i == 2:
                    d.update({"leech": text})

                elif i == 3:
                    d.update({"created": text})

            d.update({"size": row("td")[-2].text, "source": "x1337"})
            data.append(d)
        
        return data
    
    def get_info(self, data):
        url = self.domain+data['url']
        
        if self.proxy:
            response = requests.post(self.proxy, json={"url": url},  headers=get_ua_header())
        else:
            response = requests.get(url, headers=get_ua_header())
        
        return {'magnet': BeautifulSoup(response.text, features="lxml").find('a', href = re.compile(r'^[magnet]')).get("href").split("&dn=")[0]}
    
    def get_magnet(self, data):
        return self.get_info(data).get('magnet')