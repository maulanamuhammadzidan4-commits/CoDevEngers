-- =====================================================
-- CoDevEngers
-- Migration 002: Row Level Security
-- =====================================================

-- 1. HELPER FUNCTIONS
-- Fungsi ini membaca role tanpa menyebabkan RLS recursion.

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.role
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT COALESCE(
        public.current_app_role() = 'admin'::public.app_role,
        FALSE
    );
$$;

CREATE OR REPLACE FUNCTION public.is_walkel()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT COALESCE(
        public.current_app_role() = 'walkel'::public.app_role,
        FALSE
    );
$$;

CREATE OR REPLACE FUNCTION public.current_user_class_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.class_id
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_walkel() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_class_id() TO authenticated;


-- 2. ADMIN POLICIES
-- Admin memiliki akses penuh ke tabel operasional.

CREATE POLICY "Admins manage classes"
ON public.classes
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage profiles"
ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage subjects"
ON public.subjects
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage lesson schedules"
ON public.lesson_schedules
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage duty groups"
ON public.duty_groups
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage duty group members"
ON public.duty_group_members
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage duty schedules"
ON public.duty_schedules
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage assignments"
ON public.assignments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage attendance sessions"
ON public.attendance_sessions
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage attendance records"
ON public.attendance_records
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage change requests"
ON public.change_requests
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3. WALIKEL READ-ONLY POLICIES

CREATE POLICY "WalKel read classes"
ON public.classes
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read profiles"
ON public.profiles
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read subjects"
ON public.subjects
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read lesson schedules"
ON public.lesson_schedules
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read duty groups"
ON public.duty_groups
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read duty group members"
ON public.duty_group_members
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read duty schedules"
ON public.duty_schedules
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read assignments"
ON public.assignments
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read attendance sessions"
ON public.attendance_sessions
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read attendance records"
ON public.attendance_records
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read change requests"
ON public.change_requests
FOR SELECT TO authenticated
USING (public.is_walkel());

CREATE POLICY "WalKel read approvals"
ON public.change_request_approvals
FOR SELECT TO authenticated
USING (public.is_walkel());


-- 4. STUDENT READ POLICIES

CREATE POLICY "Students read own profile"
ON public.profiles
FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Students read own class"
ON public.classes
FOR SELECT TO authenticated
USING (id = public.current_user_class_id());

CREATE POLICY "Students read class subjects"
ON public.subjects
FOR SELECT TO authenticated
USING (class_id = public.current_user_class_id());

CREATE POLICY "Students read class lesson schedules"
ON public.lesson_schedules
FOR SELECT TO authenticated
USING (class_id = public.current_user_class_id());

CREATE POLICY "Students read class duty groups"
ON public.duty_groups
FOR SELECT TO authenticated
USING (class_id = public.current_user_class_id());

CREATE POLICY "Students read class duty group members"
ON public.duty_group_members
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.duty_groups AS dg
        WHERE dg.id = duty_group_id
          AND dg.class_id = public.current_user_class_id()
    )
);

CREATE POLICY "Students read class duty schedules"
ON public.duty_schedules
FOR SELECT TO authenticated
USING (class_id = public.current_user_class_id());

CREATE POLICY "Students read class assignments"
ON public.assignments
FOR SELECT TO authenticated
USING (class_id = public.current_user_class_id());

CREATE POLICY "Students read own attendance sessions"
ON public.attendance_sessions
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.attendance_records AS ar
        WHERE ar.session_id = id
          AND ar.student_id = (SELECT auth.uid())
    )
);

CREATE POLICY "Students read own attendance records"
ON public.attendance_records
FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()));

CREATE POLICY "Students read own change requests"
ON public.change_requests
FOR SELECT TO authenticated
USING (requested_by = (SELECT auth.uid()));


-- 5. CHANGE REQUEST INSERT POLICIES

CREATE POLICY "Students submit change requests"
ON public.change_requests
FOR INSERT TO authenticated
WITH CHECK (
    requested_by = (SELECT auth.uid())
    AND public.current_app_role() = 'student'::public.app_role
    AND required_approvals = 4
    AND status = 'pending'::public.request_status
);

CREATE POLICY "WalKel submit change requests"
ON public.change_requests
FOR INSERT TO authenticated
WITH CHECK (
    requested_by = (SELECT auth.uid())
    AND public.is_walkel()
    AND required_approvals = 1
    AND status = 'pending'::public.request_status
);


-- 6. APPROVAL POLICIES

CREATE POLICY "Admins read all approvals"
ON public.change_request_approvals
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins submit own approval"
ON public.change_request_approvals
FOR INSERT TO authenticated
WITH CHECK (
    public.is_admin()
    AND admin_id = (SELECT auth.uid())
    AND status IN (
        'approved'::public.request_status,
        'rejected'::public.request_status
    )
);


-- 7. APPROVAL COUNT TRIGGER
-- Mengubah status request setelah keputusan admin masuk.
-- Belum mengeksekusi proposed_data ke tabel tujuan.

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
        SET status = 'rejected'::public.request_status,
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
    SET status = 'approved'::public.request_status,
        reviewed_at = now()
    WHERE id = NEW.request_id
      AND status = 'pending'::public.request_status
      AND approved_count >= required_approvals;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_change_request_approval
AFTER INSERT ON public.change_request_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_change_request_status();