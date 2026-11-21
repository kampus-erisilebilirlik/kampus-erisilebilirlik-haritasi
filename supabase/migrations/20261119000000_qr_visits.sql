-- QR sayfası ziyaret sayacı (#27): gün ve bina başına yalnızca sayı; IP, cihaz ya da çerez saklanmaz
create table qr_visits (
  day date not null,
  slug text not null,
  count int not null default 0,
  primary key (day, slug)
);
alter table qr_visits enable row level security;
create policy qr_visits_admin_read on qr_visits for select using (is_admin());

-- Bilinmeyen slug sayılmaz; anon tabloya yazamaz, yalnızca bu fonksiyonu çağırır
create function log_qr_visit(p_slug text) returns void
language sql security definer set search_path = public as $$
  insert into qr_visits (day, slug, count)
  select current_date, p_slug, 1 where exists (select 1 from buildings where slug = p_slug)
  on conflict (day, slug) do update set count = qr_visits.count + 1;
$$;
revoke execute on function log_qr_visit(text) from public;
grant execute on function log_qr_visit(text) to anon, authenticated;
