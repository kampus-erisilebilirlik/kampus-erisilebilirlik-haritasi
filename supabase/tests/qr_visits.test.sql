-- log_qr_visit: supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

insert into buildings (slug, name, location)
values ('test-binasi', 'Test Binası', 'SRID=4326;POINT(32.5 37.9)');

set local role anon;
select lives_ok($$ select log_qr_visit('test-binasi') $$, 'anon ziyaret kaydedebilir');
select log_qr_visit('test-binasi');
select log_qr_visit('olmayan-bina');
select is((select count(*) from qr_visits), 0::bigint, 'anon sayaçları okuyamaz');
reset role;

select is((select count from qr_visits where slug = 'test-binasi'), 2, 'aynı gün aynı bina tek satırda artar');
select is((select count(*) from qr_visits where slug = 'olmayan-bina'), 0::bigint, 'bilinmeyen slug sayılmaz');

set local role anon;
select throws_ok(
  $$ insert into qr_visits (day, slug, count) values (current_date, 'test-binasi', 999) $$,
  '42501', null, 'anon tabloya doğrudan yazamaz'
);

select * from finish();
rollback;
