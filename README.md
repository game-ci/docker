# docker-linux
Proof of concept for linux-based unity setup in docker

## Usage

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

Run interactive bash shell

```
docker run -it --rm proto bash
```

Start experimenting or wait for updates to the readme :)