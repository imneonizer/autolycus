FROM python:3.7-buster
WORKDIR /app
COPY . .

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
    && apt-get install python3-libtorrent ffmpeg -y \
    && apt-get install gcc libpq-dev vim htop curl procps git -y

ENV PYTHONPATH="/usr/lib/python3/dist-packages":$PYTHONPATH
RUN pip install -r /app/requirements.txt --no-cache-dir
CMD chmod +x /app/entrypoint.sh && /app/entrypoint.sh