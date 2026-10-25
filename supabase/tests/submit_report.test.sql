-- submit_report hız sınırları: supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(10);

insert into points (id, type, name, location) values
  ('00000000-0000-0000-0000-0000000000a1', 'ramp', 'Rampa 1', 'POINT(32.5 37.9)'),
  ('00000000-0000-0000-0000-0000000000a2', 'ramp', 'Rampa 2', 'POINT(32.5 37.9)'),
  ('00000000-0000-0000-0000-0000000000a3', 'ramp', 'Rampa 3', 'POINT(32.5 37.9)'),
  ('00000000-0000-0000-0000-0000000000a4', 'ramp', 'Rampa 4', 'POINT(32.5 37.9)');

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select lives_ok($$select submit_report('00000000-0000-0000-0000-0000000000a1', 'broken', '', '11111111-1111-1111-1111-111111111111')$$, '1. bildirim');
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a1', 'broken', '', '11111111-1111-1111-1111-111111111111')$$, 'P0001', 'duplicate', 'aynı noktaya 24 saatte ikinci bildirim reddedilir');
select lives_ok($$select submit_report('00000000-0000-0000-0000-0000000000a2', 'broken', '', '11111111-1111-1111-1111-111111111111')$$, '2. bildirim');
select lives_ok($$select submit_report('00000000-0000-0000-0000-0000000000a3', 'broken', '', '11111111-1111-1111-1111-111111111111')$$, '3. bildirim');
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a4', 'broken', '', '11111111-1111-1111-1111-111111111111')$$, 'P0001', 'rate_limited', 'aynı token ile saatte 4. bildirim reddedilir');
select lives_ok($$select submit_report('00000000-0000-0000-0000-0000000000a4', 'broken', '', '22222222-2222-2222-2222-222222222222')$$, 'farklı token ile kabul edilir');
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a1', 'broken', '', null)$$, 'P0001', 'missing_token', 'token olmadan reddedilir');
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a1', 'broken', repeat('x', 501), '33333333-3333-3333-3333-333333333333')$$, 'P0001', 'description_too_long', '500 karakter üstü reddedilir');

reset role;

-- 24 saat sınırı: eski bildirimler 1 saat penceresinin dışında ama 24 saatin içinde
insert into issue_reports (point_id, client_token, created_at)
select '00000000-0000-0000-0000-0000000000a1', '44444444-4444-4444-4444-444444444444', now() - interval '2 hours'
from generate_series(1, 10);

-- küresel sınır: başka token'lardan saatte 100
insert into issue_reports (point_id, client_token)
select '00000000-0000-0000-0000-0000000000a1', gen_random_uuid() from generate_series(1, 96);

set local role anon;
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a2', 'broken', '', '44444444-4444-4444-4444-444444444444')$$, 'P0001', 'rate_limited', 'aynı token ile 24 saatte 11. bildirim reddedilir');
select throws_ok($$select submit_report('00000000-0000-0000-0000-0000000000a2', 'broken', '', '55555555-5555-5555-5555-555555555555')$$, 'P0001', 'global_limit', 'saatte 100 bildirimden sonra herkes reddedilir');

select * from finish();
rollback;
