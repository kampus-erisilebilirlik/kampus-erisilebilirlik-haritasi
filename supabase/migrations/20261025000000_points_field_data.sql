-- Saha verisi (#23): nokta kodu ile upsert ve şerit metre ölçümleri
alter table points add column code text unique;               -- <bina-slug>-<tür>-<sıra>, seed script'inin anahtarı
alter table points add column ramp_length_cm smallint check (ramp_length_cm > 0);
alter table points add column ramp_rise_cm smallint check (ramp_rise_cm >= 0);
alter table points add column ramp_handrail_sides smallint check (ramp_handrail_sides between 0 and 2);

comment on column points.code is 'Saha formundaki nokta_kodu, ör. teknoloji-fakultesi-ramp-1';
