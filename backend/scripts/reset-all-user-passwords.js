
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INITIAL_PASSWORD = process.env.INITIAL_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !INITIAL_PASSWORD) {
  throw new Error("Konfigurasi Supabase atau INITIAL_PASSWORD tidak lengkap.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const rosterPath = path.join(__dirname, "../private/roster.json");
const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));

async function main() {
  const targets = roster.map(person => ({
    username: person.username.toLowerCase(),
    email: `${person.username.toLowerCase()}@login.codevengers.invalid`,
  }));

  const uniqueEmails = new Set(targets.map(x => x.email));

  if (uniqueEmails.size !== targets.length) {
    throw new Error("Ada username duplikat dalam roster. Reset dibatalkan.");
  }

  // Ambil seluruh akun Auth dengan pagination.
  let users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    users.push(...data.users);

    if (data.users.length < 1000) break;
    page++;
  }

  const userByEmail = new Map(
    users.map(user => [user.email?.toLowerCase(), user])
  );

  // Pastikan seluruh akun roster ditemukan sebelum mengubah apa pun.
  const missing = targets.filter(x => !userByEmail.has(x.email));

  if (missing.length) {
    console.error("Akun berikut tidak ditemukan:");
    missing.forEach(x => console.error("-", x.username));
    throw new Error("Reset dibatalkan. Tidak ada password yang diubah.");
  }

  const matched = targets.map(target => ({
    ...target,
    user: userByEmail.get(target.email),
  }));

  console.log(`Ditemukan ${matched.length} akun.`);
  console.log("Daftar akun yang akan direset:");

  matched.forEach((item, index) => {
    console.log(`${index + 1}. ${item.username}`);
  });

  if (!process.argv.includes("--apply")) {
    console.log("\nMODE DRY RUN: belum ada password yang diubah.");
    console.log("Jika daftar sudah benar, jalankan dengan --apply.");
    return;
  }

  console.log("\nMemulai reset password...");

  let success = 0;

  for (const item of matched) {
    const { error } = await supabase.auth.admin.updateUserById(
      item.user.id,
      { password: INITIAL_PASSWORD }
    );

    if (error) {
      console.error(`GAGAL: ${item.username} - ${error.message}`);
      continue;
    }

    success++;
    console.log(`BERHASIL: ${item.username}`);
  }

  console.log(`\nSelesai: ${success}/${matched.length} akun berhasil direset.`);

  if (success !== matched.length) {
    console.error("PERHATIAN: Ada akun yang belum berhasil direset.");
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error("Reset dibatalkan:", error.message);
  process.exitCode = 1;
});
