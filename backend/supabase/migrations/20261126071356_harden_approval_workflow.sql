-- =====================================================
-- CoDevEngers
-- Migration 003: Harden Approval Workflow
-- =====================================================


-- 1. ADMIN HANYA BOLEH MEMBACA CHANGE REQUESTS
-- Keputusan harus dicatat melalui change_request_approvals.

DROP POLICY IF EXISTS "Admins manage change requests"
ON public.change_requests;

CREATE POLICY "Admins read all change requests"
ON public.change_requests
FOR SELECT
TO authenticated
USING (public.is_admin());


-- 2. LINDUNGI ROLE DAN IDENTITAS PROFILE
-- Role dan ID akun hanya dapat ditetapkan melalui provisioning,
-- bukan diubah melalui aplikasi.

CREATE OR REPLACE FUNCTION public.protect_profile_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Profile role cannot be changed through the application';
        END IF;

        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Profile identity cannot be changed';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_identity_trigger
ON public.profiles;

CREATE TRIGGER protect_profile_identity_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_identity();


-- 3. VALIDASI SETIAP PERSETUJUAN ADMIN
-- Mengunci request selama proses persetujuan.
-- Memastikan pengusul dan jumlah persetujuan sesuai role.

CREATE OR REPLACE FUNCTION public.validate_change_request_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requester_id UUID;
    requester_role public.app_role;
    expected_approvals SMALLINT;
    current_request_status public.request_status;
BEGIN
    -- Pastikan admin hanya memberikan persetujuan atas namanya sendiri.
    IF auth.uid() IS NOT NULL THEN
        IF NEW.admin_id IS DISTINCT FROM auth.uid() THEN
            RAISE EXCEPTION 'You can only submit your own approval';
        END IF;

        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Only admins can approve requests';
        END IF;
    END IF;

    -- Ambil dan kunci request agar persetujuan diproses berurutan.
    SELECT
        cr.requested_by,
        cr.required_approvals,
        cr.status
    INTO
        requester_id,
        expected_approvals,
        current_request_status
    FROM public.change_requests AS cr
    WHERE cr.id = NEW.request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Change request does not exist';
    END IF;

    IF current_request_status <> 'pending'::public.request_status THEN
        RAISE EXCEPTION 'This request has already been reviewed';
    END IF;

    SELECT p.role
    INTO requester_role
    FROM public.profiles AS p
    WHERE p.id = requester_id;

    IF requester_role = 'student'::public.app_role THEN
        IF expected_approvals <> 4 THEN
            RAISE EXCEPTION 'Student requests require four approvals';
        END IF;
    ELSIF requester_role = 'walkel'::public.app_role THEN
        IF expected_approvals <> 1 THEN
            RAISE EXCEPTION 'WalKel requests require one approval';
        END IF;
    ELSE
        RAISE EXCEPTION 'This account cannot submit change requests';
    END IF;

    IF NEW.status NOT IN (
        'approved'::public.request_status,
        'rejected'::public.request_status
    ) THEN
        RAISE EXCEPTION 'Approval status must be approved or rejected';
    END IF;

    NEW.reviewed_at := now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_change_request_approval_trigger
ON public.change_request_approvals;

CREATE TRIGGER validate_change_request_approval_trigger
BEFORE INSERT ON public.change_request_approvals
FOR EACH ROW
EXECUTE FUNCTION public.validate_change_request_approval();


-- 4. PERBARUI STATUS REQUEST BERDASARKAN HASIL PERSETUJUAN

CREATE OR REPLACE FUNCTION public.update_change_request_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    approved_count INTEGER;
BEGIN
    IF NEW.status = 'rejected'::public.request_status THEN
        UPDATE public.change_requests
        SET
            status = 'rejected'::public.request_status,
            reviewed_at = now()
        WHERE id = NEW.request_id
          AND status = 'pending'::public.request_status;

        RETURN NEW;
    END IF;

    SELECT COUNT(*)
    INTO approved_count
    FROM public.change_request_approvals AS cra
    WHERE cra.request_id = NEW.request_id
      AND cra.status = 'approved'::public.request_status;

    UPDATE public.change_requests
    SET
        status = 'approved'::public.request_status,
        reviewed_at = now()
    WHERE id = NEW.request_id
      AND status = 'pending'::public.request_status
      AND approved_count >= required_approvals;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_change_request_approval
ON public.change_request_approvals;

CREATE TRIGGER on_change_request_approval
AFTER INSERT ON public.change_request_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_change_request_status();