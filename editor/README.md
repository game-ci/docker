# Unity-CI image of the Unity Editor

#### `unity-ci/editor`

Dockerised Unity Editor made for continuous integration.

## Usage

Run the editor image using an interactive shell

```bash
docker run -it --rm unityci/editor:TAG bash
```
example

```bash
docker run -it --rm unityci/editor:ubuntu-2018.4.18f1-android-0.3.0 bash
```


Run the editor 

```bash
unity-editor help
```

## License

[MIT license](https://github.com/Unity-CI/docker/blob/main/LICENSE)

