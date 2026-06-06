-- ============================================================================
--  MboaClean — Données de démonstration (à exécuter APRÈS schema.sql)
--  À lancer dans Supabase SQL Editor (rôle service → contourne la RLS).
--  Les profils de démo n'ont pas de user_id (non connectables) : c'est normal,
--  ils servent juste à peupler la carte et les demandes.
-- ============================================================================

-- Profils de démo (UUID fixes pour pouvoir les référencer)
insert into profiles (id, name, role, ville, quartier, phone, operator) values
  ('00000000-0000-0000-0000-000000000001','Cyrille (démo)','citoyen','Yaoundé','Mokolo', null, null),
  ('00000000-0000-0000-0000-000000000002','Joseph (ramasseur démo)','ramasseur','Yaoundé','Mokolo','+237 6 99 88 77 66','MTN MoMo')
on conflict (id) do nothing;

-- Signalements (Yaoundé / Douala / Bafoussam)
insert into reports (reporter_id, reporter_name, ville, quartier, lat, lng, waste_type, volume, zone, status, description) values
  ('00000000-0000-0000-0000-000000000001','Awa N.','Yaoundé','Mokolo',3.8740,11.5070,'menager','enorme','marche','signale','Tas énorme à côté du marché.'),
  ('00000000-0000-0000-0000-000000000001','Brice T.','Yaoundé','Mokolo',3.8745,11.5073,'organique','grand','marche','signale',null),
  ('00000000-0000-0000-0000-000000000001','Junior M.','Yaoundé','Ngoa-Ekellé',3.8590,11.4980,'menager','grand','ecole','signale','Dépôt devant une école.'),
  ('00000000-0000-0000-0000-000000000001','Aïcha B.','Yaoundé','Tongolo',3.8720,11.5210,'plastique','grand','cours_eau','signale','Plastiques dans le cours d''eau.'),
  ('00000000-0000-0000-0000-000000000001','Paul E.','Yaoundé','Mvog-Mbi',3.8480,11.5230,'encombrant','moyen','normale','en_cours',null),
  ('00000000-0000-0000-0000-000000000001','Eric M.','Douala','Akwa',4.0500,9.7000,'menager','grand','marche','signale',null),
  ('00000000-0000-0000-0000-000000000001','Flore T.','Bafoussam','Marché A',5.4780,10.4180,'menager','grand','marche','signale',null);

-- Demandes de ramassage à domicile
insert into pickups (household_id, household_name, ville, quartier, lat, lng, waste_type, note, fee, status, collector_id) values
  ('00000000-0000-0000-0000-000000000001','Cyrille','Yaoundé','Mokolo',3.8742,11.5072,'menager','2 sacs devant le portail',500,'ouverte', null),
  ('00000000-0000-0000-0000-000000000001','Voisin (Briqueterie)','Yaoundé','Briqueterie',3.8790,11.5110,'organique',null,300,'ouverte', null),
  ('00000000-0000-0000-0000-000000000001','Ménage Nlongkak','Yaoundé','Nlongkak',3.8800,11.5160,'menager',null,700,'acceptee','00000000-0000-0000-0000-000000000002');
