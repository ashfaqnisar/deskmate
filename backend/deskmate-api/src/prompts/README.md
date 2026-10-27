# Prompts

One folder per prompt, one file per version: `<name>/<version>.md`.

- `system/` is the Deskmate persona used for every chat reply. Variables: `{{today}}`.
- `intent/` is the classifier that labels each message before the main answer.

To change a prompt, add a new version file (for example `system/v3.md`) and bump the version in `index.ts`. Keep old versions so eval runs can be compared. Run `bun run eval --compare` after every change.
