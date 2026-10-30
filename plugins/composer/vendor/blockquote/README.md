Source from `@tiptap/extension-blockquote` 3.26.0 (MIT).

The published 3.26.0 bundle embeds its own ProseMirror classes. bb patches
that bundle in its pnpm workspace. This fork builds the original source
instead, so imports use the same `@tiptap/pm` classes as the editor during
Git/npm installs, where pnpm patches do not run.
