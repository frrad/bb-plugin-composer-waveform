// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import type { PluginComposerApi } from "@get-bb/plugin-sdk/app";
import { loadPluginApp } from "@get-bb/plugin-sdk/testing/app";
import {
  registerVoiceInputHandler,
  runVoiceInputCommand,
  voiceInputKeyAction,
} from "./src/voice-input-command";

const app = await loadPluginApp(() => import("./app"));

function voiceInputCommand() {
  const command = app.commandPaletteActions.find(
    (candidate) => candidate.id === "start-voice-input",
  );
  if (!command) throw new Error("Voice input command is not registered");
  if (command.target !== "composer") {
    throw new Error("Expected a composer command");
  }
  return command;
}

function runCommand(composerKey: string) {
  voiceInputCommand().run({
    composer: { key: composerKey } as PluginComposerApi,
  });
}

describe("voice input command", () => {
  it("is a rebindable composer command with Mod+D as its default", () => {
    expect(voiceInputCommand()).toMatchObject({
      title: "Toggle voice input",
      defaultShortcut: { key: "d", mod: true },
    });
  });

  it("starts an idle composer and unregisters cleanly", () => {
    const start = vi.fn();
    const stop = vi.fn();
    const unregister = registerVoiceInputHandler("thread/test", {
      state: "idle",
      start,
      stop,
    });

    runCommand("thread/test");

    expect(start).toHaveBeenCalledOnce();
    expect(stop).not.toHaveBeenCalled();
    unregister();
    runVoiceInputCommand("thread/test");
    expect(start).toHaveBeenCalledOnce();
  });

  it("stops a recording composer so its transcript is added to the draft", () => {
    const start = vi.fn();
    const stop = vi.fn();
    const unregister = registerVoiceInputHandler("thread/test", {
      state: "recording",
      start,
      stop,
    });

    runCommand("thread/test");

    expect(stop).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    unregister();
  });

  it("does not restart while a recording is already transcribing", () => {
    const start = vi.fn();
    const unregister = registerVoiceInputHandler("thread/test", {
      state: "transcribing",
      start,
      stop: vi.fn(),
    });

    runCommand("thread/test");

    expect(start).not.toHaveBeenCalled();
    unregister();
  });
});

describe("voice input keyboard actions", () => {
  const modifiers = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  };

  it("uses plain Enter to transcribe and send", () => {
    expect(voiceInputKeyAction({ key: "Enter", ...modifiers })).toBe("send");
  });

  it("leaves modified Enter combinations alone", () => {
    for (const modifier of ["altKey", "ctrlKey", "metaKey", "shiftKey"]) {
      expect(
        voiceInputKeyAction({
          key: "Enter",
          ...modifiers,
          [modifier]: true,
        }),
      ).toBeNull();
    }
  });

  it("keeps Escape as cancel and ignores unrelated keys", () => {
    expect(voiceInputKeyAction({ key: "Escape", ...modifiers })).toBe(
      "cancel",
    );
    expect(voiceInputKeyAction({ key: "d", ...modifiers })).toBeNull();
  });
});
