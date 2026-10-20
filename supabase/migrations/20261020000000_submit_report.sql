-- Anonim bildirimler yalnızca submit_report üzerinden, cihaz başına ve küresel hız sınırıyla
-- client_token: uygulamanın ilk açılışta ürettiği rastgele UUID, kişiyi/cihazı tanımlamaz

alter table issue_reports add column client_token uuid;
create index issue_reports_token_time_idx on issue_reports (client_token, created_at);
create index issue_reports_created_idx on issue_reports (created_at);

drop policy reports_anon_insert on issue_reports;

create function submit_report(
  p_point_id uuid,
  p_reported_status point_status,
  p_description text,
  p_client_token uuid
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_client_token is null then
    raise exception 'missing_token';
  end if;
  if char_length(coalesce(p_description, '')) > 500 then
    raise exception 'description_too_long';
  end if;

  -- aynı token'dan eşzamanlı istekler sayaçları birlikte geçemesin
  perform pg_advisory_xact_lock(hashtext(p_client_token::text));

  -- cihaz başına: 1 saatte 3, 24 saatte 10
  if (select count(*) from issue_reports
      where client_token = p_client_token and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from issue_reports
      where client_token = p_client_token and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'rate_limited';
  end if;

  -- aynı cihazdan aynı noktaya 24 saatte tek bildirim
  if exists (select 1 from issue_reports
      where client_token = p_client_token and point_id = p_point_id
        and created_at > now() - interval '24 hours') then
    raise exception 'duplicate';
  end if;

  -- küresel emniyet sınırı: saatte 100
  if (select count(*) from issue_reports where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'global_limit';
  end if;

  insert into issue_reports (point_id, reported_status, description, client_token)
  values (p_point_id, coalesce(p_reported_status, 'broken'), coalesce(p_description, ''), p_client_token);
end;
$$;

revoke execute on function submit_report(uuid, point_status, text, uuid) from public;
grant execute on function submit_report(uuid, point_status, text, uuid) to anon, authenticated;
