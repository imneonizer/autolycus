# Autolycus

A [seedr.cc](https://www.seedr.cc/) inspired web application to download torrent files on hosted web server.

- with remote file browsing / download support.
- Optimized for both web and mobile views, responsive layout.
- Built using React and Flask.

# How it looks

The app is fully optimised for desktop and mobile viewing. This is how it looks in different screen sizes

## Desktop views

<html>

<table>
    <tr>
        <img src="images/web-login.png" width="800px" style="padding: 5px;">
    	<img src="images/web-download.png" width="800px" style="padding: 5px;">
    	<img src="images/web-files.png" width="800px" style="padding: 5px;">
    </tr>
</table>

</html>

## Mobile views

<html>

<table>
    <tr>
    	<img src="images/mobile-login.png" width="300px" style="padding: 5px">
        <img src="images/mobile-download.png" width="300px" style="padding: 5px">
        <img src="images/mobile-files.png" width="300px" style="padding: 5px">
    </tr>
</table>

</html>

# How to set-up

This section tells you how to setup a self-hosted instance of Autolycus

## Pre-requisites

You will need the following before installation:

1. Docker Command line tools
    1. [Docker Engine](https://docs.docker.com/engine/install)
    1. [Docker Compose](https://docs.docker.com/compose/install/) command
1. Postgresql database with its username, password and host

## Setup

**Note**: You will need to be a sudoer or higher in the host you want to setup the instance in.

Follow these steps to setup the instance:

1. Create `.env` file inside the project root folder, add the following to it (refer `example.env`)

```env
POSTGRES_DB=autolycus              # Postgresql database name
POSTGRES_USER=admin                # Postgresql username
POSTGRES_PASSWORD=admin            # Postgresql password
API_URL=http://localhost:5000/api  # Endpoint at which the api will be serving
```

1. Run the following command (preferably in a tmux session or similiar to keep the server running after disconnecting)

```bash
sudo docker-compose up
```

This command will 
    - Pull appropriate NodeJS and 🐍 Python docker image from the marketplace
    - Install dependencies for Python (pip) and NodeJS (npm) on the first-time boot
    - Setup libtorrent for linux (for downloading torrents)

After succesfull completions, the react frontend (user entry point) would be open at port 3000 in **development** mode and api would be open at port 5000 (by default).