/**
 * Optional CLI seeder.
 *
 * The recommended path is the one-click "Load starter content" button in the
 * admin dashboard (super_admin). This script is a convenience for the terminal.
 *
 * Usage:
 *   1. Fill .env.local with your Firebase web config.
 *   2. Add SEED_EMAIL and SEED_PASSWORD for an existing admin/super_admin account
 *      (register the first account through the website, then use it here).
 *   3. npm run seed
 *
 * It only fills empty collections and never overwrites existing content.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

async function main() {
  loadEnv();

  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  if (!email || !password) {
    console.error("✖ Set SEED_EMAIL and SEED_PASSWORD for an existing admin account, then retry.");
    process.exit(1);
  }

  // Imported after env is loaded so the Firebase client initialises correctly.
  const { initializeApp } = await import("firebase/app");
  const { getAuth, signInWithEmailAndPassword, signOut } = await import("firebase/auth");
  const { seedDefaults } = await import("../src/lib/seed-data");

  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  const auth = getAuth(app);
  console.log(`→ Signing in as ${email}…`);
  await signInWithEmailAndPassword(auth, email, password);

  console.log("→ Seeding starter content…");
  const result = await seedDefaults();

  await signOut(auth);
  console.log(
    `✔ Done. Divisions written: ${result.divisions}. Settings written: ${result.settings ? "yes" : "no (already present)"}.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
