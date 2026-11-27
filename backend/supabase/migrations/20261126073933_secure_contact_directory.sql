-- Hapus view lama
DROP VIEW IF EXISTS public.student_contact_directory;

-- Buat fungsi direktori kontak yang hanya mengembalikan kolom publik
CREATE OR REPLACE FUNCTION public.get_student_contact_directory()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    student_number INTEGER,
    phone_number TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        p.id,
        p.full_name,
        p.student_number,
        p.phone_number
    FROM public.profiles p
    WHERE
        (SELECT auth.uid()) IS NOT NULL
        AND (SELECT auth.jwt() ->> 'role') = 'authenticated'
        AND p.role IN ('admin', 'student', 'walkel');
$$;

REVOKE ALL ON FUNCTION public.get_student_contact_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_student_contact_directory() TO authenticated;