-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 category text not null check (category in ('Web Development','Design','Software')),
 description text default '',
 image_url text not null,
 project_url text,
 sort_order integer not null default 0,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.reviews (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null,
 role text default '',
 review_text text not null,
 rating integer not null default 5 check (rating between 1 and 5),
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 email text not null,
 phone text not null,
 service text not null,
 budget text,
 message text not null,
 created_at timestamptz not null default now()
);

-- Starter portfolio concepts are examples, not commissioned client projects.
-- Stable IDs make this seed safe to rerun without overwriting admin edits.
insert into public.projects (id,title,category,description,image_url,project_url,sort_order,published)
values
 ('00000000-0000-4000-8000-000000000101','Concept: Local Business Website','Web Development','A sample website concept illustrating a clear digital presence for a local business. Not commissioned client work; replace or delete in the admin panel.','https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=75',null,1,true),
 ('00000000-0000-4000-8000-000000000102','Concept: Online Storefront','Web Development','A sample ecommerce concept showing a simple product discovery and shopping flow. Not commissioned client work; replace or delete in the admin panel.','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=75',null,2,true),
 ('00000000-0000-4000-8000-000000000103','Concept: Operations Dashboard','Software','A sample dashboard concept for bringing everyday business metrics into one view. Not commissioned client work; replace or delete in the admin panel.','https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=75',null,3,true)
on conflict (id) do nothing;

-- This review draft is intentionally unpublished; replace it only with approved customer feedback.
insert into public.reviews (id,customer_name,role,review_text,rating,published)
values ('00000000-0000-4000-8000-000000000104','DRAFT - NOT A CUSTOMER','Unpublished draft','Do not publish this note. Replace it with a genuine customer review and approved wording. ',5,false)
on conflict (id) do nothing;

alter table public.projects enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;

-- Public visitors can read only published content.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects for select using (published = true);
drop policy if exists "Public can read published reviews" on public.reviews;
create policy "Public can read published reviews" on public.reviews for select using (published = true);

-- Authenticated admins can manage portfolio and reviews.
drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects" on public.projects for all to authenticated using (true) with check (true);
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews for all to authenticated using (true) with check (true);

-- Anyone can submit a contact enquiry. Only authenticated admins can read/manage it.
drop policy if exists "Anyone can submit enquiries" on public.enquiries;
create policy "Anyone can submit enquiries" on public.enquiries for insert to anon, authenticated with check (
 length(trim(name)) between 1 and 80 and
 length(trim(email)) between 3 and 254 and
 length(trim(phone)) between 5 and 20 and
 length(trim(service)) between 1 and 100 and
 length(trim(message)) between 1 and 1500
);
drop policy if exists "Admins read enquiries" on public.enquiries;
create policy "Admins read enquiries" on public.enquiries for select to authenticated using (true);
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries for update to authenticated using (true) with check (true);
drop policy if exists "Admins delete enquiries" on public.enquiries;
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (true);

-- Storage bucket for project thumbnails. Images are public to display on the site.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-images','portfolio-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public read portfolio images" on storage.objects;
create policy "Public read portfolio images" on storage.objects for select using (bucket_id='portfolio-images');
drop policy if exists "Authenticated upload portfolio images" on storage.objects;
create policy "Authenticated upload portfolio images" on storage.objects for insert to authenticated with check (bucket_id='portfolio-images');
drop policy if exists "Authenticated update portfolio images" on storage.objects;
create policy "Authenticated update portfolio images" on storage.objects for update to authenticated using (bucket_id='portfolio-images') with check (bucket_id='portfolio-images');
drop policy if exists "Authenticated delete portfolio images" on storage.objects;
create policy "Authenticated delete portfolio images" on storage.objects for delete to authenticated using (bucket_id='portfolio-images');

-- IMPORTANT: This starter treats every authenticated Supabase user as an admin.
-- Create only trusted admin users in Authentication > Users. Do not enable public sign-up.
