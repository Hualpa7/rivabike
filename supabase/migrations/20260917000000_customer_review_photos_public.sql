-- ===========================================================
-- customer-review-photos: lectura publica.
-- En la landing solo se muestran reseñas aprobadas (filtro por
-- estado='aprobada' en la app), asi que hacer el bucket publico no
-- expone pendientes/rechazadas. Beneficio: las URLs publicas son
-- estables y el navegador las cachea (las signed URLs se regeneran
-- en cada visita y se re-descargan siempre -> egress repetido).
-- La escritura sigue restringida a las politicas admin existentes.
-- ===========================================================

update storage.buckets
set public = true
where id = 'customer-review-photos';

drop policy if exists "public_read_customer_review_photos" on storage.objects;
create policy "public_read_customer_review_photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'customer-review-photos');
