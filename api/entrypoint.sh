#!/bin/bash

HOST="0.0.0.0"; PORT="5000"; WORKERS="4";
ACCESS_LOG="/var/log/gunicorn-access.log";
ERROR_LOG="/var/log/gunicorn-error.log";

# kill previous running process, if any
if [[ `pgrep gunicorn` ]];then kill -9 `pgrep gunicorn`;fi
if [[ `pgrep tail` ]];then kill -9 `pgrep tail`;fi

# start gunicorn workers as background process
bash -c "gunicorn --bind $HOST:$PORT -w $WORKERS \
    --access-logfile $ACCESS_LOG  \
    --error-logfile $ERROR_LOG \
    app:app"&

# start tail commands in parallel
touch $ACCESS_LOG; touch $ERROR_LOG
bash -c "tail --pid=$$ -n0 -F $ERROR_LOG"&
bash -c "tail --pid=$$ -n0  -F $ACCESS_LOG"