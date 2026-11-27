-- 1. Tambahkan nomor telepon ke profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 2. Validasi format nomor telepon sederhana
ALTER TABLE public.profiles
ADD CONSTRAINT phone_number_format
CHECK (
    phone_number IS NULL
    OR phone_number ~ '^\+?[0-9]{8,15}$'
);

-- 3. Buat direktori kontak yang aman
CREATE OR REPLACE VIEW public.student_contact_directory
WITH (security_invoker = true)
AS
SELECT
    id,
    full_name,
    student_number,
    phone_number
FROM public.profiles
WHERE role IN ('admin', 'student', 'walkel');

-- 4. Izinkan pengguna yang sudah login melihat direktori
GRANT SELECT ON public.student_contact_directory
TO authenticated;