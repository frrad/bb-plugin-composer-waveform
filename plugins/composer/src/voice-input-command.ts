const voiceInputStarters = new Map<string, () => void>();

export function registerVoiceInputStarter(
  composerKey: string,
  start: () => void,
): () => void {
  const previous = voiceInputStarters.get(composerKey);
  voiceInputStarters.set(composerKey, start);

  return () => {
    if (voiceInputStarters.get(composerKey) !== start) return;
    if (previous === undefined) voiceInputStarters.delete(composerKey);
    else voiceInputStarters.set(composerKey, previous);
  };
}

export function runVoiceInputCommand(composerKey: string): void {
  voiceInputStarters.get(composerKey)?.();
}
