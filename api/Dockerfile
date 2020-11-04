FROM python:3.7-slim-buster
# FROM ubuntu:18.04
# ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
# ENV PATH /opt/conda/bin:$PATH

# RUN apt-get update --fix-missing && \
#     apt-get install -y bzip2 ca-certificates curl git vim htop zip unzip htop wget procps && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# ENV DEBIAN_FRONTEND=noninteractive
# ENV PYTHONPATH="/opt/conda/bin/":$PYTHONPATH
# RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-4.5.11-Linux-x86_64.sh -O ~/miniconda.sh && \
#     /bin/bash ~/miniconda.sh -b -p /opt/conda && \
#     rm ~/miniconda.sh && \
#     /opt/conda/bin/conda clean -tipsy && \
#     apt-get update -y && apt-get install python3-libtorrent -y && \
#     ln -s /usr/lib/python3/dist-packages/libtorrent.cpython-36m-x86_64-linux-gnu.so /opt/conda/bin/libtorrent.so && \
#     ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
#     echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
#     echo "conda activate base" >> ~/.bashrc

WORKDIR /app
COPY . .

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
    && apt-get install python3-libtorrent -y \
    && apt-get install vim htop curl wget zip unzip procps git -y

ENV PYTHONPATH="/usr/lib/python3/dist-packages":$PYTHONPATH
RUN pip install -r /app/requirements.txt --no-cache-dir
CMD /app/entrypoint.sh