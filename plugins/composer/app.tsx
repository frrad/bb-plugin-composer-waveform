import {
  definePluginApp,
  experimental_useComposerRenderer as useComposerRenderer,
} from "@get-bb/plugin-sdk/app";
import { PromptBoxInternal } from "./src/PromptBoxInternal";
import "./src/composer.css";

function Composer() {
  const { input } = useComposerRenderer();
  return <PromptBoxInternal {...input} />;
}

export default definePluginApp((app) => {
  app.slots.experimental_composer({
    id: "composer",
    title: "Composer (animated waveform)",
    description:
      "bb's composer with a voice waveform that animates even when the OS asks for reduced motion.",
    component: Composer,
  });
});
