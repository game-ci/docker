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

> _Currently it is unsure whether the security profile is needed or not._

## Run UnityHub

Run UnityHub in a framebuffer.

```bash
xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage
```

> _Use `xvfb-run -e /dev/stdout` to output everything to console_

## Todo

- Get past the update part, where it is currently stuck;

```bash
root@ad6f13368198:/tmp/squashfs-root# xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage
Checking for update
Update for version 2.3.2 is not available (latest version: 2.3.2, downgrade is disallowed).
```

- Shrink image to a minimum
- Generate proper unity images with the correct NDK/SDK based on official versions

## License

[MIT license](./LICENSE)
