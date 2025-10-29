create sequence "public"."messages_id_seq";

revoke delete on table "public"."exercises" from "anon";

revoke insert on table "public"."exercises" from "anon";

revoke references on table "public"."exercises" from "anon";

revoke select on table "public"."exercises" from "anon";

revoke trigger on table "public"."exercises" from "anon";

revoke truncate on table "public"."exercises" from "anon";

revoke update on table "public"."exercises" from "anon";

revoke delete on table "public"."exercises" from "authenticated";

revoke insert on table "public"."exercises" from "authenticated";

revoke references on table "public"."exercises" from "authenticated";

revoke select on table "public"."exercises" from "authenticated";

revoke trigger on table "public"."exercises" from "authenticated";

revoke truncate on table "public"."exercises" from "authenticated";

revoke update on table "public"."exercises" from "authenticated";

revoke delete on table "public"."exercises" from "service_role";

revoke insert on table "public"."exercises" from "service_role";

revoke references on table "public"."exercises" from "service_role";

revoke select on table "public"."exercises" from "service_role";

revoke trigger on table "public"."exercises" from "service_role";

revoke truncate on table "public"."exercises" from "service_role";

revoke update on table "public"."exercises" from "service_role";

revoke delete on table "public"."workouts" from "anon";

revoke insert on table "public"."workouts" from "anon";

revoke references on table "public"."workouts" from "anon";

revoke select on table "public"."workouts" from "anon";

revoke trigger on table "public"."workouts" from "anon";

revoke truncate on table "public"."workouts" from "anon";

revoke update on table "public"."workouts" from "anon";

revoke delete on table "public"."workouts" from "authenticated";

revoke insert on table "public"."workouts" from "authenticated";

revoke references on table "public"."workouts" from "authenticated";

revoke select on table "public"."workouts" from "authenticated";

revoke trigger on table "public"."workouts" from "authenticated";

revoke truncate on table "public"."workouts" from "authenticated";

revoke update on table "public"."workouts" from "authenticated";

revoke delete on table "public"."workouts" from "service_role";

revoke insert on table "public"."workouts" from "service_role";

revoke references on table "public"."workouts" from "service_role";

revoke select on table "public"."workouts" from "service_role";

revoke trigger on table "public"."workouts" from "service_role";

revoke truncate on table "public"."workouts" from "service_role";

revoke update on table "public"."workouts" from "service_role";

create table "public"."daily_reports" (
    "id" uuid not null default gen_random_uuid(),
    "report_date" date not null,
    "workouts_created" integer not null default 0,
    "exercises_created" integer not null default 0,
    "created_at" timestamp with time zone default now()
);


alter table "public"."daily_reports" enable row level security;

create table "public"."messages" (
    "id" bigint not null default nextval('messages_id_seq'::regclass),
    "user_id" uuid not null,
    "username" text not null,
    "message" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."messages" enable row level security;

alter table "public"."exercises" disable row level security;

alter table "public"."profiles" disable row level security;

alter sequence "public"."messages_id_seq" owned by "public"."messages"."id";

CREATE UNIQUE INDEX daily_reports_pkey ON public.daily_reports USING btree (id);

CREATE UNIQUE INDEX daily_reports_report_date_key ON public.daily_reports USING btree (report_date);

CREATE INDEX messages_created_at_idx ON public.messages USING btree (created_at DESC);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE INDEX messages_user_id_idx ON public.messages USING btree (user_id);

alter table "public"."daily_reports" add constraint "daily_reports_pkey" PRIMARY KEY using index "daily_reports_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."daily_reports" add constraint "daily_reports_report_date_key" UNIQUE using index "daily_reports_report_date_key";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM messages
  WHERE id NOT IN (
    SELECT id FROM messages
    ORDER BY created_at DESC
    LIMIT 1000
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

create policy "Authenticated users can read daily reports"
on "public"."daily_reports"
as permissive
for select
to authenticated
using (true);


create policy "Service role can insert daily reports"
on "public"."daily_reports"
as permissive
for insert
to service_role
with check (true);


create policy "Users can delete exercises from their workouts"
on "public"."exercises"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))));


create policy "Users can insert exercises to their workouts"
on "public"."exercises"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))));


create policy "Users can update exercises in their workouts"
on "public"."exercises"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))));


create policy "Users can view exercises from their workouts"
on "public"."exercises"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM workouts
  WHERE ((workouts.id = exercises.workout_id) AND (workouts.user_id = auth.uid())))));


create policy "Anyone can read messages"
on "public"."messages"
as permissive
for select
to authenticated
using (true);


create policy "Users can delete their own messages"
on "public"."messages"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert their own messages"
on "public"."messages"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can delete their own workouts"
on "public"."workouts"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert their own workouts"
on "public"."workouts"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update their own workouts"
on "public"."workouts"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own workouts"
on "public"."workouts"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));



drop policy "Anyone can upload an avatar." on "storage"."objects";

drop policy "Avatar images are publicly accessible." on "storage"."objects";


  create policy "Allow authenticated users to upload"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = ANY (ARRAY['profiles'::text, 'workouts'::text, 'exercises'::text])));



  create policy "Allow public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = ANY (ARRAY['profiles'::text, 'workouts'::text, 'exercises'::text])));



  create policy "Allow users to delete their own files"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = ANY (ARRAY['profiles'::text, 'workouts'::text, 'exercises'::text])));



  create policy "Allow users to update their own files"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = ANY (ARRAY['profiles'::text, 'workouts'::text, 'exercises'::text])));



  create policy "Users can read their own exports"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'exports'::text));



  create policy "Users can upload their own exports"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'exports'::text));



