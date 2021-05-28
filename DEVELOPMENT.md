# Development

## Setup

Clone this repo

```bash
git clone git@github.com:game-ci/docker.git 
```

Change directory to clone directory

```bash
cd docker
```

Build the base image

```bash
docker build -t base -f base/Dockerfile .
```

Build hub

```bash
docker build -t hub -f hub/Dockerfile .
```

Build editor

```bash
docker build -t editor -f editor/Dockerfile .
```


