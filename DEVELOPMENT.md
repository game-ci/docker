# Development

## Setup

Clone this repo

```bash
git clone git@github.com:unity-ci/docker-linux.git 
```

Change directory to clone directory

```bash
cd docker-linux
```

Build the base image

```bash
docker build base -t base
```

Build hub

```bash
docker build hub -t hub
```

Build editor

```bash
docker build editor -t editor
```


