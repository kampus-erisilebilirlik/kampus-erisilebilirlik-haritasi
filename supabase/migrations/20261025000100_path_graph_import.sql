-- Basamaksız yol ağı (#24): ekran okuyucu notu ve grafın tek seferde yeniden yazılması

alter table path_edges add column note text not null default '';

-- Import script'i (scripts/seed/import-paths.ts) eski grafı silip yenisini yazar.
-- Tek transaction: yarıda kalırsa uygulama boş ya da yarım graf görmez
create function replace_path_graph(p_nodes jsonb, p_edges jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  truncate path_edges, path_nodes;

  insert into path_nodes (id, location, point_id, building_id)
  select (n ->> 'id')::uuid,
         st_setsrid(st_makepoint((n ->> 'lng')::float8, (n ->> 'lat')::float8), 4326)::geography,
         (n ->> 'point_id')::uuid,
         (n ->> 'building_id')::uuid
  from jsonb_array_elements(p_nodes) n;

  insert into path_edges (from_node, to_node, length_m, geometry, note)
  select (e ->> 'from_node')::uuid,
         (e ->> 'to_node')::uuid,
         (e ->> 'length_m')::numeric,
         st_geogfromtext(e ->> 'geometry'),
         coalesce(e ->> 'note', '')
  from jsonb_array_elements(p_edges) e;
end;
$$;

-- Yalnızca service_role (import script'i) çağırabilir
revoke execute on function replace_path_graph(jsonb, jsonb) from public, anon, authenticated;
grant execute on function replace_path_graph(jsonb, jsonb) to service_role;
