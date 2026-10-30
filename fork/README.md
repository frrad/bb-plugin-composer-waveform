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
bb plugin install git:https://github.com/frrad/bb-plugin-composer-waveform.git@main --subdirectory plugins/composer --yes
```

The install builds from published npm dependencies and the UI source vendored
from bb's component registry. It needs no local bb checkout or pnpm workspace.
The package currently targets bb 0.48.x.

If migrating from a folder install, back up its settings and secrets first,
then remove it with `bb plugin remove composer-waveform` and run the command
above. Its plugin id and keyboard command id stay the same.

Update after a compatible change lands on `main`:

```sh
bb plugin update composer-waveform --yes
```

## Development and bb updates

```sh
git clone https://github.com/frrad/bb-plugin-composer-waveform.git
cd bb-plugin-composer-waveform
fork/rebuild.sh
```

`fork/rebuild.sh` refreshes the plugin's vendored UI from this fork's registry,
installs its npm dependencies, and builds the plugin. It does not change Git
history or reload the installed Git source. Commit changes through a PR to
`main`, then update the installed plugin with the command above.

When updating to another bb release, update the fork's composer and registry
sources together, run the rebuild and composer checks, and adjust the package's
bb compatibility range after verifying it against that release. The legacy
`composer-waveform` branch retains the earlier rebasing workflow; Git installs
track `main`.
