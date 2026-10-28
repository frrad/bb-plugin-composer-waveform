# bb-plugin-composer-waveform

A fork of [get-bb/bb](https://github.com/get-bb/bb) that carries Composer
customizations on top of a bb release: a voice waveform that animates even
when the OS asks for reduced motion, and a rebindable voice-input shortcut.

## Why

bb's voice recording bar draws a flat line instead of a live waveform when
`prefers-reduced-motion: reduce` is set. On an Android e-ink phone, where
"Remove animations" is on, that leaves no sign that the mic is hearing
anything. Everything else keeps honoring reduced motion.

## What the fork changes

All in `plugins/composer`:

- `src/VoiceRecordingBar.tsx` and `src/WaveformVisualizer.tsx` are copies of
  the host components in `apps/app/src/components/promptbox`, with the
  reduced-motion check removed from the waveform.
- `src/PromptBoxInternal.tsx` renders that local `VoiceRecordingBar` instead
  of the SDK's `experimental_VoiceRecordingBar` and connects the voice-input
  command to the active composer.
- `app.tsx` registers **Toggle voice input**, a rebindable Composer command
  whose default shortcut is Mod+D. Press it again to transcribe into the
  draft; Enter while recording transcribes and sends.
- `package.json` and `app.tsx` rename the plugin to `composer-waveform`,
  "Composer (animated waveform)", because bundled plugin ids are reserved.

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
