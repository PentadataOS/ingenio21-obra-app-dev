-- Seed de demo para SOIARQ Obra. Idempotente (no hace nada si ya hay obras).
-- Crea/recupera 5 usuarios con identidad email confirmada, 3 obras y su contenido.
do $$
declare
  u_admin uuid; u_ing21 uuid; u_sandra uuid; u_tec uuid; u_jefe uuid;
  o1 uuid; o2 uuid; o3 uuid; p uuid; i uuid; rec record; v_id uuid;
begin
  if (select count(*) from obra) > 0 then raise notice 'Datos ya presentes; seed omitido'; return; end if;

  for rec in select * from (values
    ('j.campillo.m@gmail.com','José Campillo','admin_pentadata'),
    ('inteligencia@pentadata.es','Ingenio21','admin_ingenio21'),
    ('sandraquilespsicologa@gmail.com','Sandra Quiles','invitado'),
    ('marcos.ruiz@soiarq.test','Marcos Ruiz','invitado'),
    ('lucia.pons@soiarq.test','Lucía Pons','invitado')
  ) as t(email,nombre,rol) loop
    select id into v_id from auth.users where email=rec.email;
    if v_id is null then
      v_id := gen_random_uuid();
      insert into auth.users(instance_id,id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
                             confirmation_token,recovery_token,email_change_token_new,email_change,email_change_token_current,reauthentication_token,phone_change,phone_change_token)
        values('00000000-0000-0000-0000-000000000000',v_id,'authenticated','authenticated',rec.email,now(),
               '{"provider":"email","providers":["email"]}', jsonb_build_object('nombre',rec.nombre), now(), now(),
               '','','','','','','','');
      insert into auth.identities(user_id,provider,provider_id,identity_data,last_sign_in_at,created_at,updated_at)
        values(v_id,'email',v_id::text, jsonb_build_object('sub',v_id::text,'email',rec.email,'email_verified',true), now(),now(),now());
    end if;
    insert into perfil_usuario(id,email,nombre) values(v_id,rec.email,rec.nombre) on conflict (id) do update set nombre=excluded.nombre;
    update perfil_usuario set rol_global=rec.rol::rol_global where id=v_id;
    if rec.email='j.campillo.m@gmail.com' then u_admin:=v_id;
    elsif rec.email='inteligencia@pentadata.es' then u_ing21:=v_id;
    elsif rec.email='sandraquilespsicologa@gmail.com' then u_sandra:=v_id;
    elsif rec.email='marcos.ruiz@soiarq.test' then u_tec:=v_id;
    elsif rec.email='lucia.pons@soiarq.test' then u_jefe:=v_id; end if;
  end loop;

  perform set_config('request.jwt.claims', json_build_object('sub',u_admin,'role','authenticated')::text, true);
  o1 := crear_obra('Reforma Edificio Mirador','C/ Mirador 14, Valencia','Reforma integral de edificio residencial de 6 plantas.');
  perform asignar_participante(o1,u_sandra,'ingeniero_jefe');
  perform asignar_participante(o1,u_jefe,'jefe_obra');
  perform asignar_participante(o1,u_tec,'tecnico');
  perform set_config('request.jwt.claims', json_build_object('sub',u_sandra,'role','authenticated')::text, true);
  p := crear_punto(o1,'Forjado planta 2','Revisión de armado y hormigonado del forjado.'); perform validar_punto(p);
  i := crear_incidencia(p,'Recubrimiento insuficiente en zona norte','Faltan separadores en varias esperas.','alta',null,null);
  perform crear_comentario('incidencia', i, 'Detectado en la visita del martes. Corregir antes de hormigonar.');
  i := crear_incidencia(p,'Falta sellado en junta',null,'media',null,null); perform cerrar_incidencia(i);
  perform crear_comentario('punto', p, 'Punto validado. Seguimiento semanal.');
  insert into archivos_documentales(obra_id,punto_id,nombre,tipo,mime_type,size_bytes,storage_path,upload_status,uploaded_by,ready_at)
  values (o1,p,'forjado_p2_armado.jpg','imagen','image/jpeg',842000,'obras/'||o1||'/seed/forjado_p2_armado.jpg','ready',u_tec,now());
  p := crear_punto(o1,'Instalación eléctrica','Cuadro general y montantes.'); perform validar_punto(p);
  i := crear_incidencia(p,'Sección de cable inferior a proyecto','Montante 3 con 6mm2 frente a 10mm2.','critica',null,null);
  perform revisar_incidencia(i); perform crear_comentario('incidencia', i, 'Traen material correcto el lunes.');
  p := crear_punto(o1,'Fachada ventilada','Anclajes y subestructura.'); perform validar_punto(p); perform cerrar_punto(p);
  perform crear_punto(o1,'Cimentación zona B','Zapatas aisladas eje 4-6.');
  insert into pendiente(obra_id,titulo,prioridad,created_by) values
   (o1,'Pedir certificado de hormigón al laboratorio','alta',u_sandra),
   (o1,'Revisar planos modificados de instalaciones','media',u_jefe);

  perform set_config('request.jwt.claims', json_build_object('sub',u_admin,'role','authenticated')::text, true);
  o2 := crear_obra('Rehabilitación Nave Logística','Pol. Fuente del Jarro, Paterna','Rehabilitación estructural y de cubierta.');
  perform asignar_participante(o2,u_sandra,'ingeniero_jefe'); perform asignar_participante(o2,u_tec,'tecnico');
  perform set_config('request.jwt.claims', json_build_object('sub',u_sandra,'role','authenticated')::text, true);
  p := crear_punto(o2,'Cubierta metálica','Sustitución de panel sándwich.'); perform validar_punto(p);
  perform crear_incidencia(p,'Oxidación en correas','Tramo central con corrosión.','media',null,null);
  perform crear_comentario('punto', p, 'Acordado tratamiento anticorrosión.');
  p := crear_punto(o2,'Solera industrial','Junta de dilatación y acabado.'); perform validar_punto(p);
  insert into pendiente(obra_id,titulo,prioridad,created_by) values (o2,'Coordinar corte de suministro','media',u_sandra);

  perform set_config('request.jwt.claims', json_build_object('sub',u_admin,'role','authenticated')::text, true);
  o3 := crear_obra('Vivienda Unifamiliar Picanya','C/ Sol 8, Picanya','Vivienda entre medianeras, 2 plantas.');
  perform asignar_participante(o3,u_sandra,'ingeniero_jefe');
  perform set_config('request.jwt.claims', json_build_object('sub',u_sandra,'role','authenticated')::text, true);
  p := crear_punto(o3,'Estructura','Muros de carga y forjados.'); perform validar_punto(p); perform cerrar_punto(p);
  p := crear_punto(o3,'Acabados','Solados, alicatados y pintura.'); perform validar_punto(p); perform cerrar_punto(p);
  perform crear_comentario('obra', o3, 'Obra lista para cierre y generación de expediente.');
  raise notice 'Seed completado';
end $$;
