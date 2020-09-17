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

## Configure

Configure editor path

```
xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage --no-sandbox --headless install-path --set /opt/unity/editors/
```

## Run UnityHub

> _Use `xvfb-run -e /dev/stdout` to output everything to console_

#### help

Run the help command

```bash
xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage --no-sandbox --headless help
```

#### install

Get a link from the [archive](https://unity3d.com/get-unity/download/archive).

The link `unityhub://2020.1.4f1/fa717bb873ec` holds version `2020.1.4f1` and hash `fa717bb873ec`.

Since we want to install android build support, we'll add `--module android`.

```bash
xvfb-run -e /dev/stdout /opt/unity/UnityHub.AppImage --no-sandbox --headless install --version 2020.1.4f1 --changeset fa717bb873ec --module android
```

## Todo

- Shrink image to a minimum
- Generate proper unity images with the correct NDK/SDK based on official versions

## License

[MIT license](./LICENSE)
