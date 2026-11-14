# Unity-CI image of the Unity Editor

#### `unity-ci/editor`

Dockerised Unity Editor made for continuous integration.

## Usage

Run the editor image using an interactive shell

```bash
docker run -it --rm unityci/editor:[tag] bash
```
example

```bash
docker run -it --rm unityci/editor:ubuntu-2020.1.1f1-android-0.3.0 bash
```


Run the editor 

```bash
unity-editor help
```

⚠ Note that the `help`-command currently does not work, but other commands do.

## Semaphore EINTR shim

The editor's texture compressor (Crunch) aborts an import with
`semaphore: sem_wait() or sem_timedwait() failed` when a signal interrupts one of its semaphore waits
([#243](https://github.com/game-ci/docker/issues/243)).
`unity-editor` therefore preloads `/usr/lib/game-ci/libsem_eintr_retry.so`, which retries those waits.
It only acts on calls from the editor executable's own code, so libraries such as Mono keep their behaviour.

| Variable                  | Default | Effect                                    |
|---------------------------|---------|-------------------------------------------|
| `SEM_EINTR_RETRY`         | `true`  | Set to `false` to not preload the shim    |
| `SEM_EINTR_RETRY_LOG`     | unset   | Set to `1` to log activation and retries  |

## License

[MIT license](https://github.com/game-ci/docker/blob/main/LICENSE)

