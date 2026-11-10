// Talentin (Corporación): asistente del Kit de Bienvenida. Sin IA ni red.
// "Casi un RAG": base de conocimiento con datos reales del kit + recuperación por relevancia
// (raíces de palabra, tolerancia a errores de tipeo, peso por rareza tipo TF-IDF) + respuestas pregrabadas.
(() => {
  // ───────────────────────── Base de conocimiento ─────────────────────────
  // E(id, etiqueta, icono FA, palabras clave, respuesta(s), {modal, acts, f: relacionados, w: peso, plain})
  const KB = [];
  const E = (id, label, icon, kw, a, o = {}) => KB.push({ id, label, icon, kw, a: [].concat(a), w: 1, f: [], acts: [], ...o });

  // ── Hora de Lima (el navegador da la hora; la fijamos a America/Lima donde sea que se abra) ──
  const limaNow = (now = new Date()) => {
    const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(now).forEach(x => p[x.type] = x.value);
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, m: +p.minute, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
  };
  const saludo = (n = limaNow()) => n.h < 12 ? 'Buenos días' : n.h < 19 ? 'Buenas tardes' : 'Buenas noches';

  const ADRYAN = [['Abrir Adryan', 'https://adryancloudusil.sapia.com.pe/', 'fa-arrow-up-right-from-square']];
  const IMG = 'assets/espacios/'; // fotos de espacios: si un archivo no existe, la imagen simplemente no se muestra
  const MAPS = {
    c1: 'https://www.google.com/maps/search/?api=1&query=USIL+Campus+Fernando+Belaunde+Terry+Av.+La+Fontana+550+La+Molina',
    c2: 'https://www.google.com/maps/search/?api=1&query=USIL+Campus+Gran+Almirante+Miguel+Grau+Av.+La+Fontana+750+La+Molina'
  };
  const PARTNERS = [
    ['Lesley Reyes', 'lreyes@usil.edu.pe', ['Dirección General de Sedes Descentralizadas', 'Gerencia de Educación Virtual y Tec. Educativa', 'Facultad de Ciencias Empresariales', 'Facultad de Adm. Hotelera, Turismo y Gastronomía', 'Facultad de Arquitectura, Urbanismo y Territorio', 'Gerencia Senior de Finanzas']],
    ['Fátima Salazar', 'msalazar@usil.edu.pe', ['Gerencia de Administración y Seguridad', 'Gerencia de Modo USIL', 'Facultad de Ciencias de la Salud', 'Facultad de Artes y Humanidades', 'Facultad de Derecho', 'Facultad de Comunicación', 'Facultad de Educación', 'Vicerrectorado de Investigación']],
    ['Melissa Higa', 'mhiga@usil.edu.pe', ['Gerencia de Proyectos', 'Gerencia de Tecnología de Información', 'Presidencia Ejecutiva', 'Vicepresidencia de Asuntos Corporativos', 'Vicepresidencia de Comunicaciones e Innovación Digital', 'Vicepresidencia Senior', 'Facultad de Ingeniería e Inteligencia Artificial']],
    ['Claudia Muñoz', 'cmunozse@usil.edu.pe', ['Escuela de Posgrado', 'Gerencia Comercial', 'Gerencia de Talento y Cultura', 'Gerencia General', 'Gerencia Legal']]
  ];

  // ───────── Emergencias ─────────
  E('sos', 'Emergencia SOS', 'fa-triangle-exclamation', ['emergencia', 'sos', 'urgente', 'accidente', 'socorro', 'auxilio', 'peligro', 'robo', 'me robaron', 'me asaltaron', 'asalto', 'balacera', 'incendio', 'sismo', 'temblor', 'desmayo', 'me desmaye', 'me siento mal', 'ayuda urgente', '911'],
    ['🚨 **Llama ya a SOS: 905 441 001.** Atiende emergencias en campus y sedes. Desde los anexos de oficina también puedes marcar el 911 con asterisco previo (*911).', '🚨 **Emergencia: 905 441 001** (o *911 desde un anexo). Te atienden en campus y sedes.'],
    { w: 1.5, plain: 1, modal: 'sosModal', acts: [['Llamar ahora', 'tel:905441001', 'fa-phone']], f: ['topico', 'campus'] });
  E('topico', 'Tópico de salud', 'fa-stethoscope', ['topico', 'tópicos', 'enfermeria', 'enfermera', 'atencion medica', 'doctor en el campus', 'medico del campus', 'primeros auxilios', 'horario topico', 'me duele', 'dolor de cabeza'],
    '🩺 **Tópicos en La Molina:** lunes a sábado, 7:00 a.m. a 11:00 p.m.\n• **Campus 1:** anexo 3248 · cel. 966 515 049\n• **Campus 2:** anexo 3644 · cel. 966 518 200\n• Pachacámac: lunes a sábado, 8:00 a.m. a 6:00 p.m.\nEl Campus 1 también atiende domingos de 8:00 a.m. a 6:00 p.m. (solo periodo de clases regulares).',
    { modal: 'sosModal', img: [[IMG + 'topico.webp', 'Tópico de salud']], f: ['sos', 'sst', 'lactancia'] });
  E('sst', 'Seguridad y Salud en el Trabajo', 'fa-helmet-safety', ['seguridad y salud', 'salud ocupacional', 'sst', 'iperc', 'mapa de riesgo', 'examen medico', 'examenes medicos', 'emo', 'examen ocupacional', 'riesgos', 'prevencion de accidentes', 'comite de seguridad', 'carlos torres'],
    '⛑️ **Seguridad y Salud en el Trabajo (SST)** protege tu vida, tu salud y tu bienestar: previene accidentes y enfermedades ocupacionales.\n• Jefe de Salud Ocupacional: **Dr. Carlos Torres**\n• Escríbeles: saludyseguridad@usil.edu.pe\nAquí también te informan de tus **exámenes médicos ocupacionales (EMO)**.',
    { modal: 'sosModal', f: ['topico', 'sos'] });

  // ───────── Pagos y haberes ─────────
  E('pago_fecha', 'Mi pago', 'fa-calendar-days', ['cuando pagan', 'cuando me pagan', 'cuando cae', 'cae el pago', 'cuando cobro', 'me depositan', 'ya pagaron', 'pagaron', 'fecha pago', 'proximo pago', 'mi pago', 'cronograma', 'cronograma de pagos', 'sueldo', 'cobro', 'cobrar', 'abono', 'deposito', 'dia de pago', 'pago', 'pagan', 'quincena', 'remuneracion'],
    '💰 El **cronograma de pagos** lo ves en tu inducción de Gestión Humana. Si tu pago no llegó o está incompleto, escribe a **Marisol Simeon**: msimeon@usil.edu.pe (indica tu nombre, DNI y el mes).',
    { modal: 'contactsModal', f: ['boleta', 'remu', 'haberes'] });
  E('boleta', 'Mis boletas', 'fa-file-invoice-dollar', ['boleta', 'boleta de pago', 'descargar boleta', 'bajar boleta', 'ver boleta', 'mi boleta', 'recibo', 'voucher', 'boucher', 'papel de pago'],
    'Tus boletas están en **Adryan** → *Mis Boletas*.\nElige el año y el mes, y descárgala 📄',
    { modal: 'platformsModal', acts: ADRYAN, f: ['clave', 'pago_fecha'] });
  E('remu', 'Consultas de pagos', 'fa-money-check-dollar', ['certificado de pagos', 'certificado 5ta', 'quinta', '5ta', 'renta', 'impuesto', 'remuneraciones', 'consulta de pagos', 'planilla', 'descuento', 'me descontaron', 'me descontaron de mas', 'error en mi pago', 'pago incorrecto', 'certificado de depositos'],
    'Para temas de pagos escribe a **Remuneraciones**:\n• Consultas generales y boletas: Marisol Simeon, msimeon@usil.edu.pe\n• Certificado de 5ta categoría: Santiago Osorio, sosorio@usil.edu.pe\n• Certificados de pagos y depósitos: Frank Candelario, fcandelario@usil.edu.pe',
    { modal: 'contactsModal', f: ['pago_fecha', 'boleta', 'haberes'] });
  E('haberes', 'Cuenta sueldo y CTS', 'fa-building-columns', ['cuenta de haberes', 'haberes', 'cuenta bancaria', 'cuenta sueldo', 'banco', 'cambio de cuenta', 'cuenta cts', 'abrir cuenta', 'bcp', 'bbva', 'scotiabank', 'interbancaria', 'cci'],
    '🏦 Trabajamos con **BBVA, BCP y Scotiabank**. Si usas otro banco, abres tu cuenta tú mismo y el depósito tarda de 24 a 48 horas (transferencia interbancaria).\nPara abrir o cambiar tu cuenta sueldo, envía tu N.º de cuenta y tu CCI a **gestion.humana@usil.edu.pe**.',
    { modal: 'contactsModal', f: ['pago_fecha', 'ley'] });
  E('ley', 'Descuentos y derechos de ley', 'fa-scale-balanced', ['cts', 'gratificacion', 'grati', 'asignacion familiar', 'afp', 'onp', 'descuentos de ley', 'compensacion por tiempo', 'derechos de ley', 'beneficios de ley', 'quinta categoria'],
    '⚖️ Por ley tienes **asignación familiar, vacaciones, CTS, gratificación y EsSalud**.\nTe descuentan **AFP u ONP** y renta de **5ta categoría**.\nDudas de pagos: Remuneraciones (msimeon@usil.edu.pe).',
    { modal: 'contactsModal', f: ['remu', 'haberes', 'vacaciones'] });

  // ───────── Vacaciones, licencias y salud ─────────
  E('vacaciones', 'Vacaciones', 'fa-umbrella-beach', ['vacaciones', 'vacacion', 'tomar vacaciones', 'pedir vacaciones', 'solicitar vacaciones', 'dias de vacaciones', 'descanso vacacional'],
    '🏖️ Pide tus vacaciones en **Adryan**:\n1. Elige fecha de inicio y de fin\n2. Selecciona a tu jefe directo\n3. Acepta los términos de la política de vacaciones\n4. Envía: queda pendiente de aprobación de tu supervisor',
    { modal: 'platformsModal', acts: ADRYAN, f: ['licencias', 'ley'] });
  E('licencias', 'Licencias', 'fa-calendar-check', ['licencia', 'permiso', 'dia libre', 'dias libres', 'ausentarme', 'me ausento', 'faltar', 'falto', 'no puedo ir', 'salir temprano'],
    'Tienes estas licencias:\n• Maternidad: 98 días (parto múltiple: 128)\n• Paternidad: 10 días calendario (prematuro: 20)\n• Fallecimiento de familiar directo: 5 días en Lima, 7 en provincia\n• Familiar en estado grave o enfermedad terminal: 7 días consecutivos (Ley 30012)\nTodas se registran en Adryan → *Mis permisos / Licencias*. ¿Cuál te interesa?',
    { modal: 'contactsModal', f: ['maternidad', 'paternidad', 'duelo', 'descanso'] });
  E('maternidad', 'Maternidad', 'fa-baby', ['maternidad', 'embarazo', 'embarazada', 'gestante', 'estoy esperando', 'pre natal', 'post natal', 'parto', 'dar a luz'],
    '💛 **Maternidad:** 98 días entre pre y post natal (parto múltiple: 128).\nRegístrala en Adryan con tu certificado médico y avisa a Bienestar Social: bienestarsocial@usil.edu.pe',
    { modal: 'contactsModal', f: ['lactancia', 'bienestar', 'licencias'] });
  E('paternidad', 'Paternidad', 'fa-baby-carriage', ['paternidad', 'papa', 'padre', 'voy a ser papa', 'nacio mi hijo', 'nacimiento', 'prematuro'],
    '👶 **Paternidad:** 10 días calendario (bebé prematuro: 20).\nRegístrala en Adryan con tu sustento.',
    { modal: 'contactsModal', f: ['licencias', 'eps'] });
  E('duelo', 'Fallecimiento de familiar', 'fa-dove', ['fallecimiento', 'fallecio', 'duelo', 'murio', 'se murio', 'velorio', 'luto', 'defuncion', 'perdi a mi'],
    'Lo siento mucho 🕊️ Te corresponden **5 días** en Lima o **7 en provincia** (padres, cónyuge, concubino(a) e hijos).\nRegístralo en Adryan con tu sustento.',
    { plain: 1, modal: 'contactsModal', f: ['bienestar', 'licencias'] });
  E('descanso', 'Descanso médico', 'fa-notes-medical', ['descanso medico', 'descanso', 'citt', 'estoy enfermo', 'estoy enferma', 'me enferme', 'estoy mal', 'enfermo', 'enfermedad', 'doctor', 'clinica', 'cita medica', 'reposo', 'gripe', 'resfrio', 'fiebre', 'covid', 'incapacidad'],
    '🩺 Para subir tu descanso médico:\n1. Entra a Adryan\n2. Ve a *Mis permisos / Licencias / Descanso Médico*\n3. Verifica tus datos, las fechas y el diagnóstico\n4. Rellena y envía\n⏱️ Tienes **48 horas** desde que te lo emiten. Dudas: bienestarsocial@usil.edu.pe',
    { modal: 'platformsModal', acts: ADRYAN, f: ['descanso_docs', 'bienestar'] });
  E('descanso_docs', '¿Qué debe tener mi descanso?', 'fa-paperclip', ['que adjunto', 'que documentos descanso', 'documentos descanso', 'sustento descanso', 'que subo en descanso', 'que debe tener mi descanso'],
    '📎 Antes de subirlo, revisa que tu descanso médico tenga: **tus datos correctos, diagnóstico, fecha de inicio y fin, y firma y sello del médico**.',
    { modal: 'platformsModal', f: ['descanso', 'bienestar'] });
  E('seguros', 'Seguros y licencias', 'fa-shield-heart', ['beneficio', 'beneficios', 'seguros', 'seguro'],
    'Estos son tus seguros y apoyos:\n• Seguro Vida Ley (desde el primer día)\n• EPS, seguro oncológico y EsSalud\n• Lactancia y lactario\n• Licencias (maternidad, paternidad, fallecimiento)\n¿Cuál quieres ver?',
    { modal: 'contactsModal', f: ['vida_ley', 'eps', 'lactancia', 'licencias'] });
  E('vida_ley', 'Seguro Vida Ley', 'fa-shield-heart', ['vida ley', 'seguro de vida', 'declaracion jurada', 'beneficiarios', 'legalizar'],
    '🛡️ **Vida Ley** (desde tu primer día de contrato):\n• Muerte natural: 16 remuneraciones\n• Muerte accidental: 32 remuneraciones\n• Invalidez total y permanente: 32 remuneraciones\nOjo: llena la **Declaración Jurada de Beneficiarios** y legalízala ante notario. Consultas: Renzo Vega, rvegaa@usil.edu.pe',
    { modal: 'contactsModal', f: ['contratacion', 'eps'] });
  E('lactancia', 'Lactancia y lactario', 'fa-person-breastfeeding', ['lactancia', 'lactario', 'amamantar', 'dar de lactar', 'leche', 'lactar', 'sala de lactancia', 'donde esta el lactario', 'donde queda el lactario', 'ubicacion del lactario'],
    '🍼 Tienes **1 hora de permiso** para amamantar hasta que tu bebé cumpla 1 año (partos múltiples: 1 hora extra).\nEl **lactario** es para colaboradoras con hijos menores de 2 años:\n• **Campus 1:** al costado del comedor de colaboradores USIL\n• **Campus 2:** al costado de la entrada del Pabellón B',
    { modal: 'campusModal', img: [[IMG + 'lactario.webp', 'Lactario']], f: ['maternidad', 'bienestar'] });
  E('eps', 'EPS, oncológico y EsSalud', 'fa-hospital', ['eps', 'oncologico', 'seguro oncologico', 'essalud', 'afiliar', 'afiliar a mi familia', 'derechohabiente', 'afiliacion', 'seguro medico', 'esposa', 'conviviente'],
    'Para afiliar a tu familia (**EPS, seguro oncológico o EsSalud**) lleva:\n• Formulario de afiliación (EPS u oncológico)\n• Tu DNI y el del derechohabiente\n• Acta de matrimonio o acta notarial de convivencia (si aplica)\n• DNI de hijos menores\nHijos mayores de edad: requieren pago adicional. Dudas: bienestarsocial@usil.edu.pe',
    { modal: 'contactsModal', f: ['bienestar', 'ley'] });
  E('bienestar', 'Bienestar Social', 'fa-heart', ['bienestar', 'asistencia social', 'prestamo', 'prestamos', 'trabajadora social', 'erica', 'cecilia'],
    '💙 **Bienestar Social** te ayuda con EPS, seguro oncológico, licencias médicas, asistencia social y préstamos:\n• Erica Paredes: eparedesv@usil.edu.pe\n• Cecilia Portilla: cportilla@usil.edu.pe\n• bienestarsocial@usil.edu.pe',
    { modal: 'contactsModal', f: ['licencias', 'eps'] });

  // ───────── Plataformas y accesos ─────────
  E('adryan', 'Adryan', 'fa-id-card', ['adryan', 'autogestion', 'mis permisos', 'datos personales', 'marcar asistencia', 'asistencia', 'horarios'],
    '**Adryan** es tu plataforma de autogestión: actualiza tus datos, sube descansos médicos, marca asistencia y pide vacaciones.\nEntra con tu correo @usil.edu.pe o @usil.pe.',
    { modal: 'platformsModal', acts: ADRYAN, f: ['boleta', 'clave', 'vacaciones'] });
  E('clave', 'Olvidé mi clave', 'fa-key', ['clave', 'contrasena', 'olvide', 'se me olvido', 'me olvide', 'no recuerdo', 'no puedo entrar', 'no puedo ingresar', 'no me deja entrar', 'no me deja ingresar', 'no me jala', 'bloqueado', 'bloquearon', 'login', 'restablecer', 'recuperar', 'cambiar clave'],
    '🔑 **Recupera tu clave en 2 minutos:**\n1. Entra a Adryan y pon tu DNI\n2. Te llega una clave provisional al correo\n3. Entra y crea tu clave nueva\n*(6 a 15 caracteres, con 1 mayúscula, 1 número y 1 símbolo)*',
    { modal: 'platformsModal', acts: ADRYAN, f: ['primer_acceso', 'gh', 'ti'] });
  E('primer_acceso', 'Mi primer ingreso', 'fa-door-open', ['primer acceso', 'primer ingreso', 'primera vez', 'usuario', 'usuario asignado', 'clave provisional', 'no me llega mi usuario'],
    '👋 En tu primer ingreso te llega un correo con tu **usuario y clave provisional** (a tu correo personal y al institucional).\nEntra a Adryan, crea tu clave nueva y vuelve a ingresar.',
    { modal: 'platformsModal', acts: ADRYAN, f: ['clave', 'gh'] });
  E('plataformas', 'Plataformas', 'fa-laptop', ['plataforma', 'sistemas', 'aplicaciones', 'que plataformas'],
    'Usarás 3 plataformas:\n• **Adryan:** autogestión, descansos, vacaciones\n• **Viva Engage:** noticias, eventos y cultura USIL\n• **Academia USIL:** tu inducción y cursos',
    { modal: 'platformsModal', f: ['adryan', 'engage', 'academia'] });
  E('academia', 'Academia e inducción', 'fa-graduation-cap', ['academia', 'induccion', 'capacitacion', 'curso', 'cursos', 'cursos normativos', 'jose porta', 'aprendizaje', 'certificado de curso', 'nota minima'],
    '🎓 En **Academia USIL** haces tus cursos normativos (Código de conducta y ética, Hostigamiento sexual e Inducción en SST). Tu usuario y clave son tu **DNI** la primera vez.\n• Nota mínima: **12**, con 2 oportunidades\n• ⏳ Plazo: **10 días** desde tu ingreso\nDudas: José Porta, jporta@usil.edu.pe',
    { modal: 'platformsModal', f: ['plataformas', 'conducta'] });
  E('engage', 'Viva Engage', 'fa-comments', ['viva engage', 'engage', 'comunicados', 'eventos', 'noticias', 'red social', 'cultura usil', 'cumpleanos'],
    '**Viva Engage** es nuestra red interna: ahí ves comunicados, eventos, cumpleaños y la cultura USIL.\nSe accede con tu correo y contraseña corporativos.',
    { modal: 'platformsModal', f: ['plataformas', 'academia'] });
  E('ti', 'Soporte TI', 'fa-headset', ['soporte ti', 'soporte', 'tecnico', 'informatica', 'correo institucional', 'mi correo', 'outlook', 'no funciona', 'no jala', 'se colgo', 'se cayo', 'no carga', 'no abre', 'esta lento', 'problema tecnico', 'computadora', 'equipo'],
    '💻 ¿Problemas con tu correo, accesos o equipo? Entra al portal de **Soporte TI** con tu usuario de correo USIL.',
    { acts: [['Abrir Soporte TI', 'https://grupousil.atlassian.net/servicedesk/customer/user/login?destination=portals', 'fa-up-right-from-square']], f: ['clave', 'contactos'] });
  E('gh', 'Sigo sin acceso', 'fa-envelope-open-text', ['gestion humana', 'sigo sin acceso', 'sigo sin entrar', 'no me llega el correo', 'no llega clave', 'dudas de acceso'],
    'Si sigues sin poder entrar, escribe a **gestion.humana@usil.edu.pe** o a Renzo Vega: rvegaa@usil.edu.pe',
    { modal: 'platformsModal', f: ['clave', 'ti'] });

  // ───────── Campus y espacios ─────────
  E('campus', 'Cómo llegar a los campus', 'fa-location-dot', ['como llegar', 'como llego', 'como me ubico', 'me ubicas', 'direccion', 'ubicacion', 'donde queda', 'donde esta', 'donde es', 'campus', 'sede', 'mapa', 'llegar', 'la molina', 'waze', 'paradero', 'movilidad'],
    '📍 Tenemos dos campus en La Molina:\n• **Campus 1** · Fernando Belaunde Terry: Av. La Fontana 550\n• **Campus 2** · Gran Almirante Miguel Grau: Av. La Fontana 750\n¿Cuál te interesa?',
    { modal: 'campusModal', f: ['campus1', 'campus2', 'talento_piso', 'espacios'] });
  E('campus1', 'Campus 1 · La Fontana', 'fa-building', ['campus 1', 'campus i', 'campus uno', 'donde queda el campus 1', 'donde esta el campus 1', 'como llego al campus 1', 'la fontana', 'fernando belaunde', 'belaunde terry', 'fontana 550', 'comedor de colaboradores'],
    '🏛️ **Campus 1 · Fernando Belaunde Terry**\nAv. La Fontana 550, La Molina.\n• Lactario: al costado del comedor de colaboradores\n• Tópico: anexo 3248\n• Estacionamiento: Seguridad (seguridadjgrupoc1@usil.edu.pe)',
    { modal: 'campusModal', tab: 1, acts: [['Cómo llegar', MAPS.c1, 'fa-route']], img: [[IMG + 'campus1.webp', 'Campus 1']], f: ['campus2', 'topico', 'estacionamiento'] });
  E('campus2', 'Campus 2 · Grau', 'fa-building-columns', ['campus 2', 'campus ii', 'campus dos', 'donde queda el campus 2', 'donde esta el campus 2', 'como llego al campus 2', 'grau', 'miguel grau', 'grau seminario', 'pabellon', 'pabellon b', 'pabellon f'],
    '🏛️ **Campus 2 · Gran Almirante Miguel Grau**\nAv. La Fontana 750, La Molina.\n• Lactario: al costado de la entrada del Pabellón B\n• Tópico: anexo 3644\n• Seguridad Central: Pabellón F, mezzanine piso 1\n• **Talento y Cultura: 3.er piso**',
    { modal: 'campusModal', tab: 2, acts: [['Cómo llegar', MAPS.c2, 'fa-route']], img: [[IMG + 'campus2.webp', 'Campus 2']], f: ['talento_piso', 'campus1', 'topico'] });
  E('talento_piso', 'Dónde está Talento y Cultura', 'fa-map-pin', ['donde esta talento', 'donde queda talento', 'talento y cultura', 'oficina de talento', 'piso de talento', 'tercer piso', '3er piso', 'recursos humanos', 'rrhh', 'gestion humana', 'oficina de gestion humana', 'donde queda gestion humana', 'remuneraciones oficina', 'ubicacion de talento'],
    '📍 **Talento y Cultura** está en el **3.er piso del Campus 2** (Gran Almirante Miguel Grau, Av. La Fontana 750, La Molina).\nAhí encuentras a tu Socio de Negocio, Remuneraciones y Administración de Personal.',
    { modal: 'campusModal', tab: 2, acts: [['Cómo llegar', MAPS.c2, 'fa-route']], img: [[IMG + 'talento.webp', 'Talento y Cultura · Campus 2, 3.er piso']], f: ['partner', 'campus2', 'contactos'] });
  E('espacios', 'Espacios USIL', 'fa-images', ['espacios', 'fotos', 'imagenes', 'instalaciones', 'recorrido', 'conocer el campus', 'como es el campus', 'comedor', 'biblioteca', 'aulas', 'polideportivo', 'foto del campus'],
    'Te muestro algunos de nuestros espacios 📸',
    { modal: 'campusModal', img: [[IMG + 'campus1.webp', 'Campus 1 · La Fontana'], [IMG + 'campus2.webp', 'Campus 2 · Grau'], [IMG + 'talento.webp', 'Talento y Cultura · Campus 2, 3.er piso']], f: ['campus1', 'campus2', 'talento_piso'] });
  E('estacionamiento', 'Estacionamiento', 'fa-square-parking', ['estacionamiento', 'parking', 'cochera', 'carro', 'auto', 'moto', 'vehiculo', 'placa', 'soat', 'brevete', 'inscripcion vehicular', 'tarjeta de propiedad'],
    '🚗 Para el estacionamiento envía por correo (en **PDF**): formato de inscripción vehicular, brevete, SOAT vigente y tarjeta de propiedad (ambas caras; revisión técnica si aplica).\n**Asunto:** Estacionamiento - Nuevo Colaborador USIL\n**Con copia a:** helpsecurity@usil.edu.pe y ssedes@usil.edu.pe, más Seguridad de tu campus.\nTambién puedes entregarlo en Seguridad Central (Campus 2, Pabellón F, mezzanine piso 1).',
    { modal: 'parkingModal', img: [[IMG + 'estacionamiento.webp', 'Estacionamiento']], f: ['campus1', 'campus2'] });
  E('fotocheck', 'Fotocheck', 'fa-id-badge', ['fotocheck', 'carne', 'credencial', 'perdi mi', 'acceso al campus', 'entrar al campus', 'tarjeta de acceso'],
    '🪪 Tu **fotocheck es tu acceso**: llévalo siempre contigo. Si lo pierdes o necesitas imprimirlo, escribe a **Renzo Vega**: rvegaa@usil.edu.pe',
    { modal: 'contactsModal', f: ['contactos', 'constancia'] });

  // ───────── Talento y Cultura, contactos ─────────
  E('partner', 'Tu Socio de Negocio', 'fa-handshake', ['socia de negocio', 'socio de negocio', 'partner', 'mi jefa', 'a quien le pregunto', 'a quien acudo', 'quien me ayuda', 'no se a quien escribir', 'ingreso', 'tramite', 'quien es mi socio'],
    '🤝 Tu Socio de Negocio te asesora según tu área:\n• **Lesley Reyes:** lreyes@usil.edu.pe\n• **Fátima Salazar:** msalazar@usil.edu.pe\n• **Melissa Higa:** mhiga@usil.edu.pe\n• **Claudia Muñoz:** cmunozse@usil.edu.pe\nDime tu área o facultad y te digo quién es el tuyo.',
    { modal: 'partnerModal', f: ['talento_piso', 'contactos'] });
  PARTNERS.forEach(([n, m, areas]) => E('p_' + n.split(' ')[1].toLowerCase(), n + ' · Socio de Negocio', 'fa-user-tie', [n, n.split(' ')[0], ...areas.filter(a => a !== 'Rectorado')],
    `🤝 **${n}** es tu Socio de Negocio si estás en:\n${areas.map(a => '• ' + a).join('\n')}\n${m}`,
    { w: .9, modal: 'partnerModal', acts: [['Escribirle', 'mailto:' + m, 'fa-envelope']], f: ['partner', 'talento_piso'] }));
  E('cesar', 'Subgerente de Talento y Cultura', 'fa-user-shield', ['cesar reyes', 'subgerente', 'subgerencia', 'jefe de talento', 'quien dirige talento'],
    '👤 **César Reyes** es el Subgerente de Talento y Cultura: creyess@usil.edu.pe',
    { acts: [['Escribirle', 'mailto:creyess@usil.edu.pe', 'fa-envelope']], f: ['partner', 'hostigamiento'] });
  E('hostigamiento', 'Hostigamiento sexual', 'fa-ban', ['hostigamiento', 'acoso', 'acoso sexual', 'hostigamiento sexual', 'denuncia', 'denunciar', 'me acosan', 'discriminacion', 'queja'],
    'En USIL promovemos un clima laboral respetuoso. Si vives o presencias hostigamiento sexual, puedes escribir a **César Reyes** (Subgerente de Talento y Cultura): creyess@usil.edu.pe.\nHay atención médica y psicológica, medidas de protección temporal y un Comité de Intervención.',
    { plain: 1, modal: 'partnerModal', acts: [['Escribir', 'mailto:creyess@usil.edu.pe', 'fa-envelope']], f: ['conducta', 'bienestar'] });
  E('conducta', 'Código de conducta y ética', 'fa-scale-unbalanced', ['codigo de conducta', 'etica', 'cumplimiento', 'anticorrupcion', 'corrupcion', 'fraude', 'lavado de activos', 'proveedores', 'politicas', 'datos personales', 'arco', 'proteccion de datos'],
    '📘 Nuestro **Programa de Cumplimiento Normativo** busca un ambiente de trabajo seguro, ético y transparente: Código de Conducta y Ética, Código de Proveedores, Política Anticorrupción, prevención de fraude y de lavado de activos.\nTambién respetamos tus **derechos ARCO** sobre tus datos personales. Los cursos los llevas en Academia USIL.',
    { modal: 'platformsModal', f: ['academia', 'hostigamiento'] });
  E('valores', 'Valores y propósito', 'fa-star', ['valores', 'proposito', 'mision', 'vision', 'adn', 'cultura', 'pilares', 'competencias', 'quienes somos', 'historia'],
    '✨ **Nuestro propósito:** formar personas con valores para que dejen su huella en el mundo.\n**Valores (nuestro ADN):** Eficiencia, Pasión, Respeto, Lealtad, Servicio y Compromiso.\n**Pilares:** Emprendimiento, Investigación y Desarrollo, Sostenibilidad y Globalización.',
    { plain: 1, f: ['lideres', 'linkedin'] });
  E('lideres', 'Líderes de la Corporación', 'fa-people-roof', ['lideres', 'autoridades', 'rector', 'presidenta', 'ceo', 'gerente general', 'decano', 'decanos', 'quien dirige usil', 'jorge talavera', 'luciana de la fuente', 'cesar diaz'],
    '🏛️ **Algunos líderes:**\n• Luciana de la Fuente: Presidenta Ejecutiva\n• César Díaz: CEO de la Corporación Educativa y Gerente General\n• Jorge Talavera: Rector\n• Karla Sarmiento: Gerente de Talento y Cultura',
    { plain: 1, f: ['valores', 'partner'] });
  E('linkedin', 'Reto LinkedIn', 'fa-linkedin-in', ['linkedin', 'hashtag', 'reto', 'deja tu huella', 'primer dia', 'publicar', 'redes sociales', 'siguenos'],
    '💼 **Reto «Deja tu huella»:** en LinkedIn agrega tu cargo actual en *Experiencia*, comparte que inicias esta nueva etapa y etiqueta a la corporación con una foto de tu primer día.\nHashtags: #CorporaciónUSIL #SomosUSIL #PrimerDía #NuevaEtapa #DejaTuHuella',
    { plain: 1, acts: [['Síguenos en LinkedIn', 'https://www.linkedin.com/company/corporaci%C3%B3n-educativa-usil/posts/?feedView=all', 'fa-arrow-up-right-from-square']], f: ['engage', 'valores'] });
  E('contactos', 'Contactos', 'fa-address-book', ['contacto', 'contactos', 'correo', 'escribir', 'directorio', 'con quien hablo', 'con quien converso', 'a quien escribo', 'a quien le escribo'],
    '¿Con quién necesitas hablar? Elige el área 👇',
    { modal: 'contactsModal', f: ['remu', 'bienestar', 'ti', 'partner', 'constancia', 'haberes'] });
  E('llamar', 'Teléfonos útiles', 'fa-phone', ['llamar', 'telefono', 'central', 'numero de usil', 'numero', 'anexo', 'una llamada', 'hablar por telefono', 'hablar con alguien'],
    '📞 Estos son los teléfonos que tengo:\n• **Emergencias SOS:** 905 441 001\n• **Tópico Campus 1:** anexo 3248 · 966 515 049\n• **Tópico Campus 2:** anexo 3644 · 966 518 200\nPara otras áreas, te recomiendo escribirles por correo. ¿Con quién quieres hablar?',
    { plain: 1, modal: 'contactsModal', acts: [['Llamar a SOS', 'tel:905441001', 'fa-phone']], f: ['contactos', 'partner', 'bienestar'] });
  E('constancia', 'Constancia de trabajo', 'fa-file-signature', ['constancia', 'constancia de trabajo', 'certificado de trabajo', 'renzo', 'vega', 'administracion de personal'],
    '📄 Constancias de trabajo, fotocheck, Seguro Vida Ley y acceso a Adryan: **Renzo Vega**, rvegaa@usil.edu.pe',
    { modal: 'contactsModal', f: ['fotocheck', 'clave', 'contactos'] });
  E('contratacion', 'Trámites de contratación', 'fa-file-contract', ['contratacion', 'documentos de contratacion', 'lidia', 'gonzales', 'firmar contrato', 'firma de contrato', 'mi contrato', 'documentos de ingreso', 'papeleo'],
    '📝 Trámites documentarios de contratación y firma de contrato: **Lidia Gonzales**, lgonzalesar@usil.edu.pe',
    { modal: 'contactsModal', f: ['vida_ley', 'partner'] });
  E('datos', 'Actualizar mis datos', 'fa-user-pen', ['actualizar datos', 'cambiar datos', 'cambiar telefono', 'cambiar correo personal', 'domicilio', 'cambie de casa', 'me mude', 'estado civil', 'cambiar nombre', 'familiares', 'hijos', 'diploma', 'estudios', 'experiencia'],
    '✏️ En Adryan → **Actualiza tus datos**:\n• Teléfono y correo personal: cámbialos cuando quieras\n• DNI, nombres o estado civil: adjunta el documento (PDF)\n• Domicilio: pestaña *Domicilio* y guardar\nSin sustento, se rechaza. Talento y Cultura lo aprueba.',
    { modal: 'platformsModal', acts: ADRYAN, f: ['contacto_emerg', 'clave'] });
  E('contacto_emerg', 'Contacto de emergencia', 'fa-phone-volume', ['contacto de emergencia', 'familiar trabaja', 'familiar en la corporacion', 'pariente', 'registrar emergencia'],
    'Es **obligatorio** registrar tu contacto de emergencia en Adryan (*Actualiza tus datos*) y decir si tienes un familiar que trabaje en la Corporación.',
    { modal: 'platformsModal', acts: ADRYAN, f: ['datos', 'sos'] });
  E('compartir', 'Compartir el kit', 'fa-share-nodes', ['compartir', 'enlace', 'link', 'qr', 'pasar al celular', 'mandar', 'whatsapp', 'copiar enlace', 'recomendar'],
    'Puedes compartir el kit por **WhatsApp, correo, LinkedIn, X o Facebook**, o copiar el enlace 📲',
    { modal: 'shareModal', f: ['ayuda'] });

  // Conversación (peso bajo para que el contenido real gane)
  E('hola', 'Saludar', 'fa-hand', ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen dia', 'hey', 'holi', 'saludos', 'que tal'],
    [() => pick([`¡${saludo()}! 👋 ¿En qué te ayudo?`, `¡${saludo()}! 😄 Cuéntame, ¿qué necesitas?`, `¡${saludo()}, bienvenido(a) a USIL! 🙌 ¿En qué te ayudo?`])], { w: .5, plain: 1, menu: 1 });
  E('gracias', 'Agradecer', 'fa-face-smile', ['gracias', 'muchas gracias', 'mil gracias', 'genial', 'perfecto', 'excelente', 'listo', 'ok', 'okey', 'vale', 'de nada'],
    ['¡De nada! 😊 Aquí estoy si necesitas algo más.', '¡Un gusto ayudarte! 🎉', '¡Para eso estoy! 💙'], { w: .5, plain: 1 });
  E('chau', 'Despedirse', 'fa-hand', ['chau', 'adios', 'hasta luego', 'nos vemos', 'bye', 'hasta manana', 'me voy'],
    ['¡Hasta pronto! 👋 Éxitos en tus primeras semanas.', '¡Chau! Cuando quieras, aquí estoy 😊'], { w: .8, plain: 1 });
  E('quien', 'Quién es Talentin', 'fa-robot', ['quien eres', 'como te llamas', 'tu nombre', 'eres un robot', 'eres humano', 'eres ia', 'talentin'],
    'Soy **Talentin** 🤖, el asistente del Kit. Respondo con la información oficial del kit, por eso soy rápido. Si no sé algo, te digo a quién escribir.',
    { plain: 1, menu: 1 });
  E('estado', '¿Cómo estás?', 'fa-face-smile-beam', ['como estas', 'como te va', 'todo bien', 'que tal estas'],
    ['¡Muy bien, gracias! 😄 ¿Y tú? ¿En qué te ayudo?', 'Con toda la energía 🔋 ¿Qué necesitas?'], { plain: 1, menu: 1 });
  E('ayuda', 'Qué puedo preguntarte', 'fa-circle-question', ['ayuda', 'que puedes hacer', 'que sabes', 'menu', 'temas', 'opciones', 'para que sirves', 'que haces'],
    'Pregúntame sobre **Adryan, licencias, campus y espacios, estacionamiento, seguros o contactos**. Escríbelo normal, como te salga 😉 O elige un tema:',
    { plain: 1, menu: 1, w: .8 });
  E('chiste', 'Cuéntame un chiste', 'fa-face-laugh-beam', ['chiste', 'gracioso', 'hazme reir', 'broma'],
    ['¿Por qué el bot llegó temprano al campus? Porque no se pierde en ningún pabellón 😄', 'Mi chamba es simple: tú preguntas, yo respondo. Y sin tomar cafecito ☕', '¿Qué le dijo un bot a otro? "Tú responde, que yo me sé el Pabellón B." 🏛️'],
    { plain: 1 });

  const MENU = ['adryan', 'licencias', 'seguros', 'campus', 'talento_piso', 'estacionamiento', 'partner', 'contactos', 'sos'];
  const LEAD = ['', '', '', '¡Claro! ', 'Con gusto 😊\n', 'Mira 👇\n', '¡Buena pregunta! '];
  const NO_SE = ['Mmm, no logré entenderte del todo 🤔 ¿Es sobre alguno de estos temas?', 'Esa se me escapó 😅 Prueba con una o dos palabras clave, o elige un tema:', 'No estoy seguro de haber entendido. Toca un tema o dilo de otra forma:'];
  const ESCALA = 'Parece que no tengo esa información 😔 Tu **Socio de Negocio** de Talento y Cultura puede orientarte (3.er piso, Campus 2). Dime tu área y te digo quién es, o escribe a gestion.humana@usil.edu.pe';

  // ───────────────────────── Motor de búsqueda ─────────────────────────
  // Muletillas y relleno (peruanismos incluidos) que no aportan al significado
  const STOP = new Set(('de la el los las un una y o a en que q xq pq mi me se mis tu su al del lo le les nos es para por con quiero necesito tengo puedo puede saber favor porfa porfavor plis ' +
    'oe pe po pues causa pana oye disculpa disculpe nomas ya profe hermano usil').split(' '));
  // Sinónimos y jerga -> palabra canónica del diccionario
  const SIN = { mail: 'correo', email: 'correo', gmail: 'correo', cel: 'telefono', celu: 'telefono', celular: 'telefono', fono: 'telefono', telf: 'telefono', nro: 'numero',
    whats: 'whatsapp', wsp: 'whatsapp', wasap: 'whatsapp', plata: 'sueldo', lukas: 'sueldo', grati: 'gratificacion', chamba: 'trabajo', pega: 'trabajo',
    compu: 'computadora', pc: 'computadora', contra: 'contrasena', pass: 'contrasena', password: 'contrasena', pasword: 'contrasena', ola: 'hola', alo: 'hola',
    chao: 'chau', bacan: 'genial', chevere: 'genial', buenazo: 'genial', comunico: 'llamar', comunicar: 'llamar', comunicarme: 'llamar', llamo: 'llamar', llamada: 'llamar', llamen: 'llamar' };
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/(.)\1{2,}/g, '$1');
  const stem = w => { if (w.length < 4) return w; const s = w.replace(/(os|as|es|an|ar|en|er|ir|on|s|o|a|e)$/, ''); return s.length >= 3 ? s : w; };
  const toks = s => norm(s).split(/\s+/).filter(w => w && !STOP.has(w)).map(w => stem(SIN[w] || w));
  const lev = (a, b) => { // distancia de edición
    const p = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) { let prev = p[0]; p[0] = i; for (let j = 1; j <= b.length; j++) { const t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; } }
    return p[b.length];
  };
  const close = (a, b) => a === b ? 1 : (a.length >= 5 && b.length >= 5 && lev(a, b) <= (a.length >= 9 ? 2 : 1)) ? .7 : 0;

  const df = {};
  KB.forEach(e => { e.k = e.kw.map(toks).filter(t => t.length); new Set(e.k.flat()).forEach(s => df[s] = (df[s] || 0) + 1); });
  const idf = s => Math.log(1 + KB.length / (df[s] || 1));

  const score = (e, q) => {
    let best = 0, hits = 0;
    for (const ks of e.k) {
      let v = 0, ok = true;
      for (const s of ks) { const m = Math.max(...q.map(t => close(t, s))); if (!m) { ok = false; break; } v += idf(s) * m; }
      if (ok) { hits++; best = Math.max(best, v * (1 + .25 * (ks.length - 1))); }
    }
    return (best + .2 * Math.max(0, hits - 1)) * e.w;
  };
  const buscar = txt => {
    const q = toks(txt);
    return KB.map(e => [e, q.length ? score(e, q) : 0]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  };
  const T_OK = 1.5, T_SUG = .7;

  // ───────────────────────── Interfaz ─────────────────────────
  const AV = () => `<svg class="tav" viewBox="0 0 100 100" aria-hidden="true">
<g class="ant"><line x1="50" y1="24" x2="50" y2="13" stroke="#002b5e" stroke-width="3.5" stroke-linecap="round"/><circle class="bulb" cx="50" cy="10" r="5.5" fill="#ffb020"/></g>
<circle cx="11" cy="56" r="8" fill="#002b5e"/><circle cx="89" cy="56" r="8" fill="#002b5e"/>
<g class="head"><rect x="14" y="22" width="72" height="64" rx="30" fill="#1a6fd1"/>
<path d="M27 35c8-9 28-12 42-6" stroke="#fff" stroke-opacity=".38" stroke-width="4" fill="none" stroke-linecap="round"/>
<rect x="22" y="32" width="56" height="44" rx="21" fill="#0a2a52"/>
<ellipse cx="31" cy="65" rx="4.5" ry="2.8" fill="#ff8fb1" opacity=".6"/><ellipse cx="69" cy="65" rx="4.5" ry="2.8" fill="#ff8fb1" opacity=".6"/>
<g class="look"><g class="eo"><ellipse class="eye" cx="40" cy="52" rx="5" ry="7" fill="#7df3ff"/><ellipse class="eye e2" cx="60" cy="52" rx="5" ry="7" fill="#7df3ff"/></g>
<g class="eh"><path d="M34 56q6-10 12 0M54 56q6-10 12 0" stroke="#7df3ff" stroke-width="3.6" fill="none" stroke-linecap="round"/></g></g>
<path class="mi" d="M44 66q6 5 12 0" stroke="#7df3ff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path class="mh" d="M42 63q8 12 16 0z" fill="#7df3ff"/>
<circle class="mt" cx="50" cy="67" r="2.8" fill="#7df3ff"/>
<path class="mc" d="M42 67q3.5-4 7 0t7 0" stroke="#7df3ff" stroke-width="3" fill="none" stroke-linecap="round"/></g></svg>`;

  const CSS = `
#tlt-root{--fs:104px;--r:18px;--bt:calc(18px + env(safe-area-inset-bottom,0px));--b1:#0b4f9c;--b2:#002b5e;--acc:#ffb020;--ink:#17243a;font-family:Inter,system-ui,sans-serif}
/* escritorio: Talentin ocupa el lugar del QR, centrado en la columna derecha */
@media(min-width:1024px){#tlt-root{--g:calc(50vw - 290px);--pw:clamp(340px,calc(var(--g) - 56px),400px);--r:max(24px,calc((var(--g) - var(--fs))/2));--bt:40px}#tlt-root #tlt{right:max(24px,calc((var(--g) - var(--pw))/2));width:var(--pw)}.desktop-qr{right:auto!important;left:40px!important}}
@media(max-width:479px){#tlt-root{--r:12px;--fs:88px}}
#tlt-root *{box-sizing:border-box}
.tav{width:100%;height:100%;display:block;overflow:visible}
.tav .eye{transform-box:fill-box;transform-origin:center;animation:tlt-blink 5s infinite}
.tav .e2{animation-delay:.04s}
.tav .look{transition:transform .15s ease-out;transform:translate(calc(var(--px,0)*1px),calc(var(--py,0)*1px))}
.tav .head{transform-box:fill-box;transform-origin:50% 100%;animation:tlt-hop 4.5s infinite}
.tav .ant{transform-box:fill-box;transform-origin:50% 100%;animation:tlt-wag 2.4s ease-in-out infinite}
.tav .eo{animation:tlt-scan 8s ease-in-out infinite}
.tav .bulb{animation:tlt-glow 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.tav .eh,.tav .mh,.tav .mt,.tav .mc{display:none}
[data-mood=happy] .tav .eo,[data-mood=happy] .tav .mi{display:none}
[data-mood=happy] .tav .eh,[data-mood=happy] .tav .mh{display:block}
[data-mood=think] .tav .mi{display:none}[data-mood=think] .tav .mt{display:block}
[data-mood=think] .tav .look{transform:translate(-2.5px,-3px)}
[data-mood=confused] .tav .mi{display:none}[data-mood=confused] .tav .mc{display:block}
[data-mood=confused] .tav .e2{transform:scaleY(.55);animation:none}
@keyframes tlt-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
@keyframes tlt-hop{0%,80%,100%{transform:none}84%{transform:translateY(-7px) rotate(-5deg)}88%{transform:translateY(0) rotate(4deg)}92%{transform:translateY(-3px) rotate(-2deg)}96%{transform:none}}
@keyframes tlt-glow{0%,100%{opacity:.55;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
@keyframes tlt-float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(3deg)}}
@keyframes tlt-wag{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
@keyframes tlt-scan{0%,55%,100%{transform:none}62%{transform:translate(-2px,1px)}75%{transform:translate(2.5px,-1px)}88%{transform:translate(0,1.5px)}}
@keyframes tlt-ring{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.55);opacity:0}}
@keyframes tlt-pop{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes tlt-dot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
#tlt-fab{position:fixed;right:var(--r);bottom:var(--bt);z-index:9000;width:var(--fs);height:var(--fs);padding:8px;border:0;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(0,43,94,.32),0 0 0 3px #fff;transition:transform .2s}
#tlt-fab .tav{animation:tlt-float 3s ease-in-out infinite}
#tlt-fab:hover{transform:scale(1.1)}#tlt-fab:active{transform:scale(.95)}#tlt-fab:focus-visible{outline:3px solid var(--acc);outline-offset:3px}
#tlt-fab::before{content:"";position:absolute;inset:0;border-radius:50%;border:3px solid var(--b1);animation:tlt-ring 2.6s ease-out infinite;pointer-events:none}
#tlt-root.open #tlt-fab::before,#tlt-root.seen #tlt-fab::before{display:none}
#tlt-badge{position:absolute;top:-2px;right:-2px;min-width:22px;height:22px;border-radius:11px;background:#e5484d;color:#fff;font:700 12px/22px Inter,sans-serif;text-align:center;box-shadow:0 0 0 2px #fff}
#tlt-root.seen #tlt-badge{display:none}
#tlt-tip{position:fixed;right:var(--r);bottom:calc(var(--bt) + var(--fs) + 10px);z-index:9000;max-width:240px;padding:12px 30px 12px 14px;background:#fff;color:var(--ink);border-radius:16px 16px 4px 16px;box-shadow:0 8px 24px rgba(0,43,94,.25);font-size:14px;line-height:1.35;cursor:pointer;display:none;animation:tlt-pop .35s}
#tlt-tip.on{display:block}#tlt-root.open #tlt-tip{display:none}
#tlt-tip button{position:absolute;top:4px;right:6px;border:0;background:none;color:#8a96a8;font-size:16px;cursor:pointer}
#tlt{position:fixed;right:var(--r);bottom:calc(var(--bt) + var(--fs) + 12px);z-index:9000;width:min(400px,calc(100vw - 24px));height:min(620px,calc(100dvh - var(--bt) - var(--fs) - 48px));display:none;flex-direction:column;background:#f3f7fc;border-radius:22px;box-shadow:0 20px 60px rgba(0,43,94,.4);overflow:hidden;transform-origin:bottom right}
#tlt-root.open #tlt{display:flex;animation:tlt-pop .28s cubic-bezier(.2,.9,.3,1.2)}
#tlt header{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;background:linear-gradient(135deg,var(--b1),var(--b2));color:#fff}
#tlt .hav{width:46px;height:46px;border-radius:50%;background:#fff;padding:4px;flex:none;box-shadow:0 0 0 3px rgba(255,255,255,.3)}
#tlt .hnm{flex:1;min-width:0}#tlt .hnm b{display:block;font:600 17px/1.2 Oswald,Inter,sans-serif;letter-spacing:.3px}
#tlt .hnm span{font-size:12px;opacity:.9;display:flex;align-items:center;gap:6px}
#tlt .hnm span::before{content:"";width:8px;height:8px;border-radius:50%;background:#35e08a;box-shadow:0 0 0 3px rgba(53,224,138,.3)}
#tlt .hlogo{height:30px;width:auto;flex:none;opacity:.95}
@media(max-width:360px){#tlt .hlogo{display:none}}
#tlt-x{border:0;background:rgba(255,255,255,.15);color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:15px}
#tlt-x:hover{background:rgba(255,255,255,.28)}
#tlt-log{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.tlt-row{display:flex;gap:8px;align-items:flex-end;animation:tlt-pop .25s}
.tlt-row.u{justify-content:flex-end}
.tlt-ava{width:28px;height:28px;flex:none;border-radius:50%;background:#fff;padding:2px;box-shadow:0 1px 4px rgba(0,43,94,.2)}
.tlt-bub{max-width:82%;padding:10px 14px;font-size:14px;line-height:1.45;color:var(--ink);background:#fff;border-radius:18px 18px 18px 4px;box-shadow:0 1px 3px rgba(0,43,94,.12);white-space:pre-line;word-wrap:break-word}
.tlt-bub b{color:var(--b2)}.tlt-bub a{color:var(--b1);font-weight:600;word-break:break-all}
.tlt-row.u .tlt-bub{background:linear-gradient(135deg,#1a6fd1,var(--b1));color:#fff;border-radius:18px 18px 4px 18px}
.tlt-bub.typ{display:flex;gap:4px;padding:14px 16px}.tlt-bub.typ i{width:7px;height:7px;border-radius:50%;background:var(--b1);animation:tlt-dot 1s infinite}
.tlt-bub.typ i:nth-child(2){animation-delay:.15s}.tlt-bub.typ i:nth-child(3){animation-delay:.3s}
.tlt-bub.sos{background:#fff1f1;border:1px solid #f5b5b8}
.tlt-fig{margin:8px 0 0}.tlt-fig img{display:block;width:100%;border-radius:12px;object-fit:cover;max-height:200px}.tlt-fig figcaption{font-size:11px;color:#64748b;margin-top:3px}
.tlt-chips{display:flex;flex-wrap:wrap;gap:7px;padding-left:36px;animation:tlt-pop .3s}
.tlt-chips button,.tlt-chips a{display:inline-flex;align-items:center;gap:7px;border:1.5px solid #c9d8ee;background:#fff;color:var(--b1);border-radius:16px;padding:7px 12px;font:500 13px Inter,sans-serif;cursor:pointer;text-decoration:none;transition:.15s}
.tlt-chips button:hover,.tlt-chips a:hover{background:var(--b1);color:#fff;border-color:var(--b1);transform:translateY(-1px)}
.tlt-chips .act{background:var(--b1);color:#fff;border-color:var(--b1);font-weight:600}
.tlt-chips .act:hover{background:var(--b2)}.tlt-chips .call{background:#d92d34;border-color:#d92d34}
#tlt form{display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #e1e8f3}
#tlt input{flex:1;min-width:0;border:1.5px solid #d5e0f0;background:#f3f7fc;border-radius:22px;padding:11px 16px;font:16px Inter,sans-serif;outline:0;color:var(--ink)}
#tlt input:focus{border-color:var(--b1);background:#fff}
#tlt form button{flex:none;width:44px;height:44px;border:0;border-radius:50%;background:var(--b1);color:#fff;font-size:16px;cursor:pointer;transition:.15s}
#tlt form button:hover{background:var(--b2);transform:scale(1.06)}
#tlt small{display:block;text-align:center;color:#8a96a8;font-size:11px;padding:0 0 8px;background:#fff}
@media(prefers-reduced-motion:reduce){#tlt-root *{animation:none!important;transition:none!important}}`;

  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const root = document.createElement('div'); root.id = 'tlt-root'; root.dataset.mood = 'idle';
  root.innerHTML = `<div id="tlt-tip" role="status"><button aria-label="Cerrar aviso">×</button><span></span></div>
<button id="tlt-fab" aria-label="Abrir chat con Talentin">${AV()}<span id="tlt-badge">1</span></button>
<div id="tlt" role="dialog" aria-label="Chat con Talentin">
<header><div class="hav">${AV()}</div><div class="hnm"><b>Talentin</b><span>En línea · al instante</span></div><img class="hlogo" src="assets/usil_logo_blanco.png" alt="USIL Corporación Educativa"><button id="tlt-x" aria-label="Cerrar chat"><i class="fa-solid fa-xmark"></i></button></header>
<div id="tlt-log" aria-live="polite"></div>
<form autocomplete="off"><input id="tlt-in" placeholder="Escribe tu duda aquí…" maxlength="140" aria-label="Tu mensaje"><button aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i></button></form>
<small>Respuestas del Kit de Bienvenida · no es una IA</small></div>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s), log = $('#tlt-log'), input = $('#tlt-in');
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/([\w.+-]+@[\w.-]+\.\w+)/g, '<a href="mailto:$1">$1</a>').replace(/\b(9\d{2}) (\d{3}) (\d{3})\b/g, '<a href="tel:$1$2$3">$1 $2 $3</a>');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const down = () => { log.scrollTop = log.scrollHeight; };
  let moodT, pend;
  const mood = (m, ms) => { clearTimeout(moodT); root.dataset.mood = m; if (ms) moodT = setTimeout(() => root.dataset.mood = 'idle', ms); };

  const row = (html, who, cls = '') => {
    const r = document.createElement('div'); r.className = 'tlt-row ' + who;
    r.innerHTML = (who === 'b' ? `<div class="tlt-ava">${AV()}</div>` : '') + `<div class="tlt-bub ${cls}">${html}</div>`;
    log.appendChild(r); down(); return r;
  };
  const chips = items => { // [{t, icon, fn | href, cls}]
    if (!items.length) return;
    const d = document.createElement('div'); d.className = 'tlt-chips';
    items.forEach(c => {
      const b = document.createElement(c.href ? 'a' : 'button');
      if (c.href) { b.href = c.href; if (/^http/.test(c.href)) { b.target = '_blank'; b.rel = 'noopener'; } } else { b.type = 'button'; b.onclick = c.fn; }
      b.className = c.cls || ''; b.innerHTML = (c.icon ? `<i class="fa-solid ${c.icon}"></i>` : '') + esc(c.t);
      d.appendChild(b);
    });
    log.appendChild(d); down();
  };
  const entryChip = id => { const e = KB.find(x => x.id === id); return { t: e.label, icon: e.icon, fn: () => ask(e.label, e) }; };
  const menuChips = () => chips(MENU.map(entryChip));
  const abrir = (id, tab) => { setOpen(false); if (typeof openModal === 'function') openModal(id); if (tab) { const b = document.querySelectorAll('#' + id + ' .tab-btn')[tab - 1]; if (b) b.click(); } };

  function responder(e, extra) {
    const txt = typeof e.a[0] === 'function' ? e.a[0]() : pick(e.a);
    const figs = (e.img || []).map(([s, c]) => `<figure class="tlt-fig"><img src="${s}" alt="${esc(c)}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>${esc(c)}</figcaption></figure>`).join('');
    row(rich((e.plain || txt.length > 130 || txt.includes('\n') ? '' : pick(LEAD)) + txt) + figs, 'b', e.id === 'sos' ? 'sos' : '');
    mood('happy', 2200);
    const items = e.acts.map(([t, href, icon]) => ({ t, icon, href, cls: href.startsWith('tel') ? 'act call' : 'act' }));
    if (e.modal) items.push({ t: 'Ver sección completa', icon: 'fa-up-right-from-square', fn: () => abrir(e.modal, e.tab), cls: e.acts.length ? '' : 'act' });
    chips(items);
    if (e.menu) menuChips(); else chips([...(extra || []), ...e.f.map(entryChip)].slice(0, 6));
  }

  let fallos = 0;
  function ask(texto, forzado) {
    texto = texto.trim(); if (!texto) return;
    clearTimeout(pend); log.querySelectorAll('.tlt-chips,.typ-row').forEach(x => x.remove());
    row(esc(texto), 'u'); mood('think');
    const tipo = row('<i></i><i></i><i></i>', 'b', 'typ'); tipo.classList.add('typ-row');
    const res = forzado ? null : buscar(texto);
    pend = setTimeout(() => {
      tipo.remove();
      if (forzado) { fallos = 0; return responder(forzado); }
      const [top, sc] = res[0] || [null, 0];
      if (top && sc >= T_OK) {
        fallos = 0;
        const seg = res[1] && res[1][1] >= T_OK * .8 && res[1][1] >= sc * .75 ? [entryChip(res[1][0].id)] : [];
        return responder(top, seg);
      }
      fallos++; mood('confused', 2500);
      if (top && sc >= T_SUG) { // coincidencia débil: preguntar en vez de adivinar
        row(`¿Te refieres a **${esc(top.label)}**?` + (res[1] ? ' ¿O quizá a otro tema?' : ''), 'b');
        return chips([...res.slice(0, 2).map(x => entryChip(x[0].id)), { t: 'Ver temas', icon: 'fa-list', fn: () => ask('menu', KB.find(x => x.id === 'ayuda')) }]);
      }
      row(rich(fallos >= 2 ? ESCALA : pick(NO_SE)), 'b');
      if (fallos >= 2) chips([{ t: 'Ver socios de negocio', icon: 'fa-handshake', fn: () => abrir('partnerModal'), cls: 'act' }]);
      menuChips();
    }, 380 + Math.min(texto.length * 4, 320)); // se siente inmediato, pero "piensa" un instante
  }

  function setOpen(v) {
    root.classList.toggle('open', v);
    if (v) {
      root.classList.add('seen'); try { sessionStorage.tltSeen = 1; } catch (e) { }
      if (!log.children.length) { mood('happy', 2500); row(rich(`¡${saludo()}! Soy **Talentin** 👋, tu asistente del Kit de Bienvenida. Te respondo al instante sobre Adryan, licencias, campus, estacionamiento, contactos y más. ¿Qué necesitas?`), 'b'); menuChips(); }
      setTimeout(() => input.focus(), 50);
    }
  }
  $('#tlt-fab').onclick = () => setOpen(!root.classList.contains('open'));
  $('#tlt-x').onclick = () => setOpen(false);
  $('#tlt-tip').onclick = () => setOpen(true);
  $('#tlt-tip button').onclick = e => { e.stopPropagation(); $('#tlt-tip').classList.remove('on'); };
  $('form').onsubmit = e => { e.preventDefault(); ask(input.value); input.value = ''; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('open')) setOpen(false); });

  // Los ojos siguen el cursor
  let raf;
  document.addEventListener('pointermove', e => {
    if (raf) return; raf = requestAnimationFrame(() => {
      raf = 0; const b = $('#tlt-fab').getBoundingClientRect(), c = v => Math.max(-1, Math.min(1, v / 160));
      root.style.setProperty('--px', (c(e.clientX - b.left - b.width / 2) * 4).toFixed(2));
      root.style.setProperty('--py', (c(e.clientY - b.top - b.height / 2) * 3).toFixed(2));
    });
  });

  // Avisos proactivos (solo si aún no lo abriste)
  let seen = false; try { seen = sessionStorage.tltSeen; } catch (e) { }
  if (seen) root.classList.add('seen'); else {
    const tip = (t, ms) => setTimeout(() => { if (root.classList.contains('open') || root.classList.contains('seen')) return; $('#tlt-tip span').textContent = t; $('#tlt-tip').classList.add('on'); mood('happy', 2500); setTimeout(() => $('#tlt-tip').classList.remove('on'), 9000); }, ms);
    tip(`¡${saludo()}! 👋 ¿Te ayudo con algo que necesites?`, 2500); tip('¿Quieres saber dónde queda Talento y Cultura o cómo entrar a Adryan? Pregúntame 💬', 40000);
  }

  // Cuántas casuísticas cubre: window.talentinStats() en consola
  window.talentinStats = () => ({ temas: KB.length, frasesClave: KB.reduce((n, e) => n + e.kw.length, 0), variantesRespuesta: KB.reduce((n, e) => n + e.a.length, 0) + LEAD.length + NO_SE.length });

  // Chequeo mínimo: window.talentinTest() en consola
  window.talentinTest = () => {
    const top = t => (buscar(t)[0] || [{}])[0].id, sc = t => (buscar(t)[0] || [0, 0])[1];
    const casos = { 'olvide mi contraseña': 'clave', 'necesito mi boleta de pago': 'boleta', 'bolleta': 'boleta', 'donde esta talento y cultura': 'talento_piso', 'en que piso queda talento': 'talento_piso', 'cuantos dias de maternidad': 'maternidad', 'ayuda urgente': 'sos', 'donde queda el campus 2': 'campus2', 'campus la fontana': 'campus1', 'como llego': 'campus', 'hola': 'hola', 'gracias': 'gracias', 'tengo gripe': 'descanso', 'quiero cambiar mi domicilio': 'datos', 'como comparto el kit': 'compartir', 'quiero pedir vacaciones': 'vacaciones', 'donde dejo mi carro': 'estacionamiento', 'horario del topico': 'topico', 'no me jala el correo': 'ti', 'se me olvido la contra': 'clave', 'a quien le pregunto': 'partner', 'me robaron': 'sos', 'cuenta sueldo': 'haberes', 'quien es el subgerente': 'cesar', 'cuales son los valores': 'valores', 'seguro vida ley': 'vida_ley', 'donde esta el lactario': 'lactancia', 'afiliar a mi esposa': 'eps', 'quien ve la facultad de derecho': 'p_salazar', 'con quien hablo': 'contactos' };
    for (const [q, id] of Object.entries(casos)) console.assert(top(q) === id && sc(q) >= T_OK, `"${q}" -> ${top(q)} (${sc(q).toFixed(2)}), esperaba ${id}`);
    const L = (dow, h, m = 0) => ({ dow, h, m });
    console.assert(saludo(L(1, 8)) === 'Buenos días' && saludo(L(1, 15)) === 'Buenas tardes' && saludo(L(1, 22)) === 'Buenas noches', 'saludo');
    console.assert(limaNow(new Date('2026-01-01T03:00:00Z')).h === 22, 'zona horaria Lima');
    console.assert(sc('asdfgh') < T_SUG, 'ruido no debe coincidir');
    console.log('talentin ok');
  };
})();
