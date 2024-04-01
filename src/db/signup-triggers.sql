
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profile (id, username, email)
  values (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.email);
  return new;
end;
$$;

-- trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();