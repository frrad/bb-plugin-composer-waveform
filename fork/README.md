# bb-plugin-composer-waveform

A fork of [get-bb/bb](https://github.com/get-bb/bb) that adds a rebindable
voice-input keyboard shortcut to bb's Composer.

## Why

bb's composer only starts voice input from the mic button. This fork adds a
keyboard command so you can dictate without reaching for the mouse, and send
the transcript with Enter.

(The fork used to also carry a waveform that animated under reduced motion.
bb 0.48.0 ships that upstream (get-bb/bb#6398), so the fork dropped it.)

## What the fork changes

All in `plugins/composer`:

- `app.tsx` registers **Toggle voice input**, a rebindable Composer command
  whose default shortcut is Mod+D. Press it again to transcribe into the
  draft; Enter while recording transcribes and sends.
- `src/voice-input-command.ts` routes the command to the active composer.
- `src/PromptBoxInternal.tsx` connects that command to the composer's voice
  input and handles Enter while recording.
- `package.json` and `app.tsx` rename the plugin to `composer-waveform`,
  "Composer (voice shortcut)", because bundled plugin ids are reserved. The
  id keeps its old name so keybinding overrides like
  `plugin:composer-waveform/start-voice-input` keep working.

A composer you install wins over the bundled one under Settings → Appearance →
Composer → Automatic. Pick "Composer" there to go back to bb's own.

## Install

```sh
git clone -b composer-waveform git@github.com:frrad/bb-plugin-composer-waveform.git
cd bb-plugin-composer-waveform
git remote add upstream https://github.com/get-bb/bb.git
NO_PUSH=1 fork/rebuild.sh
bb plugin install path:"$PWD/plugins/composer"
```

## After every bb update

The fork is built for one bb release, so rebuild it whenever bb updates:

```sh
fork/rebuild.sh
```

It rebases the commit onto `desktop-v$(bb --version)`, installs the
composer's dependencies, builds `plugins/composer/dist`, reloads the plugin,
and force-pushes the `composer-waveform` branch. If the rebase conflicts it
aborts and leaves the branch as it was.
