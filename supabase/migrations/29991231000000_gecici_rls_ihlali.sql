-- GEÇİCİ: CI'ın RLS ihlalini yakaladığını göstermek için, hemen geri alınacak
create policy points_anon_insert_tmp on points for insert to anon with check (true);
grant insert on points to anon;
