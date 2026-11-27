
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  LOGIN_USERNAME,
  LOGIN_PASSWORD,
  NEW_TEST_PASSWORD,
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !LOGIN_USERNAME ||
  !LOGIN_PASSWORD ||
  !NEW_TEST_PASSWORD
) {
  throw new Error("Konfigurasi pengujian belum lengkap.");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function main() {
  const email =
    `${LOGIN_USERNAME.trim().toLowerCase()}@login.codevengers.invalid`;

  // 1. Login menggunakan password lama.
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password: LOGIN_PASSWORD,
    });

  if (loginError) throw loginError;

  console.log("Login berhasil.");

  // 2. Ganti password akun yang sedang login.
  const { error: updateError } =
    await supabase.auth.updateUser({
      password: NEW_TEST_PASSWORD,
    });

  if (updateError) throw updateError;

  console.log("Password berhasil diubah.");

  // 3. Periksa status profil.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("username, must_change_password")
      .eq("id", loginData.user.id)
      .single();

  if (profileError) throw profileError;

  console.log("Username:", profile.username);
  console.log(
    "Wajib mengganti password:",
    profile.must_change_password ? "Ya" : "Tidak"
  );

  if (profile.must_change_password) {
    throw new Error(
      "Trigger belum berhasil memperbarui status profil."
    );
  }

  console.log("\nPENGUJIAN BERHASIL!");
}

main().catch(error => {
  console.error("Pengujian gagal:", error.message);
  process.exitCode = 1;
});
