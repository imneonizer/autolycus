#!/bin/bash

NAME="autolycus_api"

if [[ $1 == "--build" || $1 == "-b" ]];then
    CMD="docker build . -t $NAME"
    echo "[exec] $CMD"
    $CMD
elif [[ $1 == "--run" || $1 == "-r" ]];then
    mkdir -p /home/$USER/Downloads/torrents
    CMD="docker run --rm -it -v $(pwd):/app -v /home/$USER/Downloads/torrents:/downloads -p 5000:5000 --name $NAME --hostname $NAME $NAME bash"
    echo "[exec] $CMD"
    $CMD
elif [[ $1 == "--attach" || $1 == "-a" ]];then
    CMD="docker exec -it $NAME bash"
    echo "[exec] $CMD"
    $CMD
fi