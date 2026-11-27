require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

async function main() {
  const username = (process.env.LOGIN_USERNAME || "")
    .trim()
    .toLowerCase();

  const password = process.env.LOGIN_PASSWORD;

  if (!process.env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL belum diatur di .env");
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_ANON_KEY belum diatur di .env");
  }

  if (!username || !password) {
    throw new Error("Username atau password belum diberikan.");
  }

  if (!/^[a-z0-9._-]+$/.test(username)) {
    throw new Error("Format username tidak valid.");
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const email = `${username}@login.codevengers.invalid`;

  const { data: authData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginError) {
    throw new Error(`Login gagal: ${loginError.message}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, must_change_password")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(`Gagal membaca profil: ${profileError.message}`);
  }

  console.log("\nLogin berhasil!");
  console.log("Nama:", profile.full_name);
  console.log("Role:", profile.role);
  console.log(
    "Wajib mengganti password:",
    profile.must_change_password ? "Ya" : "Tidak"
  );

  await supabase.auth.signOut();
}

main().catch((error) => {
  console.error("\n", error.message);
  process.exitCode = 1;
});
