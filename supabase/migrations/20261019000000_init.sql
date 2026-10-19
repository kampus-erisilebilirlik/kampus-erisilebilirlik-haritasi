-- Kampüs Erişilebilirlik Haritası — başlangıç şeması
create extension if not exists postgis;

create type point_type as enum ('ramp', 'elevator', 'toilet', 'parking', 'auto_door');
create type point_status as enum ('working', 'broken', 'unknown');
create type access_score as enum ('green', 'yellow', 'red');
create type report_status as enum ('pending', 'approved', 'rejected');

-- Yönetici hesapları (Engelli Öğrenci Birimi yetkilisi, ekip)
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create table buildings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                     -- QR/deep link: /b/<slug>
  name text not null,
  location geography (point, 4326) not null,
  score access_score not null default 'red',
  summary text not null default '',
  updated_at timestamptz not null default now()
);

create table points (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings (id) on delete set null,
  type point_type not null,
  name text not null,
  location geography (point, 4326) not null,
  floor smallint,
  status point_status not null default 'unknown',
  photo_path text,                               -- Supabase Storage: point-photos/<path>
  verbal_directions text not null default '',
  has_tactile_paving boolean,
  ramp_slope_pct numeric(4, 1),
  ramp_width_cm smallint,
  ramp_has_handrail boolean,
  ts9111_compliant boolean,
  updated_at timestamptz not null default now()
);

create index points_location_idx on points using gist (location);
create index points_type_idx on points (type);

-- Basamaksız yol ağı (ekip tarafından yürünerek kaydedilir)
create table path_nodes (
  id uuid primary key default gen_random_uuid(),
  location geography (point, 4326) not null,
  point_id uuid references points (id) on delete set null,
  building_id uuid references buildings (id) on delete set null
);

create table path_edges (
  id uuid primary key default gen_random_uuid(),
  from_node uuid not null references path_nodes (id) on delete cascade,
  to_node uuid not null references path_nodes (id) on delete cascade,
  length_m numeric(7, 1) not null check (length_m > 0),
  geometry geography (linestring, 4326),
  check (from_node <> to_node)
);

create table issue_reports (
  id uuid primary key default gen_random_uuid(),
  point_id uuid not null references points (id) on delete cascade,
  reported_status point_status not null default 'broken',
  description text not null default '' check (char_length(description) <= 500),
  status report_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Anonim kullanım ölçümü: yalnızca günlük açılış sayısı
create table daily_opens (
  day date primary key,
  count integer not null default 0
);

create function log_app_open() returns void
language sql security definer set search_path = public as $$
  insert into daily_opens (day, count) values (current_date, 1)
  on conflict (day) do update set count = daily_opens.count + 1;
$$;

create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger buildings_touch before update on buildings
  for each row execute function touch_updated_at();
create trigger points_touch before update on points
  for each row execute function touch_updated_at();

-- RLS
alter table admins enable row level security;
alter table buildings enable row level security;
alter table points enable row level security;
alter table path_nodes enable row level security;
alter table path_edges enable row level security;
alter table issue_reports enable row level security;
alter table daily_opens enable row level security;

create policy admins_self_read on admins for select using (user_id = auth.uid());

create policy buildings_read on buildings for select using (true);
create policy buildings_admin_write on buildings for all using (is_admin()) with check (is_admin());

create policy points_read on points for select using (true);
create policy points_admin_write on points for all using (is_admin()) with check (is_admin());

create policy path_nodes_read on path_nodes for select using (true);
create policy path_nodes_admin_write on path_nodes for all using (is_admin()) with check (is_admin());

create policy path_edges_read on path_edges for select using (true);
create policy path_edges_admin_write on path_edges for all using (is_admin()) with check (is_admin());

-- Kullanıcı yalnızca oluşturabilir; okuma/güncelleme yalnızca yönetici
create policy reports_anon_insert on issue_reports for insert
  with check (status = 'pending');
create policy reports_admin_read on issue_reports for select using (is_admin());
create policy reports_admin_update on issue_reports for update using (is_admin()) with check (is_admin());

create policy daily_opens_admin_read on daily_opens for select using (is_admin());

grant execute on function log_app_open() to anon, authenticated;
