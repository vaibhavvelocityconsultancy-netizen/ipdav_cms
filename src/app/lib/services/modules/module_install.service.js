import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { requireAuth, requirePermission } from "../../withPermission.js";

// ─── Paths ──────────────────────────────────────────────

const PROJECT_ROOT = process.cwd();
const SCHEMA_PATH = path.join(PROJECT_ROOT, "prisma", "schema.prisma");
const PKG_PATH = path.join(PROJECT_ROOT, "package.json");
const LOCK_PATH = path.join(PROJECT_ROOT, "package-lock.json");
const CONFIG_PATH = path.join(PROJECT_ROOT, "cmskit.config.json");

const GITHUB_ORG = process.env.CMSKIT_MODULES_ORG;
const GITHUB_REPO = process.env.CMSKIT_MODULES_REPO;
const GITHUB_TOKEN = process.env.CMSKIT_MODULES_TOKEN;

function githubRepoPath() {
  const org = process.env.CMSKIT_MODULES_ORG;
  const repo = process.env.CMSKIT_MODULES_REPO;

  if (!org || !repo) {
    throw new Error(
      "CMSKIT_MODULES_ORG and CMSKIT_MODULES_REPO must be configured",
    );
  }

  return `${org}/${repo}`;
}
// ─── Helpers ──────────────────────────────────────────────

function statusFilePath() {
  return path.join(PROJECT_ROOT, "tmp", "module-operation-status.json");
}

export function readInstalledModules() {
  if (!fs.existsSync(CONFIG_PATH)) return { installedModules: [] };
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function writeInstalledModules(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ─── Status / job logging ─────────────────────────────────

export async function writeJobStatus(jobId, data) {
  fs.mkdirSync(path.dirname(statusFilePath()), { recursive: true });
  fs.writeFileSync(statusFilePath(), JSON.stringify(data, null, 2));
}

export async function readJobStatus(jobId) {
  if (!fs.existsSync(statusFilePath())) {
    throw new Error("Job not found");
  }
  return JSON.parse(fs.readFileSync(statusFilePath(), "utf-8"));
}

export async function appendJobLog(jobId, message) {
  const current = fs.existsSync(statusFilePath())
    ? JSON.parse(fs.readFileSync(statusFilePath(), "utf-8"))
    : { logs: [] };

  current.logs = current.logs || [];
  current.logs.push(`[${new Date().toISOString()}] ${message}`);
  current.status = "running";

  await writeJobStatus(jobId, current);
}

// ─── Backup / restore ─────────────────────────────────────

export async function backupBeforeInstall(jobId) {
  await requirePermission("modules_install");

  const schemaBackup = `${SCHEMA_PATH}.backup-${jobId}`;
  const pkgBackup = `${PKG_PATH}.backup-${jobId}`;
  let lockBackup = null;

  fs.copyFileSync(SCHEMA_PATH, schemaBackup);
  fs.copyFileSync(PKG_PATH, pkgBackup);

  if (fs.existsSync(LOCK_PATH)) {
    lockBackup = `${LOCK_PATH}.backup-${jobId}`;
    fs.copyFileSync(LOCK_PATH, lockBackup);
  }

  return { schemaBackup, pkgBackup, lockBackup };
}

export async function restoreFromBackup({
  schemaBackup,
  pkgBackup,
  lockBackup,
}) {
  await requirePermission("modules_install");

  if (schemaBackup && fs.existsSync(schemaBackup)) {
    fs.copyFileSync(schemaBackup, SCHEMA_PATH);
    fs.rmSync(schemaBackup);
  }
  if (pkgBackup && fs.existsSync(pkgBackup)) {
    fs.copyFileSync(pkgBackup, PKG_PATH);
    fs.rmSync(pkgBackup);
  }
  if (lockBackup && fs.existsSync(lockBackup)) {
    fs.copyFileSync(lockBackup, LOCK_PATH);
    fs.rmSync(lockBackup);
  }

  execSync("npm install --ignore-scripts", {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

export async function clearBackups({ schemaBackup, pkgBackup, lockBackup }) {
  [schemaBackup, pkgBackup, lockBackup].forEach((backupPath) => {
    if (backupPath && fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { force: true });
    }
  });
}

export async function backupDatabase(jobId) {
  await requirePermission("modules_install");

  if (!process.env.CMSKIT_DB_BACKUP_CMD) return null;

  const outPath = path.join(PROJECT_ROOT, "tmp", `db-backup-${jobId}.sql`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  execSync(process.env.CMSKIT_DB_BACKUP_CMD.replace("{OUT}", outPath));

  return outPath;
}

// ─── GitHub fetch ──────────────────────────────────────────

function githubRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "User-Agent": "cmskit-installer",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
        (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () =>
            resolve({ statusCode: res.statusCode || 0, body }),
          );
        },
      )
      .on("error", reject);
  });
}

async function downloadGitHubDirectory(
  githubPath,
  destinationPath,
  ref = "main",
) {
  const repoPath = githubRepoPath();
  const url = `https://api.github.com/repos/${repoPath}/contents/${githubPath}?ref=${encodeURIComponent(ref)}`;
  const response = await githubRequest(url);

  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to fetch ${githubPath}: ${response.statusCode} - ${response.body}`,
    );
  }

  const items = JSON.parse(response.body);
  if (!Array.isArray(items)) {
    throw new Error(`GitHub path is not a directory: ${githubPath}`);
  }

  await fs.promises.mkdir(destinationPath, { recursive: true });

  for (const item of items) {
    const localPath = path.join(destinationPath, item.name);

    if (item.type === "dir") {
      await downloadGitHubDirectory(item.path, localPath, ref);
      continue;
    }

    if (item.type !== "file") continue;

    console.log(`Downloading: ${item.path}`);
    const fileUrl = `${item.url}${item.url.includes("?") ? "&" : "?"}ref=${encodeURIComponent(ref)}`;
    const fileResponse = await githubRequest(fileUrl);

    if (fileResponse.statusCode !== 200) {
      throw new Error(
        `Failed to download ${item.path}: ${fileResponse.statusCode} - ${fileResponse.body}`,
      );
    }

    const fileData = JSON.parse(fileResponse.body);
    if (typeof fileData.content !== "string") {
      throw new Error(`GitHub did not return file content for ${item.path}`);
    }

    await fs.promises.mkdir(path.dirname(localPath), { recursive: true });
    await fs.promises.writeFile(
      localPath,
      Buffer.from(fileData.content.replace(/\n/g, ""), "base64"),
    );
  }
}

export async function downloadModuleDirectory(
  moduleName,
  destinationPath,
  ref = "main",
) {
  await requirePermission("modules_install");

  console.log("========== MODULE DOWNLOAD ==========");
  console.log("Module:", moduleName);
  console.log("Repository:", githubRepoPath());
  console.log(
    "URL:",
    `https://api.github.com/repos/${githubRepoPath()}/contents/${encodeURIComponent(moduleName)}?ref=${encodeURIComponent(ref)}`,
  );
  console.log("=====================================");

  await downloadGitHubDirectory(moduleName, destinationPath, ref); // ← removed "modules/" prefix
  return destinationPath;
}

export async function readModuleManifest(moduleDir) {
  const manifestPath = path.join(moduleDir, "module.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("module.json not found in downloaded module");
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

// ─── Dependency check ──────────────────────────────────────

export async function checkModuleDependencies(manifest) {
  const cfg = readInstalledModules();
  const missing = (manifest.dependencies || []).filter(
    (dep) => !cfg.installedModules.includes(dep),
  );

  if (missing.length > 0) {
    throw new Error(
      `Module "${manifest.name}" requires: ${missing.join(", ")} — install those first`,
    );
  }
}

// ─── File copy ─────────────────────────────────────────────

export async function copyModuleFiles(moduleDir, targetPaths) {
  await requirePermission("modules_install");

  const copiedPaths = [];

  try {
    for (const [src, dest] of Object.entries(targetPaths || {})) {
      const srcPath = path.join(moduleDir, src);
      const destPath = path.join(PROJECT_ROOT, dest);

      if (fs.existsSync(destPath)) {
        throw new Error(
          `Target path already exists, refusing to overwrite: ${dest}`,
        );
      }

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.cpSync(srcPath, destPath, { recursive: true });
      copiedPaths.push(destPath);
    }
  } catch (err) {
    err.copiedPaths = copiedPaths;
    throw err;
  }

  return copiedPaths;
}

export async function removeCopiedFiles(copiedPaths) {
  for (const filePath of [...copiedPaths].reverse()) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  }
}

function cacheInstalledModuleManifest(
  moduleName,
  manifest,
  installedPaths,
  schemaInjections = [],
) {
  const cachePath = path.join(PROJECT_ROOT, "modules-cache", moduleName);
  fs.mkdirSync(cachePath, { recursive: true });
  fs.writeFileSync(
    path.join(cachePath, "module.json"),
    JSON.stringify(
      {
        ...manifest,
        installedPaths,
        schemaInjections,
      },
      null,
      2,
    ),
  );
}

// ─── Schema merge ──────────────────────────────────────────

function getSchemaDefinitions(schemaText) {
  const definitions = [];
  const definitionRegex =
    /(^\s*(?:model|enum)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{[\s\S]*?^\})/gm;
  let match;

  while ((match = definitionRegex.exec(schemaText)) !== null) {
    definitions.push({ text: match[1], name: match[2] });
  }

  return definitions;
}

function getModelBody(schemaText, modelName) {
  const escapedName = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const modelRegex = new RegExp(
    `^model\\s+${escapedName}\\s*\\{([\\s\\S]*?)^\\}`,
    "m",
  );

  return schemaText.match(modelRegex)?.[1] || null;
}

function getPrismaFieldNames(body) {
  return new Set(
    String(body || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(
        (line) => line && !line.startsWith("//") && !line.startsWith("@@"),
      )
      .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s/))
      .filter(Boolean)
      .map((match) => match[1]),
  );
}

function getSchemaInjections(fragment) {
  const injectionRegex =
    /\/\/\s*INJECT_INTO:([A-Za-z0-9_]+)\s*\r?\n([\s\S]*?)\/\/\s*END_INJECT:\1/g;
  const injections = [];
  let match;

  while ((match = injectionRegex.exec(fragment)) !== null) {
    injections.push({ model: match[1], fields: match[2].trim() });
  }

  return { injectionRegex, injections };
}

// This covers installations made before installedModules was introduced or
// repaired. A fragment is considered present only when every model/enum and
// every injected field from that fragment already exists in the host schema.
function isSchemaFragmentAlreadyPresent(schema, fragment) {
  const definitions = getSchemaDefinitions(fragment);
  const definitionNames = new Set(
    getSchemaDefinitions(schema).map(({ name }) => name),
  );
  const { injections } = getSchemaInjections(fragment);

  const definitionsPresent = definitions.every(({ name }) =>
    definitionNames.has(name),
  );
  const injectionsPresent = injections.every((injection) => {
    const existingFields = getPrismaFieldNames(
      getModelBody(schema, injection.model),
    );
    const requiredFields = getPrismaFieldNames(injection.fields);
    return [...requiredFields].every((fieldName) =>
      existingFields.has(fieldName),
    );
  });

  return (
    (definitions.length > 0 || injections.length > 0) &&
    definitionsPresent &&
    injectionsPresent
  );
}

export async function mergeSchemaFragment(
  moduleDir,
  schemaFragmentName,
  moduleName = path.basename(moduleDir),
) {
  await requirePermission("modules_install");

  const fragmentPath = path.join(moduleDir, schemaFragmentName);

  if (!fs.existsSync(fragmentPath)) {
    throw new Error(`Schema fragment not found: ${schemaFragmentName}`);
  }

  let schema = fs.readFileSync(SCHEMA_PATH, "utf-8");

  // ---------------------------------------------------------
  // 1. Check whether this module is already installed
  // ---------------------------------------------------------

  const cfg = readInstalledModules();

  if (cfg.installedModules?.includes(moduleName)) {
    console.log(
      `Module "${moduleName}" is already installed. Skipping schema merge.`,
    );

    return {
      alreadyInstalled: true,
      skipped: true,
    };
  }

  const fragment = fs.readFileSync(fragmentPath, "utf-8");

  // ---------------------------------------------------------
  // 2. Check schema markers and existing fragment contents
  // ---------------------------------------------------------

  const moduleStartMarker = `// --- MODULE:${moduleName} START ---`;
  const moduleEndMarker = `// --- MODULE:${moduleName} END ---`;

  if (
    (schema.includes(moduleStartMarker) && schema.includes(moduleEndMarker)) ||
    isSchemaFragmentAlreadyPresent(schema, fragment)
  ) {
    console.log(
      `Schema for module "${moduleName}" already exists. Skipping merge.`,
    );

    return {
      alreadyInstalled: true,
      skipped: true,
    };
  }

  // ---------------------------------------------------------
  // 3. Extract INJECT_INTO blocks
  // ---------------------------------------------------------

  const { injectionRegex, injections } = getSchemaInjections(fragment);

  // ---------------------------------------------------------
  // 4. Remove injection blocks
  // ---------------------------------------------------------

  const modelsOnly = fragment.replace(injectionRegex, "").trim();

  // ---------------------------------------------------------
  // 5. Add only models/enums that do not already exist. This makes a merge
  // safe even if a previous interrupted installation wrote part of a fragment.
  // ---------------------------------------------------------

  const existingDefinitionNames = new Set(
    getSchemaDefinitions(schema).map(({ name }) => name),
  );
  const missingDefinitions = getSchemaDefinitions(modelsOnly).filter(
    ({ name }) => !existingDefinitionNames.has(name),
  );

  if (missingDefinitions.length > 0) {
    schema +=
      `\n\n${moduleStartMarker}\n` +
      missingDefinitions.map(({ text }) => text.trim()).join("\n\n") +
      `\n${moduleEndMarker}\n`;
  }

  // ---------------------------------------------------------
  // 6. Inject fields into existing models
  // ---------------------------------------------------------

  for (const injection of injections) {
    const modelName = injection.model.trim();

    const escapedModelName = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match ONLY the requested Prisma model.
    // ^ ensures we start at a real `model xxx {` declaration.
    // ^} ensures we stop at that model's closing brace.
    const modelRegex = new RegExp(
      `(^model\\s+${escapedModelName}\\s*\\{)([\\s\\S]*?)(^\\})`,
      "m",
    );

    const match = schema.match(modelRegex);

    if (!match) {
      throw new Error(
        `Cannot inject into Prisma model "${modelName}" — model not found`,
      );
    }

    const existingBody = match[2];
    const existingFieldNames = getPrismaFieldNames(existingBody);

    // Prevent duplicate injection by Prisma field name, rather than exact
    // whitespace-sensitive text matching.
    const fieldsToInject = injection.fields
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((field) => {
        const fieldName = field.match(/^([A-Za-z_][A-Za-z0-9_]*)\s/)?.[1];
        return fieldName && !existingFieldNames.has(fieldName);
      });

    if (fieldsToInject.length === 0) {
      console.log(
        `All injected fields for "${modelName}" already exist. Skipping.`,
      );
      continue;
    }

    const formattedFields = fieldsToInject
      .map((field) => `  ${field}`)
      .join("\n");

    const replacement =
      `${match[1]}` +
      `${existingBody}\n\n` +
      `${formattedFields}\n` +
      `${match[3]}`;

    schema = schema.replace(modelRegex, replacement);

    console.log(
      `Injected ${fieldsToInject.length} field(s) into Prisma model "${modelName}"`,
    );
  }
  // ---------------------------------------------------------
  // 7. Save schema
  // ---------------------------------------------------------

  fs.writeFileSync(SCHEMA_PATH, schema, "utf-8");

  return {
    alreadyInstalled: false,
    skipped: false,
    injectionTargets: injections.map((injection) => injection.model),
    schemaInjections: injections,
  };
}
// ─── npm / prisma / build steps ─────────────────────────────

export async function installNpmDependencies(deps) {
  await requirePermission("modules_install");

  if (!deps || deps.length === 0) return;
  execSync(`npm install ${deps.join(" ")}`, {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

export async function validateSchema() {
  execSync("npx prisma validate", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

export async function runMigrations() {
  await requirePermission("modules_install");
  execSync("npx prisma migrate deploy", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

export async function syncSchemaToDatabase({ acceptDataLoss = false } = {}) {
  const command = acceptDataLoss
    ? "npx prisma db push --accept-data-loss"
    : "npx prisma db push";

  execSync(command, {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

export async function buildProject() {
  console.log("========== BUILD DEBUG ==========");
  console.log("PROJECT_ROOT:", PROJECT_ROOT);
  console.log("NODE_ENV before:", process.env.NODE_ENV);
  console.log("NODE VERSION:", process.version);
  console.log("=================================");

  execSync("npm run build", {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
}

export async function activateModuleAfterBuild(moduleName) {
  const cfg = readInstalledModules();

  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  const active = new Set(cfg.activeModules || []);
  active.add(moduleName);

  cfg.activeModules = [...active];

  // Ensure builtModules tracking exists
  if (!cfg.builtModules) cfg.builtModules = [];
  if (!cfg.builtModules.includes(moduleName)) {
    cfg.builtModules.push(moduleName);
  }

  writeInstalledModules(cfg);

  return cfg;
}

export async function activateAndBuildModule(moduleName, jobId) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();

  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  const activeModules = cfg.activeModules || [];

  if (activeModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is already active`);
  }

  // Check if module has been built before
  const builtModules = cfg.builtModules || [];
  const alreadyBuilt = builtModules.includes(moduleName);

  await writeJobStatus(jobId, {
    status: "running",
    module: moduleName,
    action: "activate",
    logs: [],
  });

  try {
    if (alreadyBuilt) {
      // Module was built before → just activate
      await appendJobLog(
        jobId,
        `Module "${moduleName}" already built. Activating now (no rebuild needed).`,
      );
    } else {
      // First time activation → need to build
      await appendJobLog(
        jobId,
        `Starting build for ${moduleName}. Module will remain inactive until build succeeds.`,
      );

      await appendJobLog(jobId, "Running npm run build");

      await buildProject();

      await appendJobLog(jobId, "Build completed successfully.");
    }

    // ONLY NOW activate (whether we just built or not)
    await activateModuleAfterBuild(moduleName);

    await appendJobLog(jobId, `Module "${moduleName}" activated successfully.`);

    await appendJobLog(jobId, "Restarting application...");

    await triggerAppRestart();

    await appendJobLog(jobId, "Application restart requested.");

    const finalStatus = await readJobStatus(jobId);

    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "success",
      buildRequired: false,
      active: true,
    });
  } catch (err) {
    await appendJobLog(jobId, `ERROR: ${err.message}`);

    const finalStatus = await readJobStatus(jobId);

    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "failed",
      buildRequired: !alreadyBuilt, // Only needs build if it was never built
      active: false,
      error: err.message,
    });
  }
}

// ─── Finalize / restart ─────────────────────────────────────

export async function markModuleInstalled(moduleName) {
  const cfg = readInstalledModules();

  if (!cfg.installedModules.includes(moduleName)) {
    cfg.installedModules.push(moduleName);
  }

  // Mark as inactive (not built yet)
  const activeModules = cfg.activeModules || [];
  cfg.activeModules = activeModules.filter((name) => name !== moduleName);

  // Ensure builtModules exists (module is not built yet)
  if (!cfg.builtModules) cfg.builtModules = [];
  // Don't add to builtModules — it hasn't been built yet

  writeInstalledModules(cfg);
}

export async function triggerAppRestart() {
  const restartFlagPath = path.join(PROJECT_ROOT, "tmp", "restart.txt");
  fs.mkdirSync(path.dirname(restartFlagPath), { recursive: true });
  fs.writeFileSync(restartFlagPath, new Date().toISOString());
}

// ─── Orchestrator ────────────────────────────────────────────

export async function installModule(moduleName, jobId) {
  await requireAuth();
  await requirePermission("modules_install");

  let backups = null;
  let copiedPaths = [];
  let migrationApplied = false;
  let dbBackupPath = null;
  let extractDir = null;

  await writeJobStatus(jobId, {
    status: "running",
    module: moduleName,
    logs: [],
  });

  try {
    await appendJobLog(jobId, `Downloading ${moduleName} from GitHub`);
    extractDir = path.join(PROJECT_ROOT, "tmp", `extract-${jobId}`);
    const moduleDir = await downloadModuleDirectory(moduleName, extractDir);
    const manifest = await readModuleManifest(moduleDir);

    await checkModuleDependencies(manifest);

    // Some older installations have their schema but were never recorded in
    // cmskit.config.json. Detect that state before copying any files or
    // merging again, then repair the existing registry entry.
    const fragmentPath = path.join(moduleDir, manifest.schemaFragment);
    const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
    const fragment = fs.readFileSync(fragmentPath, "utf-8");
    if (isSchemaFragmentAlreadyPresent(schema, fragment)) {
      const installedPaths = [];
      for (const [src, dest] of Object.entries(manifest.targetPaths || {})) {
        const sourcePath = path.join(moduleDir, src);
        const destinationPath = path.join(PROJECT_ROOT, dest);

        if (!fs.existsSync(destinationPath)) {
          fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
          fs.cpSync(sourcePath, destinationPath, { recursive: true });
          await appendJobLog(jobId, `Restored missing module file: ${dest}`);
        }

        installedPaths.push(destinationPath);
      }

      const message = `Module ${moduleName} was already installed; missing files were restored`;
      await markModuleInstalled(moduleName);
      cacheInstalledModuleManifest(
        moduleName,
        manifest,
        installedPaths,
        getSchemaInjections(fragment).injections,
      );
      fs.rmSync(extractDir, { recursive: true, force: true });
      extractDir = null;
      await appendJobLog(jobId, message);
      const status = await readJobStatus(jobId);
      await writeJobStatus(jobId, {
        ...status,
        status: "success",
        alreadyInstalled: true,
        repaired: true,
        message,
      });
      return { alreadyInstalled: true, repaired: true, message };
    }

    await appendJobLog(jobId, "Backing up schema.prisma and package.json");
    backups = await backupBeforeInstall(jobId);

    dbBackupPath = await backupDatabase(jobId);
    if (dbBackupPath) {
      await appendJobLog(jobId, `Database backed up to ${dbBackupPath}`);
    }

    await appendJobLog(jobId, "Copying module files into project");
    copiedPaths = await copyModuleFiles(moduleDir, manifest.targetPaths);

    await appendJobLog(jobId, "Merging Prisma schema fragment");
    const mergeResult = await mergeSchemaFragment(
      moduleDir,
      manifest.schemaFragment,
      moduleName,
    );

    if (mergeResult?.skipped) {
      await appendJobLog(
        jobId,
        "Schema already exists from previous installation. Skipping merge.",
      );
    } else {
      const injectionTargets = mergeResult?.injectionTargets || [];
      await appendJobLog(
        jobId,
        `Extracted ${injectionTargets.length} INJECT_INTO block(s): ${injectionTargets.join(", ") || "none"}`,
      );
    }

    if ((manifest.npmDependencies || []).length > 0) {
      await appendJobLog(
        jobId,
        `Installing npm packages: ${manifest.npmDependencies.join(", ")}`,
      );
      await installNpmDependencies(manifest.npmDependencies);
    }

    await appendJobLog(jobId, "Validating Prisma schema");
    await validateSchema();

    await appendJobLog(jobId, "Running database migration");
    await runMigrations();
    migrationApplied = true;

    await markModuleInstalled(moduleName);
    cacheInstalledModuleManifest(
      moduleName,
      manifest,
      copiedPaths,
      mergeResult?.schemaInjections || [],
    );
    await clearBackups(backups);

    fs.rmSync(extractDir, { recursive: true, force: true });
    extractDir = null;
    await appendJobLog(
      jobId,
      "Installation complete. Module is installed but inactive.",
    );
    await appendJobLog(
      jobId,
      "Build is required before the module can be activated.",
    );
    const completedStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, {
      ...completedStatus,
      status: "success",
      buildRequired: true,
      activated: false,
    });
  } catch (err) {
    await appendJobLog(jobId, `ERROR: ${err.message}`);
    await appendJobLog(jobId, "Rolling back...");

    if (Array.isArray(err.copiedPaths)) {
      copiedPaths = err.copiedPaths;
    }

    if (extractDir && fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }

    try {
      await removeCopiedFiles(copiedPaths);
      await appendJobLog(jobId, "Removed copied files");

      if (backups) {
        await restoreFromBackup(backups);
        await appendJobLog(jobId, "Restored schema.prisma and package.json");
      }
    } catch (rollbackErr) {
      await appendJobLog(jobId, `ROLLBACK ERROR: ${rollbackErr.message}`);
      await appendJobLog(
        jobId,
        "Manual cleanup may be needed — check schema.prisma and package.json backups in the project root",
      );
    }

    if (migrationApplied) {
      if (dbBackupPath) {
        await appendJobLog(
          jobId,
          `DB migration was applied. Restore manually from: ${dbBackupPath}`,
        );
      } else {
        await appendJobLog(
          jobId,
          "WARNING: DB migration applied with no backup — manual review needed",
        );
      }
    }

    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "failed",
      error: err.message,
    });
  }
}

// ─── Modules index / list ───────────────────────────────────

export async function fetchModulesIndex() {
  return new Promise((resolve, reject) => {
    const configuredRepo = (GITHUB_REPO || "").trim().replace(/\/+$/, "");
    let repoPath = configuredRepo;

    try {
      const parsedRepoUrl = new URL(configuredRepo);
      repoPath = parsedRepoUrl.pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      // CMSKIT_MODULES_REPO may be configured as owner/repo instead of a URL.
    }

    repoPath = repoPath.replace(/\.git$/, "");
    if (!repoPath.includes("/")) {
      repoPath = `${GITHUB_ORG}/${repoPath}`;
    }

    const apiUrl = `https://api.github.com/repos/${repoPath}/contents/modules-index.json`;
    const apiPath = new URL(apiUrl).pathname;

    console.log("========== GITHUB MODULE INDEX DEBUG ==========");
    console.log("GITHUB_REPO:", GITHUB_REPO);
    console.log("githubRepoPath():", repoPath);
    console.log("Final API URL:", apiUrl);
    console.log("===============================================");

    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method: "GET",
        headers: {
          "User-Agent": "cmskit-module-installer",
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("========== GITHUB RESPONSE ==========");
          console.log("Status:", res.statusCode);
          console.log("=====================================");

          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Failed to fetch modules-index.json: ${res.statusCode} - ${data}`,
              ),
            );
            return;
          }

          try {
            const json = JSON.parse(data);

            const content = Buffer.from(json.content, "base64").toString(
              "utf8",
            );

            resolve(JSON.parse(content));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

export async function listModulesWithStatus() {
  const index = await fetchModulesIndex();
  const cfg = readInstalledModules();
  const activeModules = cfg.activeModules || cfg.installedModules;

  return index.modules.map((m) => ({
    ...m,
    installed: cfg.installedModules.includes(m.name),
    active: activeModules.includes(m.name),
    files: Object.values(m.targetPaths || {}),
  }));
}

// ─── Deactivate / reactivate (UI visibility only, no file/data changes) ──

export async function deactivateModule(moduleName) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();
  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  // Only remove from activeModules — keep in builtModules for faster reactivation
  cfg.activeModules = (cfg.activeModules || cfg.installedModules).filter(
    (m) => m !== moduleName,
  );
  writeInstalledModules(cfg);
  return cfg;
}

export async function activateModule(moduleName) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();

  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  // Check if already active
  const activeModules = cfg.activeModules || [];
  if (activeModules.includes(moduleName)) {
    return cfg; // Already active
  }

  // Module is installed but inactive.
  // Use activateAndBuildModule() to build and then activate.
  return {
    ...cfg,
    message: `Module "${moduleName}" is installed but inactive. Use "Activate & Build" to build and activate it.`,
  };
}

export function isModuleActive(moduleName) {
  const cfg = readInstalledModules();
  const active = cfg.activeModules || cfg.installedModules;
  return active.includes(moduleName);
}

// ─── Uninstall ─────────────────────────────────────────────

export async function removeSchemaFragment(moduleName, schemaInjections = []) {
  let schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const escapedName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const modulePattern = new RegExp(
    `\\n?// --- MODULE:${escapedName} START ---[\\s\\S]*?// --- MODULE:${escapedName} END ---\\n?`,
    "m",
  );
  let removedInjectedFields = 0;

  for (const injection of schemaInjections) {
    const fields = String(injection.fields || "")
      .split(/\r?\n/)
      .map((field) => field.trim())
      .filter(Boolean);

    for (const field of fields) {
      const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const fieldPattern = new RegExp(`^\\s*${escapedField}\\s*\\r?\\n?`, "gm");
      const previousSchema = schema;
      schema = schema.replace(fieldPattern, "");
      if (schema !== previousSchema) removedInjectedFields += 1;
    }
  }

  const hasModuleBlock = modulePattern.test(schema);
  if (!hasModuleBlock && removedInjectedFields === 0) {
    throw new Error(
      `Could not find schema block for module "${moduleName}" — remove it manually from schema.prisma`,
    );
  }

  if (hasModuleBlock) {
    schema = schema.replace(modulePattern, "\n");
    console.log(`Removed Prisma schema block for module: ${moduleName}`);
  }

  fs.writeFileSync(SCHEMA_PATH, schema, "utf-8");
  console.log(
    `Removed ${removedInjectedFields} injected Prisma field(s) for module: ${moduleName}`,
  );
}

export async function checkNoDependents(moduleName) {
  const cfg = readInstalledModules();
  const index = await fetchModulesIndex();
  const dependents = index.modules.filter(
    (m) =>
      cfg.installedModules.includes(m.name) &&
      (m.dependencies || []).includes(moduleName),
  );
  if (dependents.length > 0) {
    throw new Error(
      `Cannot uninstall "${moduleName}" — required by: ${dependents.map((d) => d.name).join(", ")}`,
    );
  }
}

export async function uninstallModule(
  moduleName,
  jobId,
  { deleteData = false } = {},
) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();
  const activeModules = cfg.activeModules || cfg.installedModules;
  if (activeModules.includes(moduleName)) {
    throw new Error(`Deactivate "${moduleName}" before uninstalling it`);
  }
  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  await writeJobStatus(jobId, {
    status: "running",
    module: moduleName,
    action: "uninstall",
    logs: [],
  });

  try {
    await appendJobLog(jobId, "Checking no other module depends on this one");
    await checkNoDependents(moduleName);

    const manifestPath = path.join(
      PROJECT_ROOT,
      "modules-cache",
      moduleName,
      "module.json",
    );

    let manifest;

    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } else {
      await appendJobLog(
        jobId,
        "Local module manifest not found. Fetching manifest from GitHub...",
      );

      const extractDir = path.join(PROJECT_ROOT, "tmp", `uninstall-${jobId}`);
      const moduleDir = await downloadModuleDirectory(moduleName, extractDir);

      manifest = await readModuleManifest(moduleDir);

      fs.rmSync(extractDir, {
        recursive: true,
        force: true,
      });

      await appendJobLog(jobId, "Module manifest fetched successfully");
    }

    const installedPaths = Array.isArray(manifest.installedPaths)
      ? manifest.installedPaths
      : Object.values(manifest.targetPaths || {}).map((dest) =>
          path.join(PROJECT_ROOT, dest),
        );

    if (deleteData) {
      await appendJobLog(
        jobId,
        "Removing schema fragment (data will be dropped)",
      );

      await removeSchemaFragment(moduleName, manifest.schemaInjections || []);
      await appendJobLog(
        jobId,
        "Syncing schema — this DROPS this module's tables",
      );

      await syncSchemaToDatabase({
        acceptDataLoss: true,
      });
    }
    await appendJobLog(jobId, "Removing module files");
    for (const installedPath of installedPaths) {
      if (fs.existsSync(installedPath)) {
        fs.rmSync(installedPath, { recursive: true, force: true });
      }
    }

    const updatedCfg = readInstalledModules();
    updatedCfg.installedModules = updatedCfg.installedModules.filter(
      (m) => m !== moduleName,
    );
    updatedCfg.activeModules = (updatedCfg.activeModules || []).filter(
      (m) => m !== moduleName,
    );
    updatedCfg.builtModules = (updatedCfg.builtModules || []).filter(
      (m) => m !== moduleName,
    );
    writeInstalledModules(updatedCfg);

    fs.rmSync(path.join(PROJECT_ROOT, "modules-cache", moduleName), {
      recursive: true,
      force: true,
    });

    await appendJobLog(
      jobId,
      "Uninstall complete. Build is required before the changes become active.",
    );

    // await triggerAppRestart();

    const finalStatus = await readJobStatus(jobId);

    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "success",
      buildRequired: true,
    });
  } catch (err) {
    await appendJobLog(jobId, `ERROR: ${err.message}`);
    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "failed",
      error: err.message,
    });
  }
}
