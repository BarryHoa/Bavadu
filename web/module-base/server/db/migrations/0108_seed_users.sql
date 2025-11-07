BEGIN;

DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.users;
  IF cnt = 0 THEN
    INSERT INTO public.users (id, avatar, gender, date_of_birth, bio, first_name, last_name, phones, addresses, emails, status, is_verified, created_at, updated_at)
    VALUES
      (gen_random_uuid(), NULL, 'male', NULL, 'Bio 1', 'John', 'Doe', ARRAY['+84111111'], ARRAY['Addr 1'], ARRAY['john1@example.com'], 'active', true, now(), now()),
      (gen_random_uuid(), NULL, 'female', NULL, 'Bio 2', 'Jane', 'Doe', ARRAY['+84222222'], ARRAY['Addr 2'], ARRAY['jane2@example.com'], 'active', false, now(), now()),
      (gen_random_uuid(), NULL, 'other', NULL, 'Bio 3', 'Alex', 'Smith', ARRAY['+84333333'], ARRAY['Addr 3'], ARRAY['alex3@example.com'], 'inactive', false, now(), now()),
      (gen_random_uuid(), NULL, 'male', NULL, 'Bio 4', 'Bob', 'Brown', ARRAY['+84444444'], ARRAY['Addr 4'], ARRAY['bob4@example.com'], 'active', true, now(), now()),
      (gen_random_uuid(), NULL, 'female', NULL, 'Bio 5', 'Alice', 'Green', ARRAY['+84555555'], ARRAY['Addr 5'], ARRAY['alice5@example.com'], 'active', true, now(), now());
  END IF;
END$$;

DO $$
DECLARE cnt int;
DECLARE u1 uuid;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.users_login;
  IF cnt = 0 THEN
    SELECT id INTO u1 FROM public.users ORDER BY created_at LIMIT 1;
    INSERT INTO public.users_login (user_id, username, email, phone, password_hash, created_at, updated_at)
    VALUES
      (u1, 'user1', 'user1@example.com', '+84111111', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8JtJQ7s9x0P8bZ8y0rY6G7bOqN2w6W', now(), now()),
      (u1, 'user2', 'user2@example.com', '+84222222', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8JtJQ7s9x0P8bZ8y0rY6G7bOqN2w6W', now(), now()),
      (u1, 'user3', 'user3@example.com', '+84333333', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8JtJQ7s9x0P8bZ8y0rY6G7bOqN2w6W', now(), now()),
      (u1, 'user4', 'user4@example.com', '+84444444', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8JtJQ7s9x0P8bZ8y0rY6G7bOqN2w6W', now(), now()),
      (u1, 'user5', 'user5@example.com', '+84555555', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8JtJQ7s9x0P8bZ8y0rY6G7bOqN2w6W', now(), now());
  END IF;
END$$;

COMMIT;


