# Composer voice shortcut for bb

> **Deprecated.** This fork is superseded by
> [frrad/bb-plugin-composer-voice](https://github.com/frrad/bb-plugin-composer-voice),
> a standalone repo with the same plugin (`composer-waveform`) that targets
> current bb releases. Use that instead.

A fork of bb's Composer with a rebindable voice-input shortcut. **Mod+D**
toggles recording; **Enter** while recording transcribes and sends.

Install on bb 0.48.x:

```sh
bb plugin install git:https://github.com/frrad/bb-plugin-composer-waveform.git@main --subdirectory plugins/composer --yes
```

The plugin builds from published npm dependencies and vendored UI source,
without a local bb checkout. See [fork/README.md](fork/README.md) for migration,
updates, and development instructions.

This repository retains the [get-bb/bb](https://github.com/get-bb/bb) source
and MIT license. The installable plugin lives in `plugins/composer`; Git
installs select that directory and track `main`.
