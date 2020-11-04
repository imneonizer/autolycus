FROM python:3.7-slim-buster
WORKDIR /app
COPY . .

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
    && apt-get install python3-libtorrent -y \
    && apt-get install vim htop curl procps git -y

ENV PYTHONPATH="/usr/lib/python3/dist-packages":$PYTHONPATH
RUN pip install -r /app/requirements.txt --no-cache-dir
CMD /app/entrypoint.sh