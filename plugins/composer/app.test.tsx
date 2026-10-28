// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import type { PluginComposerApi } from "@get-bb/plugin-sdk/app";
import { loadPluginApp } from "@get-bb/plugin-sdk/testing/app";
import {
  registerVoiceInputStarter,
  runVoiceInputCommand,
} from "./src/voice-input-command";

const app = await loadPluginApp(() => import("./app"));

function voiceInputCommand() {
  const command = app.commandPaletteActions.find(
    (candidate) => candidate.id === "start-voice-input",
  );
  if (!command) throw new Error("Start voice input command is not registered");
  return command;
}

describe("voice input command", () => {
  it("is a rebindable composer command with Mod+D as its default", () => {
    expect(voiceInputCommand()).toMatchObject({
      target: "composer",
      title: "Start voice input",
      defaultShortcut: { key: "d", mod: true },
    });
  });

  it("runs the starter registered by the target composer", () => {
    const start = vi.fn();
    const unregister = registerVoiceInputStarter("thread/test", start);
    const command = voiceInputCommand();
    if (command.target !== "composer") {
      throw new Error("Expected a composer command");
    }

    command.run({
      composer: { key: "thread/test" } as PluginComposerApi,
    });

    expect(start).toHaveBeenCalledOnce();
    unregister();
    runVoiceInputCommand("thread/test");
    expect(start).toHaveBeenCalledOnce();
  });
});
