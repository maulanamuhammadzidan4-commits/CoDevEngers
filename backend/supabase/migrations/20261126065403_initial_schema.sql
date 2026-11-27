-- =====================================================
-- CoDevEngers
-- Migration 001: Initial Database Schema
-- =====================================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM (
    'admin',
    'student',
    'walkel',
    'guest'
);

CREATE TYPE public.attendance_status AS ENUM (
    'present',
    'late',
    'absent',
    'excused'
);

CREATE TYPE public.request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE public.request_action AS ENUM (
    'create',
    'update',
    'delete'
);


-- 2. CLASSES
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    academic_year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. PROFILES
-- ID profile terhubung langsung dengan akun Supabase Auth.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    full_name TEXT NOT NULL,
    role public.app_role NOT NULL DEFAULT 'student',
    student_number SMALLINT UNIQUE,
    bio TEXT NOT NULL DEFAULT 'Belum diisi',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_student_number
        CHECK (
            student_number IS NULL
            OR student_number BETWEEN 1 AND 36
        ),

    CONSTRAINT valid_profile_role
        CHECK (
            role <> 'guest'
        )
);


-- 4. SUBJECTS
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    name TEXT NOT NULL,
    teacher_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 5. LESSON SCHEDULES
CREATE TABLE public.lesson_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    day_of_week SMALLINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_day_of_week
        CHECK (day_of_week BETWEEN 1 AND 7),

    CONSTRAINT valid_lesson_time
        CHECK (end_time > start_time)
);


-- 6. DUTY GROUPS
CREATE TABLE public.duty_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 7. DUTY GROUP MEMBERS
CREATE TABLE public.duty_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duty_group_id UUID NOT NULL
        REFERENCES public.duty_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL
        REFERENCES public.profiles(id) ON DELETE CASCADE,

    UNIQUE (duty_group_id, student_id)
);


-- 8. DUTY SCHEDULES
CREATE TABLE public.duty_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    duty_group_id UUID NOT NULL
        REFERENCES public.duty_groups(id),
    duty_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 9. ASSIGNMENTS
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    subject_id UUID REFERENCES public.subjects(id),
    title TEXT NOT NULL,
    description TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_at TIMESTAMPTZ,
    attachment_path TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_assignment_deadline
        CHECK (
            due_at IS NULL
            OR due_at >= assigned_at
        )
);


-- 10. ATTENDANCE SESSIONS
CREATE TABLE public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    subject_id UUID REFERENCES public.subjects(id),
    session_date DATE NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 11. ATTENDANCE RECORDS
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL
        REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL
        REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.attendance_status NOT NULL,
    note TEXT,
    marked_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (session_id, student_id)
);


-- 12. CHANGE REQUESTS
CREATE TABLE public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    target_table TEXT NOT NULL,
    target_id UUID,
    action public.request_action NOT NULL,
    proposed_data JSONB NOT NULL,
    reason TEXT,
    status public.request_status NOT NULL DEFAULT 'pending',
    required_approvals SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,

    CONSTRAINT valid_required_approvals
        CHECK (required_approvals IN (1, 4)),

    CONSTRAINT valid_proposed_data
        CHECK (jsonb_typeof(proposed_data) = 'object')
);


-- 13. CHANGE REQUEST APPROVALS
CREATE TABLE public.change_request_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL
        REFERENCES public.change_requests(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    status public.request_status NOT NULL DEFAULT 'pending',
    note TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (request_id, admin_id)
);


-- 14. INDEXES
CREATE INDEX idx_profiles_class
    ON public.profiles(class_id);

CREATE INDEX idx_schedules_class_day
    ON public.lesson_schedules(class_id, day_of_week);

CREATE INDEX idx_duty_schedules_date
    ON public.duty_schedules(duty_date);

CREATE INDEX idx_assignments_class
    ON public.assignments(class_id);

CREATE INDEX idx_assignments_deadline
    ON public.assignments(due_at);

CREATE INDEX idx_attendance_sessions_date
    ON public.attendance_sessions(session_date);

CREATE INDEX idx_attendance_records_student
    ON public.attendance_records(student_id);

CREATE INDEX idx_change_requests_status
    ON public.change_requests(status);

CREATE INDEX idx_change_approvals_request
    ON public.change_request_approvals(request_id);


-- 15. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_request_approvals ENABLE ROW LEVEL SECURITY;