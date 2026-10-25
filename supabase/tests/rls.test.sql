-- RLS senaryoları: supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

-- Test verisi (postgres rolüyle, RLS dışı)
insert into buildings (id, slug, name, location)
values ('00000000-0000-0000-0000-0000000000b1', 'test-bina', 'Test Binası', 'POINT(32.5 37.9)');

insert into points (id, building_id, type, name, location)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1',
        'ramp', 'Test Rampası', 'POINT(32.5001 37.9001)');

insert into issue_reports (id, point_id)
values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1');

insert into auth.users (id, email)
values ('00000000-0000-0000-0000-00000000ad01', 'admin@test.local'),
       ('00000000-0000-0000-0000-00000000aa02', 'user@test.local');
insert into admins (user_id) values ('00000000-0000-0000-0000-00000000ad01');

-- anon
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select isnt_empty('select * from v_points', 'anon: v_points okunur');
select isnt_empty('select * from v_buildings', 'anon: v_buildings okunur');

select results_eq(
  $$select lat::numeric(8, 4), lng::numeric(8, 4) from v_points$$,
  $$values (37.9001::numeric(8, 4), 32.5001::numeric(8, 4))$$,
  'v_points lat/lng doğru eksende'
);

select throws_ok(
  $$insert into points (type, name, location) values ('toilet', 'x', 'POINT(32.5 37.9)')$$,
  '42501', null, 'anon: points insert reddedilir'
);

select lives_ok(
  $$select submit_report('00000000-0000-0000-0000-0000000000a1', 'broken', 'rampa kırık', gen_random_uuid())$$,
  'anon: submit_report ile bildirim başarılı'
);

select throws_ok(
  $$insert into issue_reports (point_id, description) values ('00000000-0000-0000-0000-0000000000a1', 'rampa kırık')$$,
  '42501', null, 'anon: issue_reports doğrudan insert reddedilir'
);

select throws_ok(
  $$insert into issue_reports (point_id, status) values ('00000000-0000-0000-0000-0000000000a1', 'approved')$$,
  '42501', null, 'anon: onaylı durumla bildirim oluşturamaz'
);

select is_empty('select * from issue_reports', 'anon: issue_reports okunamaz');

update issue_reports set status = 'approved';
delete from points;

select lives_ok('select log_app_open()', 'anon: log_app_open çalışır');
select is_empty('select * from daily_opens', 'anon: daily_opens okunamaz');

select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('point-photos', 'test-bina/x.jpg')$$,
  '42501', null, 'anon: fotoğraf yükleyemez'
);

reset role;

select is(
  (select count(*)::int from issue_reports where status = 'pending'),
  2, 'anon update hiçbir bildirimi değiştirmedi'
);
select is((select count(*)::int from points), 1, 'anon delete hiçbir noktayı silmedi');

-- Yönetici olmayan oturum
set local role authenticated;
set local request.jwt.claims = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-00000000aa02"}';

select throws_ok(
  $$insert into points (type, name, location) values ('toilet', 'x', 'POINT(32.5 37.9)')$$,
  '42501', null, 'admin olmayan kullanıcı: points insert reddedilir'
);

-- Yönetici oturumu
set local request.jwt.claims = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-00000000ad01"}';

select lives_ok(
  $$insert into points (type, name, location) values ('elevator', 'Asansör', 'POINT(32.5 37.9)')$$,
  'admin: points insert başarılı'
);

select is((select count(*)::int from issue_reports), 2, 'admin: tüm bildirimleri okur');

select lives_ok(
  $$update issue_reports set status = 'approved' where id = '00000000-0000-0000-0000-0000000000c1'$$,
  'admin: bildirim durumunu günceller'
);

select isnt_empty('select * from daily_opens', 'admin: daily_opens okunur');

select * from finish();
rollback;
