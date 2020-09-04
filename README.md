# docker-linux
Proof of concept for linux-based unity setup in docker

## Setup

Clone this repo

```bash
git clone git@github.com:unity-ci/docker-linux.git 
```

Change directory to clone directory

```bash
cd docker-linux
```

Build the image

```bash
docker build . -t proto
```

## Usage

Run image

```
docker run -it --rm --cap-add SYS_ADMIN --device /dev/fuse proto bash
```

> _The flags for `-cap-add SYS_ADMIN --device /dev/fuse` are needed for Fuse._

Run UnityHub

```
xvfb-run /opt/unity/UnityHub.AppImage
```

Start experimenting or wait for updates to the readme :)
