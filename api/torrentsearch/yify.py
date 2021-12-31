import requests
import inspect
import re
from bs4 import BeautifulSoup
import json
# from fake_useragent import UserAgent
import os

verify_ssl = True if 'DYNO' in os.environ else False
# UA = UserAgent(verify_ssl=verify_ssl)

class YIFY:
    def __init__(self, domain="https://yts.unblockit.onl", proxy=""):
        self.domain = domain
        self.proxy = proxy
    
    def search(self, query, page=1, encode_query=True):
        if encode_query:
            query = requests.utils.quote(query)
        
        url = "{}/search/{}/{}".format(self.domain, query, page)
        url = "{}/browse-movies/{}/all/all/0/latest/0/all{}".format(self.domain, query, '?page={}'.format(page) if page > 1 else '')
        
        try:
            if self.proxy:
                response = requests.post(self.proxy, json={"url": url}, timeout=10,  headers={'User-Agent':str(UA.random)})
            else:
                response = requests.get(url, timeout=10,  headers={'User-Agent':str(UA.random)})
            
            return self.parse(response)
        except requests.exceptions.ConnectionResetError:
            print("Connecting reset by peer, please use a VPN")
    
    def parse(self, response):
        data = [
            {
                "name":x.get('href').split("/")[-1].rsplit("-", 1)[0].replace("-"," ").title(),
                "url": x.get('href'),
                "source": "yify"
            } for x in BeautifulSoup(response.text, features="lxml").find_all("a", {"class": "browse-movie-link"})
        ]
        
        return data
    
    def get_info(self, data):
        if self.proxy:
            soup = BeautifulSoup(requests.post(self.proxy, json={"url": data['url']},  headers={'User-Agent':str(UA.random)}).text, features="lxml") 
        else:
            soup = BeautifulSoup(requests.get(data['url'],  headers={'User-Agent':str(UA.random)}).text, features="lxml")
        
        return [
            {
                "name": x.get("title").replace("Download ", "").replace(" Torrent", ""),
                "magnet": "magnet:?xt=urn:btih:"+x.get("href").split("/")[-1],
                "size": y
            } for x,y in zip(soup.find_all("a", {"class": "download-torrent button-green-download2-big"}), 
                [x.text for x in soup.find_all("p", {"class": "quality-size"}) if not x.text.isalpha()])
        ]