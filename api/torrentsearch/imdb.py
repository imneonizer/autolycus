import requests
import inspect
import re
from bs4 import BeautifulSoup
import json
import os

class IMDB:
    def __init__(self, domain="https://www.imdb.com"):
        self.domain = domain
    
    def search(self, query, encode_query=True):
        try:
            if encode_query:
                query = requests.utils.quote(query)
            
            url = "{}/find?q={}&ref_=nv_sr_sm".format(self.domain, query)
            response = requests.get(url)
            response = self.parse(response)
            return response
        except requests.exceptions.ConnectTimeout:
            pass
        
        return []
        
    def parse(self, response):
        response = BeautifulSoup(response.text, features="lxml")
        return [{"name": td.text.strip(), "url": self.domain+td.find("a").get("href", ""), } for td in response.find_all("td", {"class": "result_text"})]
    
    def get_details(self, url):
        try:
            response = BeautifulSoup(requests.get(url).text, features="lxml")
            return json.loads(response.find("script", type="application/ld+json").string)
        except requests.exceptions.MissingSchema:
            return {}
        