-- Berikan izin provisioning kepada service_role
GRANT SELECT, INSERT, UPDATE
ON TABLE public.classes
TO service_role;

GRANT SELECT, INSERT, UPDATE
ON TABLE public.profiles
TO service_role;