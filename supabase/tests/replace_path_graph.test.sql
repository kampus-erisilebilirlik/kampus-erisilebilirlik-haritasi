-- replace_path_graph: supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

select replace_path_graph(
  '[{"id": "00000000-0000-0000-0000-0000000000e1", "lat": 37.9, "lng": 32.5},
    {"id": "00000000-0000-0000-0000-0000000000e2", "lat": 37.9001, "lng": 32.5}]'::jsonb,
  '[{"from_node": "00000000-0000-0000-0000-0000000000e1", "to_node": "00000000-0000-0000-0000-0000000000e2",
     "length_m": 11.1, "geometry": "LINESTRING(32.5 37.9, 32.5 37.9001)", "note": "Test yolu"}]'::jsonb
);

select is((select count(*) from path_nodes), 2::bigint, 'düğümler yazılır');
select is((select note from path_edges), 'Test yolu', 'kenar notu yazılır');
select is((select point_id from path_nodes limit 1), null, 'point_id verilmezse null');

-- ikinci çağrı eski grafı tamamen değiştirir
select replace_path_graph(
  '[{"id": "00000000-0000-0000-0000-0000000000e3", "lat": 37.9, "lng": 32.5}]'::jsonb,
  '[]'::jsonb
);
select is((select count(*) from path_nodes), 1::bigint, 'eski düğümler silinir');
select is((select count(*) from path_edges), 0::bigint, 'eski kenarlar silinir');

set local role anon;
select throws_ok(
  $$ select replace_path_graph('[]'::jsonb, '[]'::jsonb) $$,
  '42501', null, 'anon çağıramaz'
);

select * from finish();
rollback;
