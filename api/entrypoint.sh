#!/bin/bash

if [[ ! -e 'logs' ]]; then
    mkdir logs
fi

HOST="0.0.0.0"; PORT="5000"; WORKERS="4";
ACCESS_LOG="logs/gunicorn-access.log";
ERROR_LOG="logs/gunicorn-error.log";
TIMEOUT=300;

# kill previous running process, if any
if [[ `pgrep gunicorn` ]];then kill -9 `pgrep gunicorn`;fi
if [[ `pgrep tail` ]];then kill -9 `pgrep tail`;fi

# start gunicorn workers as background process
bash -c "gunicorn --bind $HOST:$PORT --workers $WORKERS --threads $WORKERS \
    --timeout $TIMEOUT \
    --worker-class=gevent --worker-connections=1000 \
    --log-config log.conf \
    app:app"&

# start tail commands in parallel
touch $ACCESS_LOG; touch $ERROR_LOG
bash -c "tail --pid=$$ -n0 -F $ERROR_LOG"&
bash -c "tail --pid=$$ -n0  -F $ACCESS_LOG"