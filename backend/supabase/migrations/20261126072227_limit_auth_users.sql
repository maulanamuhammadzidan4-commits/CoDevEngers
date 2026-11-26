-- =====================================================
-- CoDevEngers
-- Migration 004: Limit Auth Users to 37
-- =====================================================

CREATE OR REPLACE FUNCTION public.enforce_auth_user_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_count BIGINT;
BEGIN
    -- Mencegah dua proses pembuatan akun melewati batas
    -- secara bersamaan.
    PERFORM pg_catalog.pg_advisory_xact_lock(20261126, 37);

    SELECT COUNT(*)
    INTO current_user_count
    FROM auth.users;

    IF current_user_count >= 37 THEN
        RAISE EXCEPTION
            'CoDevEngers account limit reached: maximum 37 users';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_auth_user_limit_trigger
ON auth.users;

CREATE TRIGGER enforce_auth_user_limit_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_auth_user_limit();

COMMENT ON FUNCTION public.enforce_auth_user_limit()
IS 'Prevents creating more than 37 Supabase Auth users for CoDevEngers';