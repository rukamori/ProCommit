# CHANGELOG

### What Changed

- Put Icons In Git SCM Bar

### Fixed

- Resolve Custom Generator Issue
- Resolve Emoji and Extension Options

## 2.1.2 - 2026-02-10

### What Changed

- Added a diff-aware pre-analysis step that extracts per-file stats, rename/add/delete info, likely scope/type hints, and “technical anchors” (identifiers, config keys, dependency names), then feeds the model DIFF_SUMMARY + RAW_DIFF instead of raw diff alone: msg-generator.ts:L1-L214
- Upgraded the base instructions so the subject is required to be concrete/technical (must mention at least one real artifact) and no longer forces everything to lowercase (keeps OAuth/HTTP/JSON casing, identifiers, etc.): langInstruction.ts
- Unified output cleanup across all generators (ChatGPT/Gemini/Ollama/LMStudio/Smithery/Custom) using the same post-processor, and added a fallback when the model returns generic “classic” subjects: msg-generator.ts:L191-L229
- Fixed Issue #70

### Better “Results” Handling

- Fixed multi-result selection so the chosen quick-pick result is actually written to the commit message file (previously selection didn’t affect output): generate-ai-commit.ts
- Enabled true multi-result output for the ChatGPT generator when useMultipleResults is enabled (returns a de-duplicated array): chatgpt-msg-generator.ts
- Updated the flow to accept string | string[] from generators and to write the selected message: generate-completion-flow.ts

### Fixed

- Removed the OpenAI SDK import entirely and switched the ChatGPT generator to call the OpenAI Chat Completions REST endpoint via node-fetch (same approach style as other generators).
- This avoids SDK export mismatches and bundles cleanly with esbuild.

## 2.1.1 - 2026-01-16

## Fixed
- fix: issue on [#69](https://github.com/koiverse/ProCommit/issues/69)
- fix: missing included file extension feature

## 2.1.0 - 2026-01-16

### Added
- feat: Add `procommit.general.includeFileExtension` setting to control inclusion of file extensions in commit scopes

### Changed
- refactor: Update ChatGPT commit message generator to respect `includeFileExtension` setting when formatting scopes

### Fixed
- fix: Ensure scope formatting correctly handles file extensions based on user configuration
- fix: ProCommit not detected git submodules


## 2.0.9 - 2025-09-01

### Added
- feat: Add support for specifying model versions via new `procommit.model` setting (e.g., gpt-4o, gemini-1.5-pro, llama3, etc.)
- feat: Add `procommit.supportedGenerators` setting to explicitly list all supported commit message generators
- feat: Add support for new generators: Gemini (Google), Ollama (local LLM), LMStudio (local LLM), Smithery, and Custom endpoints
- feat: Add support for workspace(s)/multiple repositories

### Changed
- refactor: Improve configuration schema for clarity and extensibility (all generator settings unified, model/endpoint/apiKey now top-level)
- refactor: Update generator code to use new config structure and robust, stateless, language-aware logic

### Fixed
- fix: Ensure all generators use correct instructions and config, and output is always conventional and clean

## 2.0.8 - 2025-07-19

### Added
- feat: Add support for specifying model versions via new `procommit.model` setting (e.g., gpt-4o, gemini-1.5-pro, llama3, etc.)
- feat: Add `procommit.supportedGenerators` setting to explicitly list all supported commit message generators
- feat: Add support for new generators: Gemini (Google), Ollama (local LLM), LMStudio (local LLM), Smithery, and Custom endpoints

### Changed
- refactor: Improve configuration schema for clarity and extensibility (all generator settings unified, model/endpoint/apiKey now top-level)
- refactor: Update generator code to use new config structure and robust, stateless, language-aware logic

### Fixed
- fix: Ensure all generators use correct instructions and config, and output is always conventional and clean

## 2.0.7 - 2025-07-11

### Changes
- Improve Language accuraty for filename and insctruction

## 2.0.6 - 2025-01-18

### Added

- feat(langInstruction): Introduce Russian language instructions for user guidance and improve code readability by using consistent naming conventions for variables related to the instruction set.
- feat(configuration): introduce new configuration option to show emojis in the UI
- feat(customInstruction): introduce emoji instructions based on user preference.
- feat: add new emoji instruction
- feat(package): add configuration option to show emojis in commit messages.
- feat(README): update features section with new emoji support and customization options.
- feat(chatgpt-msg-generator): enhance commit message generation with async instructions and configurable results

### Changes

- refactor(customInstruction): simplify instruction retrieval by removing unused language instructions and emoji condition
- refactor(langInstruction): update commit message guidelines for clarity and consistency

### Fixed

- fix(package.json): remove deprecated scm/inputBox configuration option.
- fixed knows issue

## 2.0.5 - 2025-01-11

### Fixed

- Fixes Critical Error Cause Build Failed On Output!

## 2.0.4 - 2025-01-11

### Added

- Introducing new icons
- enhance command options in configuration
- enhance lang instructions for concise git commit message generation (improve instruction significantly)
- Added setTemperature command for configuring AI commit message temperature
- Added command to set AI model version
- Added command to set message approval method
- Added command to set maximum tokens
- Added command to set language
- Added command to set generator
- Add command to set custom endpoint
- Add new command exports for generator configuration for indwx main file
- Added additional command registrations for commit message generation settings

### Changes

- Rename progress notification title

### Fixed

- remove commented-out code for clarity from msg-generator
- fixed known issue about incorrect given commit message
- fixed issue about commit message contain unrelated comments and diff

### Removed

- Removed ChatCompletionRequestMessageRoleEnum.Assistant for customInstruction

## 2.0.3 - 2025-01-09

### Added

- docs: Update README to enhance description of the VS Code extension
- Update More Informative Docs
- Add Korean and German language
- Add Korean and German to language options in configuration schema
- Add support for Korean and German instructions in customInstruction utility
- docs(langInstruction): add instructions in Korean and German

### Changed

- fix enum modelVersion
- chore: Update package, enhance description and add more language support for commit messages


## 2.0.2 - 2025-01-09

### Changed

- update README to reflect changes in OpenAI model version and add contributing section
- rename gptVersion to modelVersion and update default endpoint URL
- update OpenAI configuration schema to use modelVersion and set default customEndpoint

### Fixed

- update model version configuration in ChatgptMsgGenerator
- update release workflow to use softprops/action-gh-release and set permissions
- update tag and release name references to use ref_name
- add assistant instructions for English, Russian, and Japanese
- Fixed another known issue



## 2.0.1 - 2025-01-07

### Added

- enhance message generation by adding assistant instruction retrieval
- add multilingual instructions for generating commit messages
- add system instruction retrieval based on language configuration
- add support for custom commit message generators and update language options
- add language configuration and parsing logic
- 

### Changed

- simplify commit message generation logic and improve system instruction handling
- update documentation to include language support for commit message generation
- update commit message prompt to include language detection and correct conventional commit format
- update description to reflect new AI commit message feature and increment version to 2.0.1

### Fixed

- Fixed knows issue


## 2.0.0 - 2025-01-09

### First Release