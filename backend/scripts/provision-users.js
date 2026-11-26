require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, INITIAL_PASSWORD } =
  process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !INITIAL_PASSWORD) {
  throw new Error("Konfigurasi .env belum lengkap.");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const roster = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../private/roster.json"), "utf8")
);

async function main() {
  if (roster.length !== 37) {
    throw new Error(`Roster harus berisi 37 akun, ditemukan ${roster.length}.`);
  }

  const usernames = roster.map(user => user.username);

  if (new Set(usernames).size !== 37) {
    throw new Error("Ada username duplikat.");
  }

  // Cari atau buat kelas
  let { data: classData, error } = await supabase
    .from("classes")
    .select("id")
    .eq("name", "CoDevEngers")
    .maybeSingle();

  if (error) throw error;

  if (!classData) {
    const result = await supabase
      .from("classes")
      .insert({ name: "CoDevEngers" })
      .select("id")
      .single();

    if (result.error) throw result.error;
    classData = result.data;
  }

  // Ambil akun Auth yang sudah ada agar skrip dapat dilanjutkan
  const existingUsers = new Map();
  let page = 1;

  while (true) {
    const result = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (result.error) throw result.error;

    for (const user of result.data.users) {
      existingUsers.set(user.email, user);
    }

    if (result.data.users.length < 1000) break;
    page++;
  }

  let created = 0;
  let profilesUpdated = 0;

  for (const person of roster) {
    const email = `${person.username}@login.codevengers.invalid`;
    let authUser = existingUsers.get(email);

    // Buat akun jika belum ada
    if (!authUser) {
      const result = await supabase.auth.admin.createUser({
        email,
        password: INITIAL_PASSWORD,
        email_confirm: true,
        user_metadata: {
          username: person.username,
          full_name: person.name,
          must_change_password: true
        }
      });

      if (result.error) throw result.error;

      authUser = result.data.user;
      existingUsers.set(email, authUser);
      created++;

      console.log(`Auth dibuat: ${person.username}`);
    }

    // Buat atau perbarui profil
    const profile = {
      id: authUser.id,
      class_id: classData.id,
      full_name: person.name,
      username: person.username,
      role: person.role,
      student_number: person.number,
      phone_number: null,
      bio: "Belum diisi",
      must_change_password: true
    };

    const result = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" });

    if (result.error) throw result.error;

    profilesUpdated++;

    console.log(`Profil siap: ${person.username}`);
  }

  console.log("\nProvisioning selesai.");
  console.log(`Akun Auth baru: ${created}`);
  console.log(`Profil diproses: ${profilesUpdated}`);
  console.log(`Total akun dalam roster: ${roster.length}`);
}

main().catch(error => {
  console.error("\nPROVISIONING GAGAL:");
  console.error(error.message);
  process.exit(1);
});
