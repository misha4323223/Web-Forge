import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, access } from "fs/promises";
import { constants } from "fs";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function waitForFilesUnlocked(maxAttempts = 5, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await access("package.json", constants.R_OK);
      return;
    } catch (err) {
      if (i < maxAttempts - 1) {
        console.log(`Waiting for file locks to be released... (attempt ${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
}

async function buildAll() {
  try {
    // Wait for any file locks to be released
    await waitForFilesUnlocked();

    // Remove dist with force and recursive options
    console.log("Cleaning build directory...");
    await rm("dist", { recursive: true, force: true });
    
    // Add a small delay to ensure directory is fully removed
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log("Building client...");
    // Set environment for Vite
    process.env.NODE_ENV = "production";
    // Ensure VITE_API_URL is set for production build
    if (!process.env.VITE_API_URL) {
      process.env.VITE_API_URL = "https://functions.yandexcloud.net/d4ed08qj9rekklj8b100";
    }
    console.log(`Using API URL: ${process.env.VITE_API_URL}`);
    await viteBuild({
      mode: "production",
      configFile: "vite.config.ts"
    });

    console.log("Building server...");
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));
    const allDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
    const externals = allDeps.filter((dep) => !allowlist.includes(dep));

    await esbuild({
      entryPoints: ["server/index.ts"],
      platform: "node",
      bundle: true,
      format: "cjs",
      outfile: "dist/index.cjs",
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      minify: true,
      external: externals,
      logLevel: "info",
    });

    console.log("Build completed successfully!");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}

buildAll();
