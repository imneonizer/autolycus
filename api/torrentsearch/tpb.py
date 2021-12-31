import requests
import inspect
import re
from bs4 import BeautifulSoup
import json
import os
import time

from .user_agents import get_ua_header

class TPB:
    def __init__(self, domain="https://thehiddenbay.com", proxy="", retry=5):
        self.domain = domain
        self.proxy = proxy
        self.retry = retry
    
    def search(self, query, order_by='99', page=0, encode_query=True):
        """
        1 = Order by name
        3 = Order by uploaded
        5 = Order by size
        11 = Order by UL'd by
        8 = Order by seeders
        9 = Order by leechers
        13 = Order by Type
        """
        
        if encode_query:
            query = requests.utils.quote(query)
        
        #/search/{Search Term}/{Page Number}/{Order By}/{Category}
        #url = "{}/search/{}/{}/{}".format(self.domain, query, page, order_by)
        url = "{}/s/?orderby={}&page={}&q={}".format(self.domain, order_by, page, query)
        
        retry_count = 0
        while retry_count < self.retry:
            try:
                if self.proxy:
                    response = requests.get(url, timeout=10, proxies={"https" :self.proxy()}, headers=get_ua_header())
                else:
                    response = requests.get(url, headers=get_ua_header())
                
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
                    if a.get("href").startswith("magnet"):
                        magnet = a.get("href").split("&dn=")[0]

                if i == 0:
                    d.update({"type": inspect.cleandoc(text).replace("\n"," ").replace("\r", "")})

                elif i == 1:
                    d.update({
                        "name": text.split("\n")[0],
                        "created": text.split("\n")[2].split(",")[0].replace("Uploaded ", "").replace("\xa0", " "),
                        "size": text.split("\n")[2].split(",")[1].replace(" Size ","").replace("\xa0", " ")
                    })

                elif i == 2:
                    d.update({"seed": text})

                elif i == 3:
                    d.update({"leech": text})

            d.update({"magnet": magnet, "source": "tpb"})
            data.append(d)
        return data
    
    def get_info(self, data):
        return data
    
    def get_magnet(self, data):
        return data.get('magnet')