BEGIN;

-- Ensure gen_random_uuid available (best-effort)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid') THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END$$;

-- users (profile)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar varchar(512),
  gender varchar(10),
  date_of_birth timestamptz,
  bio varchar(120),
  first_name varchar(50),
  last_name varchar(50),
  phones varchar(20)[],
  addresses varchar(225)[],
  emails varchar(255)[],
  status varchar(20) NOT NULL DEFAULT 'active',
  is_verified boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- users_login (auth)
CREATE TABLE IF NOT EXISTS public.users_login (
  user_id uuid NOT NULL,
  username varchar(50) UNIQUE,
  email varchar(255) UNIQUE,
  phone varchar(20),
  password_hash varchar(255) NOT NULL,
  last_login_at timestamptz,
  last_login_ip varchar(45),
  last_login_user_agent varchar(255),
  last_login_location varchar(255),
  last_login_device varchar(255),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_login_user_id_users_id_fk'
  ) THEN
    ALTER TABLE public.users_login
      ADD CONSTRAINT users_login_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END$$;

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_login_user ON public.users_login(user_id);

COMMIT;


