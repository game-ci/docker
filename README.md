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

## Run image

Just to run the image

```bash
docker run -it --rm proto bash
```

> _The flags `--cap-add SYS_ADMIN` and `--device /dev/fuse` are needed for Fuse to work._

```bash
docker run -it --rm --cap-add SYS_ADMIN --device /dev/fuse proto bash
```

> _Docker security profile `--security-opt apparmor:unconfined`._

```bash
docker run -it --rm --cap-add SYS_ADMIN --device /dev/fuse --security-opt apparmor:unconfined proto bash
```

## Run UnityHub

```bash
xvfb-run /opt/unity/UnityHub.AppImage
```

> _Use `xvfb-run -e /dev/stdout` to output everything to console

```bash
xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage
```

Start experimenting or wait for updates to the readme :)
