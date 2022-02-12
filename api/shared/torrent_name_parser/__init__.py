# https://github.com/divijbindlish/parse-torrent-name
import re, os
from .parse import PTN

ptn = PTN()

def remove_emoji(string):
    emoji_pattern = re.compile("["
                            u"\U0001F600-\U0001F64F"  # emoticons
                            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                            u"\U0001F680-\U0001F6FF"  # transport & map symbols
                            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                            u"\U00002702-\U000027B0"
                            u"\U000024C2-\U0001F251"
                            "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', string)

def parse_name(raw):
    info = {
        'season': '',
        'episode': '',
        'resolution': '',
        'codec': '',
        'container': '',
        'title': remove_emoji(raw),
    }
    
    info.update(ptn.parse(info['title']))
    info.update({'key': f"{info['title'].replace(' ', '.')}.{'S' if info.get('season') else ''}{info['season']}.{'E' if info.get('episode') else ''}{info['episode']}".rstrip('.').rstrip('.')})
    
    return info