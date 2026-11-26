-- Username untuk login
ALTER TABLE public.profiles
ADD COLUMN username TEXT;

-- Username harus unik
CREATE UNIQUE INDEX profiles_username_unique
ON public.profiles (username)
WHERE username IS NOT NULL;

-- Format username: huruf kecil, angka, titik, underscore, dan tanda hubung
ALTER TABLE public.profiles
ADD CONSTRAINT username_format
CHECK (
    username IS NULL
    OR username ~ '^[a-z0-9._-]+$'
);

-- Wajib mengganti password pada login pertama
ALTER TABLE public.profiles
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;