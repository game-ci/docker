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
docker build images/ubuntu/base -t base
```

Build hub

```bash
docker build images/ubuntu/hub -t hub
```

Build editor

```bash
docker build images/ubuntu/editor -t editor
```


