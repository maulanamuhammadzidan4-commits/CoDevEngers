# Backend

Backend MVP menggunakan Supabase dan PostgreSQL; tidak ada custom backend server.

- `supabase/migrations/`: perubahan schema dan kebijakan keamanan/RLS dalam migration SQL.
- `supabase/seed/`: data seed untuk kebutuhan pengembangan dan pengujian.
- `supabase/tests/`: pengujian database dan kebijakan akses.
- `api-contract/`: kontrak API dan bentuk data yang digunakan bersama oleh platform.
- `docs/`: dokumentasi backend.

Finalisasi schema, kolom, relasi, dan kebijakan tetap mengikuti keputusan Zidan. Jangan menyimpan kredensial rahasia atau service-role key di repository.
