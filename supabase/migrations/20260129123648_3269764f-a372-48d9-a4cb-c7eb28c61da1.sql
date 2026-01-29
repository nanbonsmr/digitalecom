-- Make the first user an admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('810aa2d3-eda8-4d14-985a-cc985d52a445', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;