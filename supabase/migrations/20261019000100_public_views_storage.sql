-- Uygulama için lat/lng veren view'lar ve fotoğraf deposu

-- security_invoker: view, alttaki tablonun RLS kurallarıyla çalışır
create view v_buildings with (security_invoker = true) as
select id, slug, name, score, summary, updated_at,
       st_y(location::geometry) as lat, st_x(location::geometry) as lng
from buildings;

create view v_points with (security_invoker = true) as
select id, building_id, type, name, floor, status, photo_path, verbal_directions,
       has_tactile_paving, ramp_slope_pct, ramp_width_cm, ramp_has_handrail,
       ts9111_compliant, updated_at,
       st_y(location::geometry) as lat, st_x(location::geometry) as lng
from points;

create view v_path_nodes with (security_invoker = true) as
select id, point_id, building_id,
       st_y(location::geometry) as lat, st_x(location::geometry) as lng
from path_nodes;

grant select on v_buildings, v_points, v_path_nodes to anon, authenticated;

-- Fotoğraflar: <bina-slug>/<nokta-id>.jpg, okuma herkese açık (public bucket)
insert into storage.buckets (id, name, public)
values ('point-photos', 'point-photos', true)
on conflict (id) do nothing;

create policy point_photos_admin_write on storage.objects for all
  to authenticated
  using (bucket_id = 'point-photos' and public.is_admin())
  with check (bucket_id = 'point-photos' and public.is_admin());
