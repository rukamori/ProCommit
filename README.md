<div align="center">
  <img src="https://raw.githubusercontent.com/rukamori/ProCommit/refs/heads/main/assets/images/icon.png" alt="ProCommit logo" width="88px" />
  <h2 align="center">ProCommit</h2>
  <p align="center">A VS Code extension for generating clean, customizable commit messages with AI.</p>
  <p align="center">
    <a href="https://github.com/rukamori/ProCommit/actions/workflows/build.yml">
      <img alt="Build" src="https://img.shields.io/github/actions/workflow/status/rukamori/ProCommit/.github%2Fworkflows%2Fbuild.yml?style=flat-square" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Kochan.pro-commit">
      <img alt="VS Marketplace" src="https://img.shields.io/visual-studio-marketplace/v/Kochan.pro-commit?style=flat-square" />
    </a>
    <a href="https://open-vsx.org/extension/Kochan/pro-commit">
      <img alt="OpenVSX" src="https://img.shields.io/open-vsx/v/Kochan/pro-commit?style=flat-square&label=OpenVSX" />
    </a>
    <a href="./LICENSE">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
    </a>
  </p>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=Kochan.pro-commit">Install from Marketplace</a>
    ·
    <a href="https://open-vsx.org/extension/Kochan/pro-commit">Install from OpenVSX</a>
  </p>
</div>

---

## Features

- Generate commit messages directly from the Source Control view.
- Choose your generator: ChatGPT, Gemini, Ollama, LMStudio, Smithery, or a custom endpoint.
- Multilingual output: English, Japanese, Korean, German, and Russian.
- Clean formatting controls: emojis, multiple candidates, and scope formatting with file extensions.
- Fine-tune outputs with model, temperature, max tokens, and endpoint settings.

![demo](./example/demo.gif)

## Quick Start

1. Install ProCommit from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=Kochan.pro-commit) or [OpenVSX](https://open-vsx.org/extension/Kochan/pro-commit).
2. Open a Git repository in VS Code.
3. Configure your generator and credentials:
   - Command Palette → `ProCommit: Set API key` (if your generator requires one)
   - Or Settings → `procommit.apiKey`
4. Generate a message:
   - Source Control view → click `Generate ProCommit`
   - Or Command Palette → `ProCommit: Generate ProCommit`

## Requirements

- Depending on the generator you select, you may need an API key (for example, OpenAI / Gemini / Smithery).
- For local generators (like Ollama or LMStudio), you typically only need a reachable endpoint.

## Install (Manually)

1. Download a VSIX from the [Direct Link](https://nightly.link/rukamori/ProCommit/workflows/build/main/ProCommit.vsix.zip).
2. In VS Code, open Extensions → `...` → Install from VSIX…
3. Select the downloaded VSIX file.

## Extension Settings

These keys can be changed in VS Code Settings UI or in your `settings.json`.

| Setting | Default | Description |
| --- | --- | --- |
| `procommit.general.generator` | `ChatGPT` | Generator used to create commit messages. Options: `ChatGPT`, `Gemini`, `Ollama`, `LMStudio`, `Smithery`, `Custom`. |
| `procommit.general.messageApproveMethod` | `Quick pick` | How you approve and apply the generated message. Options: `Quick pick`, `Message file`. |
| `procommit.general.language` | `English` | Language used for generated commit messages. |
| `procommit.general.showEmoji` | `false` | Include emojis in commit messages. |
| `procommit.general.useMultipleResults` | `false` | When enabled (and using Quick pick), shows multiple generated candidates. |
| `procommit.general.includeFileExtension` | `true` | Include file extensions in commit scope (for example, `app.js` vs `app`). |
| `procommit.apiKey` | empty | API key for generators that require authentication. |
| `procommit.endpoint` | empty | Custom endpoint URL for generators. Leave blank to use the generator default. |
| `procommit.model` | empty | Optional model identifier/version. Leave blank to use the generator default. |
| `procommit.temperature` | `0.2` | Output randomness (lower is more deterministic). |
| `procommit.maxTokens` | `196` | Maximum tokens used for generation. |

### Example `settings.json`

```json
{
  "procommit.general.generator": "ChatGPT",
  "procommit.general.language": "English",
  "procommit.general.messageApproveMethod": "Quick pick",
  "procommit.general.showEmoji": false,
  "procommit.general.useMultipleResults": true,
  "procommit.general.includeFileExtension": true,
  "procommit.apiKey": "",
  "procommit.endpoint": "",
  "procommit.model": "",
  "procommit.temperature": 0.2,
  "procommit.maxTokens": 196
}
```

## Commands

Available in the Command Palette:

- `ProCommit: Generate ProCommit`
- `ProCommit: Set API key`
- `ProCommit: Set Generator`
- `ProCommit: Set Language`
- `ProCommit: Set Message Approve Method`
- `ProCommit: Set Include File Extension in Scope`
- `ProCommit: Set Model Version`
- `ProCommit: Set Custom Endpoint`
- `ProCommit: Set Temperature`
- `ProCommit: Set Max Tokens`

## Troubleshooting

- No button in Source Control: ensure `scmProvider == git` and a Git repository is opened.
- API errors: verify `procommit.apiKey`, `procommit.endpoint`, and `procommit.model` match your selected generator.
- No changes detected: stage or modify files before generating; ProCommit uses your repository diff to create a message.

## License

Released under the [MIT License](/LICENSE) by [@rukamori](https://github.com/rukamori).

## Contributing

Feature requests and new language support are welcome. Please open an issue on the [GitHub repository](https://github.com/rukamori/ProCommit/issues).
