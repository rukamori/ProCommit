export interface MsgGenerator {
  generate: (diff: string) => Promise<string | string[]>;
}

export type DiffFileChangeType = "added" | "deleted" | "modified" | "renamed";

export type DiffFileSummary = {
  path: string;
  oldPath?: string;
  changeType: DiffFileChangeType;
  additions: number;
  deletions: number;
  identifiers: string[];
  configKeys: string[];
  dependencies: string[];
};

export type DiffAnalysis = {
  files: DiffFileSummary[];
  dominantScopeHint?: string;
  typeHint?: string;
  primaryIdentifiers: string[];
};

const MAX_FILES_IN_PROMPT = 12;
const MAX_IDENTIFIERS_IN_PROMPT = 14;
const MAX_KEYS_IN_PROMPT = 14;
const MAX_DEPS_IN_PROMPT = 12;
const MAX_RAW_DIFF_CHARS = 18000;
const MAX_COMMIT_LINE_LENGTH = 71;
const ALLOWED_COMMIT_TYPES = new Set([
  "feat",
  "fix",
  "refactor",
  "chore",
  "docs",
  "style",
  "test",
  "perf",
]);

export function buildOllamaGenerateUrl(endpoint: string): string {
  const base = endpoint.trim().replace(/\/+$/, "");
  if (!base) return "http://localhost:11434/api/generate";

  const lower = base.toLowerCase();
  if (lower.endsWith("/api/generate")) return base;
  if (lower.endsWith("/api")) return `${base}/generate`;
  return `${base}/api/generate`;
}

export function createDiffAnalysis(diff: string): DiffAnalysis {
  const files: DiffFileSummary[] = [];

  let current: DiffFileSummary | undefined;
  let pendingRenameFrom: string | undefined;
  let pendingRenameTo: string | undefined;

  const lines = diff.split("\n");

  const commitCurrentFile = () => {
    if (!current) return;
    current.identifiers = uniqueKeepOrder(current.identifiers).slice(0, MAX_IDENTIFIERS_IN_PROMPT);
    current.configKeys = uniqueKeepOrder(current.configKeys).slice(0, MAX_KEYS_IN_PROMPT);
    current.dependencies = uniqueKeepOrder(current.dependencies).slice(0, MAX_DEPS_IN_PROMPT);
    files.push(current);
    current = undefined;
  };

  for (const line of lines) {
    const headerMatch = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (headerMatch) {
      commitCurrentFile();
      const [, aPath, bPath] = headerMatch;
      current = {
        path: bPath,
        oldPath: aPath !== bPath ? aPath : undefined,
        changeType: "modified",
        additions: 0,
        deletions: 0,
        identifiers: [],
        configKeys: [],
        dependencies: [],
      };
      pendingRenameFrom = undefined;
      pendingRenameTo = undefined;
      continue;
    }

    if (!current) continue;

    const newFileMode = line.match(/^new file mode\b/);
    if (newFileMode) {
      current.changeType = "added";
      continue;
    }

    const deletedFileMode = line.match(/^deleted file mode\b/);
    if (deletedFileMode) {
      current.changeType = "deleted";
      continue;
    }

    const renameFrom = line.match(/^rename from (.+)$/);
    if (renameFrom) {
      pendingRenameFrom = renameFrom[1].trim();
      continue;
    }

    const renameTo = line.match(/^rename to (.+)$/);
    if (renameTo) {
      pendingRenameTo = renameTo[1].trim();
      continue;
    }

    if (pendingRenameFrom && pendingRenameTo) {
      current.changeType = "renamed";
      current.oldPath = pendingRenameFrom;
      current.path = pendingRenameTo;
      pendingRenameFrom = undefined;
      pendingRenameTo = undefined;
    }

    if (line.startsWith("+++ ") || line.startsWith("--- ")) continue;
    if (line.startsWith("@@")) continue;

    const isAdd = line.startsWith("+");
    const isDel = line.startsWith("-");
    if (!isAdd && !isDel) continue;

    const payload = line.slice(1);
    if (payload.trim() === "") continue;

    if (isAdd) current.additions += 1;
    if (isDel) current.deletions += 1;

    const fileExt = getFileExtension(current.path);

    for (const id of extractIdentifiers(payload, fileExt)) {
      current.identifiers.push(id);
    }

    for (const key of extractConfigKeys(payload, current.path)) {
      current.configKeys.push(key);
    }

    for (const dep of extractDependencies(payload, current.path)) {
      current.dependencies.push(dep);
    }
  }

  commitCurrentFile();

  const sortedByWeight = [...files].sort(
    (a, b) => (b.additions + b.deletions) - (a.additions + a.deletions)
  );

  const primaryFiles = sortedByWeight.slice(0, MAX_FILES_IN_PROMPT);
  const primaryIdentifiers = uniqueKeepOrder(primaryFiles.flatMap((f) => f.identifiers)).slice(
    0,
    MAX_IDENTIFIERS_IN_PROMPT
  );

  const dominantScopeHint = pickScopeHint(files);
  const typeHint = pickTypeHint(primaryFiles);

  return {
    files: primaryFiles,
    dominantScopeHint,
    typeHint,
    primaryIdentifiers,
  };
}

export function createDiffAwareUserPrompt(diff: string): { userPrompt: string; analysis: DiffAnalysis } {
  const analysis = createDiffAnalysis(diff);
  const summaryLines: string[] = [];

  summaryLines.push("DIFF_SUMMARY");
  if (analysis.typeHint) summaryLines.push(`- type_hint: ${analysis.typeHint}`);
  if (analysis.dominantScopeHint) summaryLines.push(`- scope_hint: ${analysis.dominantScopeHint}`);

  if (analysis.files.length > 0) {
    summaryLines.push("- files:");
    for (const f of analysis.files) {
      const changeToken = f.changeType === "modified" ? "M" : f.changeType === "added" ? "A" : f.changeType === "deleted" ? "D" : "R";
      const stats = f.changeType === "renamed"
        ? `(${changeToken}) ${f.oldPath ?? "?"} -> ${f.path}`
        : `(${changeToken}) ${f.path} (+${f.additions} -${f.deletions})`;
      summaryLines.push(`  - ${stats}`);
    }
  }

  const keys = uniqueKeepOrder(analysis.files.flatMap((f) => f.configKeys)).slice(0, MAX_KEYS_IN_PROMPT);
  const deps = uniqueKeepOrder(analysis.files.flatMap((f) => f.dependencies)).slice(0, MAX_DEPS_IN_PROMPT);

  if (analysis.primaryIdentifiers.length > 0) {
    summaryLines.push(`- identifiers: ${analysis.primaryIdentifiers.join(", ")}`);
  }
  if (keys.length > 0) {
    summaryLines.push(`- config_keys: ${keys.join(", ")}`);
  }
  if (deps.length > 0) {
    summaryLines.push(`- dependencies: ${deps.join(", ")}`);
  }

  const rawExcerpt = trimToMaxChars(diff, MAX_RAW_DIFF_CHARS).trim();
  const userPrompt = `${summaryLines.join("\n")}\n\nRAW_DIFF\n${rawExcerpt}\n`;
  return { userPrompt, analysis };
}

export function postProcessCommitMessage(
  raw: string,
  params: { includeFileExtension: boolean; showEmoji?: boolean; analysis: DiffAnalysis }
): string {
  const cleaned = stripCodeFences(raw).trim();
  const line = stripLeadingCommitEmoji(pickFirstMeaningfulLine(cleaned));
  const normalized = normalizeConventionalCommitLine(
    line,
    params.includeFileExtension,
    params.analysis
  );
  if (!normalized) {
    return fallbackCommitMessage(
      params.analysis,
      params.includeFileExtension,
      params.showEmoji ?? false
    );
  }

  const match = normalized.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
  if (!match) {
    return fallbackCommitMessage(
      params.analysis,
      params.includeFileExtension,
      params.showEmoji ?? false
    );
  }

  const [, type, scope, subject] = match;
  const normalizedType = type.toLowerCase();
  const finalType = ALLOWED_COMMIT_TYPES.has(normalizedType)
    ? normalizedType
    : normalizeCommitType(params.analysis.typeHint);
  const finalScope = normalizeScope(scope, params.includeFileExtension, params.analysis);
  const finalSubject = normalizeSubject(
    stripLeadingCommitEmoji(subject.trim().replace(/^`+|`+$/g, "")),
    finalType,
    finalScope
  );

  if (looksGenericSubject(finalSubject) && params.analysis.primaryIdentifiers.length > 0) {
    return fallbackCommitMessage(
      params.analysis,
      params.includeFileExtension,
      params.showEmoji ?? false
    );
  }

  return formatCommitMessage(finalType, finalScope, finalSubject, params.showEmoji ?? false);
}

function fallbackCommitMessage(
  analysis: DiffAnalysis,
  includeFileExtension: boolean,
  showEmoji: boolean
): string {
  const scope = normalizeScope(
    analysis.dominantScopeHint ?? "changes",
    includeFileExtension,
    analysis
  );
  const type = normalizeCommitType(analysis.typeHint);

  const identifier = analysis.primaryIdentifiers[0];
  const fileToken = analysis.files[0]?.path ? basename(analysis.files[0].path) : undefined;

  const subjectParts: string[] = [];
  if (identifier) subjectParts.push(identifier);
  if (fileToken && (!identifier || identifier.toLowerCase() !== fileToken.toLowerCase())) subjectParts.push(fileToken);
  const subjectBase = subjectParts.length > 0 ? `update ${subjectParts.join(" ")}` : "update changes";

  return formatCommitMessage(
    type,
    scope,
    normalizeSubject(subjectBase, type, scope),
    showEmoji
  );
}

function pickTypeHint(files: DiffFileSummary[]): string | undefined {
  const paths = files.map((f) => f.path.toLowerCase());
  const isDocs = paths.every((p) => isDocsPath(p));
  if (isDocs) return "docs";

  const isCi = paths.some((p) => p.includes(".github/workflows/") || p.includes(".gitlab-ci") || p.endsWith(".circleci/config.yml"));
  if (isCi) return "chore";

  const isTest = paths.every((p) => isTestPath(p));
  if (isTest) return "test";

  const hasDeps = paths.some((p) => isDependencyFile(p));
  if (hasDeps) return "chore";

  const hasConfig = paths.some((p) => isConfigPath(p));
  if (hasConfig && paths.every((p) => isConfigPath(p) || isDependencyFile(p))) return "chore";

  const hasNew = files.some((f) => f.changeType === "added");
  if (hasNew) return "feat";

  return undefined;
}

function pickScopeHint(files: DiffFileSummary[]): string | undefined {
  if (files.length === 0) return undefined;
  if (files.length === 1) return basename(files[0].path);

  const parentSegments = files.map((file) => pathSegments(file.path).slice(0, -1));
  const commonParent = commonPathSegments(parentSegments);
  if (commonParent.length > 0) {
    return commonParent[commonParent.length - 1];
  }

  const folderCounts = new Map<string, number>();
  for (const segments of parentSegments) {
    const folder = segments[0];
    if (!folder) continue;
    folderCounts.set(folder, (folderCounts.get(folder) ?? 0) + 1);
  }

  return [...folderCounts.entries()]
    .sort(([leftFolder, leftCount], [rightFolder, rightCount]) => {
      return rightCount - leftCount || leftFolder.localeCompare(rightFolder);
    })[0]?.[0] ?? "changes";
}

function normalizeConventionalCommitLine(
  line: string,
  includeFileExtension: boolean,
  analysis: DiffAnalysis
): string | undefined {
  const trimmed = line
    .trim()
    .replace(/^\*\s*/, "")
    .replace(/^[-–—]\s*/, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "");

  if (!trimmed) return undefined;

  const match = trimmed.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
  if (!match) return trimmed.includes(":") ? trimmed.split("\n")[0].trim() : trimmed;

  let [, type, scope, subject] = match;
  type = normalizeCommitType(type);
  scope = normalizeScope(scope, includeFileExtension, analysis);
  subject = subject.trim();
  if (!subject) return undefined;
  return `${type}(${scope}): ${subject}`;
}

function normalizeScope(
  scope: string,
  includeFileExtension: boolean,
  analysis: DiffAnalysis
): string {
  let s = analysis.dominantScopeHint ?? scope.trim();
  s = s.replace(/^`+|`+$/g, "");
  s = s.replace(/^\/*|\/*$/g, "");
  s = s.split("/").pop() ?? s;
  s = s.split("\\").pop() ?? s;

  if (!includeFileExtension && analysis.files.length === 1) {
    const dotIndex = s.lastIndexOf(".");
    if (dotIndex > 0) s = s.slice(0, dotIndex);
  }

  return s || "changes";
}

function normalizeCommitType(type: string | undefined): string {
  const normalized = type?.trim().toLowerCase();
  return normalized && ALLOWED_COMMIT_TYPES.has(normalized) ? normalized : "chore";
}

function normalizeSubject(subject: string, type: string, scope: string): string {
  const lowercaseStart = subject.length > 0
    ? `${subject[0].toLowerCase()}${subject.slice(1)}`
    : "update changes";
  const withoutTrailingPeriod = lowercaseStart.trim().replace(/[.]+$/g, "") || "update changes";
  const maxLength = Math.max(
    1,
    MAX_COMMIT_LINE_LENGTH - `${type}(${scope}): `.length
  );

  if (withoutTrailingPeriod.length <= maxLength) {
    return withoutTrailingPeriod;
  }

  const truncated = withoutTrailingPeriod.slice(0, maxLength + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const boundary = lastSpace > 0 ? lastSpace : maxLength;
  return truncated.slice(0, boundary).trimEnd().replace(/[.,;:]+$/g, "");
}

const COMMIT_EMOJI_BY_TYPE: Readonly<Record<string, string>> = {
  feat: "\u2728",
  fix: "\u{1F41B}",
  docs: "\u{1F4DA}",
  style: "\u{1F48E}",
  refactor: "\u{1F528}",
  perf: "\u{1F680}",
  test: "\u{1F6A8}",
  chore: "\u{1F527}",
  build: "\u{1F3D7}\uFE0F",
  ci: "\u{1F477}",
  revert: "\u23EA",
};

function formatCommitMessage(type: string, scope: string, subject: string, showEmoji: boolean): string {
  const message = `${type}(${scope}): ${subject}`;
  if (!showEmoji) {
    return message;
  }
  const emoji = COMMIT_EMOJI_BY_TYPE[type];
  return emoji ? `${emoji} ${message}` : message;
}

function stripLeadingCommitEmoji(value: string): string {
  const trimmed = value.trimStart();
  for (const emoji of Object.values(COMMIT_EMOJI_BY_TYPE)) {
    if (trimmed.startsWith(emoji)) {
      return trimmed.slice(emoji.length).trimStart();
    }
  }
  return trimmed;
}

function pathSegments(path: string): string[] {
  return path.split(/[\\/]+/).map((segment) => segment.trim()).filter(Boolean);
}

function commonPathSegments(paths: string[][]): string[] {
  if (paths.length === 0) return [];

  const shortestLength = Math.min(...paths.map((segments) => segments.length));
  const common: string[] = [];
  for (let index = 0; index < shortestLength; index += 1) {
    const candidate = paths[0][index];
    if (!paths.every((segments) => segments[index] === candidate)) break;
    common.push(candidate);
  }
  return common;
}

function looksGenericSubject(subject: string): boolean {
  const s = subject.trim().toLowerCase();
  if (s.length < 8) return true;
  const genericStarts = [
    "update",
    "improve",
    "change",
    "fix",
    "refactor",
    "cleanup",
    "adjust",
    "modify",
    "tweak",
    "rework",
  ];
  const start = genericStarts.find((w) => s === w || s.startsWith(`${w} `));
  if (!start) return false;
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length <= 2) return true;
  const hasSpecificToken = tokens.some((t) => /[._/]|[a-z]+\d|[A-Z]/.test(t) || t.length >= 10);
  return !hasSpecificToken;
}

function stripCodeFences(text: string): string {
  return text.replace(/```[\s\S]*?```/g, (block) => {
    const inner = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
    return inner;
  });
}

function pickFirstMeaningfulLine(text: string): string {
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("diff --git")) continue;
    if (line.startsWith("RAW_DIFF")) continue;
    if (line.startsWith("DIFF_SUMMARY")) continue;
    return line;
  }
  return "";
}

function trimToMaxChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(0, maxChars - 1));
}

function uniqueKeepOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function basename(path: string): string {
  const lastSlash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
}

function getFileExtension(path: string): string {
  const name = basename(path);
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function extractIdentifiers(line: string, ext: string): string[] {
  const ids: string[] = [];

  const tsLike = ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx" || ext === "mjs" || ext === "cjs";
  if (tsLike) {
    const patterns = [
      /\bexport\s+(?:default\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bexport\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\b(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bexport\s+interface\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bexport\s+type\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\btype\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bexport\s+enum\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\benum\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bexport\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\b/,
      /\bconst\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?(?:\(|function\b)/,
      /\bdescribe\(\s*["'`]([^"'`]{1,60})["'`]/,
      /\bit\(\s*["'`]([^"'`]{1,60})["'`]/,
    ];
    for (const p of patterns) {
      const m = line.match(p);
      if (m?.[1]) ids.push(m[1]);
    }
  }

  if (ext === "py") {
    const m1 = line.match(/\bdef\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const m2 = line.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (m1?.[1]) ids.push(m1[1]);
    if (m2?.[1]) ids.push(m2[1]);
  }

  if (ext === "go") {
    const m1 = line.match(/\bfunc\s+(?:\([^)]+\)\s*)?([A-Za-z_][A-Za-z0-9_]*)\b/);
    const m2 = line.match(/\btype\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (m1?.[1]) ids.push(m1[1]);
    if (m2?.[1]) ids.push(m2[1]);
  }

  if (ext === "rs") {
    const m1 = line.match(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const m2 = line.match(/\bstruct\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const m3 = line.match(/\benum\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (m1?.[1]) ids.push(m1[1]);
    if (m2?.[1]) ids.push(m2[1]);
    if (m3?.[1]) ids.push(m3[1]);
  }

  if (ext === "java" || ext === "kt") {
    const m1 = line.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const m2 = line.match(/\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (m1?.[1]) ids.push(m1[1]);
    if (m2?.[1]) ids.push(m2[1]);
  }

  return ids;
}

function extractConfigKeys(line: string, path: string): string[] {
  const p = path.toLowerCase();
  const ext = getFileExtension(p);

  const keys: string[] = [];

  if (p.endsWith(".env") || p.includes(".env.")) {
    const m = line.match(/^\s*([A-Z0-9_]{2,})\s*=/);
    if (m?.[1]) keys.push(m[1]);
    return keys;
  }

  const jsonLike = ext === "json" || ext === "jsonc";
  if (jsonLike) {
    const m = line.match(/^\s*"?([A-Za-z0-9_.-]{2,})"?\s*:/);
    if (m?.[1]) keys.push(m[1]);
    return keys;
  }

  const yamlLike = ext === "yml" || ext === "yaml";
  if (yamlLike) {
    const m = line.match(/^\s*([A-Za-z0-9_.-]{2,})\s*:/);
    if (m?.[1]) keys.push(m[1]);
    return keys;
  }

  const tomlLike = ext === "toml";
  if (tomlLike) {
    const m = line.match(/^\s*([A-Za-z0-9_.-]{2,})\s*=/);
    if (m?.[1]) keys.push(m[1]);
    return keys;
  }

  return keys;
}

function extractDependencies(line: string, path: string): string[] {
  const p = path.toLowerCase();
  if (!(p.endsWith("package.json") || p.endsWith("package-lock.json") || p.endsWith("yarn.lock") || p.endsWith("pnpm-lock.yaml") || p.endsWith("bun.lockb"))) {
    return [];
  }

  if (p.endsWith("package.json")) {
    const m = line.match(/^\s*"(@?[^"]+)"\s*:\s*"[^"]+"/);
    if (m?.[1] && !m[1].startsWith("procommit.")) return [m[1]];
  }

  const lockDep = line.match(/^\s*"?(@?[^"\s]+)"?\s*(?:@|:)\s*/);
  if (lockDep?.[1]) return [lockDep[1]];
  return [];
}

function isDocsPath(p: string): boolean {
  return p.endsWith(".md") || p.endsWith(".mdx") || p.includes("/docs/") || p.startsWith("docs/");
}

function isTestPath(p: string): boolean {
  return (
    p.includes("/test/") ||
    p.includes("/tests/") ||
    p.includes("__tests__") ||
    p.endsWith(".spec.ts") ||
    p.endsWith(".spec.js") ||
    p.endsWith(".test.ts") ||
    p.endsWith(".test.js")
  );
}

function isConfigPath(p: string): boolean {
  return (
    p.endsWith(".yml") ||
    p.endsWith(".yaml") ||
    p.endsWith(".toml") ||
    p.endsWith(".ini") ||
    p.endsWith(".env") ||
    p.includes(".env.") ||
    p.endsWith(".json") ||
    p.endsWith(".jsonc")
  );
}

function isDependencyFile(p: string): boolean {
  return (
    p.endsWith("package.json") ||
    p.endsWith("package-lock.json") ||
    p.endsWith("yarn.lock") ||
    p.endsWith("pnpm-lock.yaml") ||
    p.endsWith("bun.lockb")
  );
}
