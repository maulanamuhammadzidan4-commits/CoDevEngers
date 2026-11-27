
-- =====================================================
-- CoDevEngers
-- Track password changes in Supabase Auth
-- =====================================================

-- Fungsi internal untuk mendeteksi perubahan password.
CREATE OR REPLACE FUNCTION public.handle_auth_password_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.profiles
    SET must_change_password = FALSE
    WHERE id = NEW.id
      AND must_change_password = TRUE;

    RETURN NEW;
END;
$$;

-- Trigger hanya berjalan ketika encrypted_password berubah.
DROP TRIGGER IF EXISTS on_auth_user_password_changed
ON auth.users;

CREATE TRIGGER on_auth_user_password_changed
AFTER UPDATE OF encrypted_password
ON auth.users
FOR EACH ROW
WHEN (
    OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password
)
EXECUTE FUNCTION public.handle_auth_password_change();

-- Fungsi ini hanya digunakan oleh trigger.
REVOKE ALL ON FUNCTION public.handle_auth_password_change()
FROM PUBLIC, anon, authenticated;
