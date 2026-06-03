// Data source for all EV guides. Add a new object here to publish a new guide.
// No design or layout changes required.

export type FAQ = { question: string; answer: string };

export type VehicleGuide = {
  slug: string;
  brand: string;
  model: string;
  type: "EV" | "PHEV" | "HEV";
  market: string;
  shortDescription: string;
  heroImage?: string; // optional hero image URL or imported asset
  accentColor?: string; // optional oklch / hex for subtle brand accent
  battery: {
    chemistry: string;
    capacity: string;
    safetyNotes: string;
    careTips: string[];
  };
  charging: {
    ac: string;
    dc: string;
    connector: string;
    homeChargingAdvice: string;
    publicChargingAdvice: string;
  };
  drivetrain: {
    motor: string;
    traction: string;
    performance: string;
  };
  regen: {
    explanation: string;
    userTip: string;
  };
  adas: string[];
  maintenance: string[];
  buyingChecklist: string[];
  faqs: FAQ[];
  warnings: string[];
  cta: {
    title: string;
    text: string;
    buttonText: string;
  };
};

const defaultCTA = {
  title: "¿Quieres saber si este EV te conviene?",
  text: "Kler Mobility puede ayudarte a comparar, revisar carga y cotizar instalación con PURA CORRIENTE.",
  buttonText: "Hablar con Kler Mobility",
};

export const vehicleGuides: VehicleGuide[] = [
  {
    slug: "byd-yuan-up",
    brand: "BYD",
    model: "Yuan UP",
    type: "EV",
    market: "Global / LatAm según disponibilidad",
    shortDescription:
      "SUV eléctrico compacto, urbano y eficiente. Uno de los EV más vendidos en Colombia gracias a su batería Blade y su precio competitivo.",
    accentColor: "oklch(0.65 0.2 240)",
    battery: {
      chemistry: "LFP (Litio-Ferrofosfato) — Batería Blade de BYD",
      capacity: "~ 45 kWh, autonomía aprox. 300–400 km WLTP",
      safetyNotes:
        "La química LFP es muy estable: tolera mejor el calor y resiste perforaciones sin incendiarse fácilmente. Va sellada en el piso del carro.",
      careTips: [
        "No es necesario cargar siempre al 100% — el LFP sí tolera carga completa frecuente.",
        "Evita dejarla por días al 0%. Ideal mantenerla entre 20% y 90%.",
        "En clima muy frío, la autonomía baja un poco al principio. Es normal.",
      ],
    },
    charging: {
      ac: "Hasta 7 kW en corriente alterna (carga en casa)",
      dc: "Hasta ~60 kW en corriente directa (carga rápida pública)",
      connector: "Tipo 2 (AC) + CCS2 (DC) en versiones LatAm",
      homeChargingAdvice:
        "Con un cargador de pared de 7 kW carga completa en ~7 horas. Ideal para cargar de noche.",
      publicChargingAdvice:
        "En estación rápida recuperas de 30% a 80% en aprox. 30–40 minutos.",
    },
    drivetrain: {
      motor: "Motor eléctrico delantero, ~70 kW (95 hp)",
      traction: "Tracción delantera (FWD)",
      performance: "0–100 km/h en ~12 s. Pensado para ciudad y carretera tranquila.",
    },
    regen: {
      explanation:
        "Al soltar el acelerador o frenar, el motor funciona al revés y devuelve energía a la batería.",
      userTip:
        "Usa el modo de regeneración alta en ciudad: gastas menos pastillas de freno y ganas autonomía.",
    },
    adas: [
      "Frenado autónomo de emergencia (AEB)",
      "Control crucero adaptativo",
      "Alerta de cambio de carril",
      "Cámara 360° y sensores de parqueo",
      "Pantalla central rotatoria de 10.1\"",
    ],
    maintenance: [
      "Sin aceite de motor, sin bujías, sin correa de distribución.",
      "Revisión de líquido de frenos y refrigerante de batería en intervalos largos.",
      "Pastillas de freno duran mucho más gracias al regenerativo.",
      "Actualizaciones de software OTA (over-the-air).",
    ],
    buyingChecklist: [
      "Confirma garantía de batería (BYD suele dar 8 años / 160.000 km).",
      "Verifica disponibilidad de repuestos y servicio en tu ciudad.",
      "Revisa que tu casa o parqueadero permita instalar un cargador de 7 kW.",
      "Pide historial de cargas rápidas si es usado.",
      "Prueba la pantalla, cámara 360° y modos de regeneración.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta cargarlo en casa en Colombia?",
        answer:
          "Una carga completa cuesta aproximadamente entre $15.000 y $25.000 COP según tu tarifa de energía — mucho menos que un tanque de gasolina equivalente.",
      },
      {
        question: "¿Sirve para subir a tierra fría o La Línea?",
        answer:
          "Sí. Gasta más batería en subida, pero al bajar recupera buena parte gracias al frenado regenerativo.",
      },
      {
        question: "¿La batería se daña con el calor de la costa?",
        answer:
          "La química LFP tolera bien el calor. Usar aire acondicionado reduce algo el rango, pero la batería sigue siendo segura.",
      },
    ],
    warnings: [
      "Nivel 2 de asistencia: el carro ayuda, pero TÚ sigues manejando. No es autónomo.",
      "Evita cargas DC rápidas todos los días si puedes — la carga lenta cuida la batería a largo plazo.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "tesla-model-y",
    brand: "Tesla",
    model: "Model Y",
    type: "EV",
    market: "Global",
    shortDescription:
      "SUV mediano premium con la red de Supercargadores de Tesla, software avanzado y gran autonomía.",
    accentColor: "oklch(0.6 0.2 25)",
    battery: {
      chemistry: "LFP (RWD) o NMC (Long Range / Performance)",
      capacity: "~ 60–82 kWh, autonomía 455–600 km WLTP según versión",
      safetyNotes:
        "Pack con gestión térmica líquida activa. La versión LFP tolera cargas al 100% frecuentes.",
      careTips: [
        "Versiones NMC: mantén entre 20% y 80% diariamente.",
        "Versión LFP: Tesla recomienda cargar al 100% al menos una vez por semana.",
        "Usa precondicionamiento antes de cargar en Supercharger.",
      ],
    },
    charging: {
      ac: "Hasta 11 kW AC",
      dc: "Hasta 250 kW en V3 Supercharger",
      connector: "NACS (EE.UU.) / Tipo 2 + CCS2 (Europa y LatAm)",
      homeChargingAdvice:
        "Con Wall Connector de 11 kW recargas completo en una noche.",
      publicChargingAdvice:
        "En Supercharger 10–80% en aprox. 25–30 minutos. La app planea las paradas automáticamente.",
    },
    drivetrain: {
      motor: "Motor trasero (RWD) o dual (AWD)",
      traction: "RWD o AWD según versión",
      performance: "0–100 km/h entre 3.7 s (Performance) y 6.9 s (RWD)",
    },
    regen: {
      explanation:
        "Regeneración fija fuerte (one-pedal driving). Casi no usas el pedal de freno en ciudad.",
      userTip:
        "Toma una semana acostumbrarse. Después no querrás manejar otra cosa.",
    },
    adas: [
      "Autopilot estándar (crucero adaptativo + mantener carril)",
      "Enhanced Autopilot / FSD (opcional, según mercado)",
      "8 cámaras alrededor del carro",
      "Pantalla central de 15\"",
      "Llamado del carro (Summon)",
    ],
    maintenance: [
      "Revisiones mínimas: filtro de aire de cabina, líquido de frenos.",
      "Actualizaciones OTA frecuentes con nuevas funciones.",
      "Servicio móvil: el técnico va a tu casa para muchas reparaciones.",
    ],
    buyingChecklist: [
      "Confirma cobertura de Supercargadores en tu ruta habitual.",
      "Revisa versión de batería (LFP vs NMC) — afecta cuidado y rango.",
      "Verifica si FSD viene incluido o es suscripción.",
      "Inspecciona paneles y alineación (calidad de ensamble varía).",
      "Prueba el Autopilot en carretera antes de comprar.",
    ],
    faqs: [
      {
        question: "¿Necesito una Tesla Wall Connector?",
        answer:
          "No es obligatoria. Cualquier cargador Tipo 2 / NACS funciona, pero la Wall Connector da la carga más rápida en casa.",
      },
      {
        question: "¿FSD es realmente autónomo?",
        answer:
          "No. Es Nivel 2 asistido. Debes mantener atención y manos en el volante todo el tiempo.",
      },
    ],
    warnings: [
      "Autopilot/FSD NO es conducción autónoma. Tú eres el responsable.",
      "Los precios y la disponibilidad varían frecuentemente.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "volvo-ex30",
    brand: "Volvo",
    model: "EX30",
    type: "EV",
    market: "Global",
    shortDescription:
      "SUV eléctrico compacto premium con enfoque en seguridad escandinava y sostenibilidad.",
    accentColor: "oklch(0.55 0.12 230)",
    battery: {
      chemistry: "LFP (Single Motor) o NMC (Twin Motor Performance)",
      capacity: "~ 51–69 kWh, autonomía 344–480 km WLTP",
      safetyNotes:
        "Estructura con jaula de seguridad reforzada. Sistemas activos de protección al ocupante incluidos de serie.",
      careTips: [
        "LFP: puedes cargar al 100% sin problema.",
        "Mantén actualizaciones de software al día.",
        "Precondiciona la batería antes de carga rápida.",
      ],
    },
    charging: {
      ac: "Hasta 11 kW AC",
      dc: "Hasta 153 kW DC (versión Extended Range)",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice:
        "Con cargador de 11 kW carga completa en ~6 horas.",
      publicChargingAdvice:
        "10–80% en aprox. 26 minutos en cargador rápido CCS.",
    },
    drivetrain: {
      motor: "Single Motor (RWD) o Twin Motor (AWD)",
      traction: "Trasera o integral según versión",
      performance: "0–100 km/h en 3.6 s (Twin Performance) a 5.7 s (Single)",
    },
    regen: {
      explanation:
        "Regeneración ajustable o modo one-pedal completo.",
      userTip:
        "Activa one-pedal para conducción urbana — más eficiente y suave.",
    },
    adas: [
      "Pilot Assist (crucero adaptativo + carril)",
      "Park Pilot Assist",
      "Cámara 360°",
      "Detección de cruce y peatones",
      "Pantalla central vertical de 12.3\"",
    ],
    maintenance: [
      "Plan de mantenimiento Volvo cada 30.000 km o 2 años.",
      "Sin cambios de aceite ni filtros de combustible.",
      "Actualizaciones OTA del sistema.",
    ],
    buyingChecklist: [
      "Confirma versión: Single, Extended Range o Twin Performance.",
      "Revisa garantía de batería (8 años / 160.000 km).",
      "Verifica red de servicio Volvo en tu ciudad.",
      "Prueba la pantalla central — todo se controla desde ahí.",
    ],
    faqs: [
      {
        question: "¿Por qué casi no tiene botones físicos?",
        answer:
          "Volvo simplificó la cabina y movió controles a la pantalla central. Toma adaptación pero es muy limpio visualmente.",
      },
    ],
    warnings: [
      "El minimalismo de cabina puede ser incómodo si prefieres botones físicos.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "byd-dolphin-mini",
    brand: "BYD",
    model: "Dolphin Mini",
    type: "EV",
    market: "LatAm",
    shortDescription:
      "Hatchback eléctrico ultra compacto, ideal para ciudad. Uno de los EV más asequibles del mercado.",
    accentColor: "oklch(0.7 0.15 200)",
    battery: {
      chemistry: "LFP Blade",
      capacity: "~ 30–38 kWh, autonomía 280–340 km",
      safetyNotes:
        "Misma tecnología Blade del resto de BYD: muy segura ante perforaciones y altas temperaturas.",
      careTips: [
        "Cargar en casa por la noche cubre prácticamente todo el uso urbano.",
        "No es necesario buscar cargadores rápidos a diario.",
      ],
    },
    charging: {
      ac: "Hasta 6.6 kW AC",
      dc: "Hasta 40 kW DC",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice: "Carga completa en ~6–7 horas en casa.",
      publicChargingAdvice: "30–80% en aprox. 30 minutos en DC.",
    },
    drivetrain: {
      motor: "Motor eléctrico delantero ~55 kW",
      traction: "FWD",
      performance: "0–100 km/h en ~14 s. Pensado puramente para ciudad.",
    },
    regen: {
      explanation: "Regeneración suave, ajustable en dos niveles.",
      userTip: "Modo alto en trancones = mucha más autonomía.",
    },
    adas: [
      "ABS + EBD",
      "Cámara de reversa",
      "Sensores de parqueo traseros",
      "Pantalla central rotatoria",
    ],
    maintenance: [
      "Mantenimiento mínimo, similar al Yuan UP.",
      "Revisión anual de líquido de frenos y refrigerante.",
    ],
    buyingChecklist: [
      "Confirma espacio interior — es compacto.",
      "Verifica que la autonomía cubra tu uso real.",
      "Revisa puntos de carga cerca a tu casa/trabajo.",
    ],
    faqs: [
      {
        question: "¿Sirve para carretera?",
        answer:
          "Sí, pero está optimizado para ciudad. Para viajes largos planea paradas de carga.",
      },
    ],
    warnings: [
      "ADAS básico — no esperes nivel premium aquí.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "zeekr-x",
    brand: "Zeekr",
    model: "X",
    type: "EV",
    market: "Global",
    shortDescription:
      "SUV compacto premium con diseño futurista, plataforma SEA de Geely y enfoque tecnológico.",
    accentColor: "oklch(0.6 0.18 290)",
    battery: {
      chemistry: "NMC de alta densidad",
      capacity: "~ 66 kWh, autonomía 440 km WLTP",
      safetyNotes:
        "Pack con gestión térmica avanzada y monitoreo por celda.",
      careTips: [
        "Mantén entre 20% y 80% para uso diario.",
        "Carga al 100% solo antes de viajes largos.",
      ],
    },
    charging: {
      ac: "Hasta 22 kW AC (trifásico)",
      dc: "Hasta 150 kW DC",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice:
        "Con AC trifásico de 22 kW carga completa en ~3.5 horas.",
      publicChargingAdvice:
        "10–80% en aprox. 30 minutos en cargador rápido.",
    },
    drivetrain: {
      motor: "Single Motor (RWD) o Dual Motor (AWD)",
      traction: "RWD o AWD",
      performance: "0–100 km/h en 3.8 s (Privilege AWD) a 5.6 s (RWD)",
    },
    regen: {
      explanation:
        "Tres niveles de regeneración + modo one-pedal opcional.",
      userTip:
        "Activa one-pedal en ciudad para conducción más eficiente.",
    },
    adas: [
      "Crucero adaptativo con stop & go",
      "Mantenimiento de carril activo",
      "Cámara 360° con vista transparente del chasis",
      "Pantalla central de 14.6\"",
      "Asistente de parqueo automático",
    ],
    maintenance: [
      "Servicio Zeekr cada 20.000 km o 1 año.",
      "Actualizaciones OTA frecuentes.",
      "Sin mantenimiento de motor térmico.",
    ],
    buyingChecklist: [
      "Confirma disponibilidad oficial y servicio en tu país.",
      "Revisa garantía de batería y motor.",
      "Prueba la interfaz — es muy distinta a marcas tradicionales.",
      "Verifica compatibilidad con cargadores locales.",
    ],
    faqs: [
      {
        question: "¿Zeekr es confiable?",
        answer:
          "Es la marca premium de Geely (dueña de Volvo y Polestar). Comparte plataforma e ingeniería con ellas.",
      },
    ],
    warnings: [
      "Red de servicio aún en expansión en algunos países de LatAm.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "tesla-model-3",
    brand: "Tesla",
    model: "Model 3",
    type: "EV",
    market: "Global",
    shortDescription:
      "Sedán eléctrico premium, eficiente y deportivo. El EV más vendido del mundo y referencia obligada del segmento.",
    accentColor: "oklch(0.62 0.2 25)",
    battery: {
      chemistry: "LFP (RWD estándar) o NMC (Long Range / Performance)",
      capacity: "~ 60–82 kWh, autonomía 513–629 km WLTP según versión",
      safetyNotes:
        "Pack con gestión térmica líquida activa. Estructura con calificaciones máximas en Euro NCAP e IIHS.",
      careTips: [
        "Versión LFP: cargar al 100% al menos una vez por semana.",
        "Versión NMC: mantener entre 20% y 80% para el día a día.",
        "Activa el precondicionamiento de batería antes de Supercargar.",
      ],
    },
    charging: {
      ac: "Hasta 11 kW AC",
      dc: "Hasta 250 kW en V3 Supercharger",
      connector: "NACS (EE.UU.) / Tipo 2 + CCS2 (Europa y LatAm)",
      homeChargingAdvice:
        "Con Wall Connector de 11 kW recargas completo en una noche.",
      publicChargingAdvice:
        "10–80% en aprox. 25 minutos en Supercharger V3.",
    },
    drivetrain: {
      motor: "Motor trasero (RWD) o dual (AWD)",
      traction: "RWD o AWD",
      performance: "0–100 km/h en 3.1 s (Performance) a 6.1 s (RWD)",
    },
    regen: {
      explanation:
        "Regeneración fuerte fija con one-pedal driving.",
      userTip:
        "En ciudad casi no necesitas el pedal de freno.",
    },
    adas: [
      "Autopilot estándar",
      "Enhanced Autopilot / FSD (opcional)",
      "8 cámaras 360°",
      "Pantalla central de 15.4\"",
      "Llaves vía app móvil o tarjeta NFC",
    ],
    maintenance: [
      "Filtro de cabina, líquido de frenos y rotación de llantas.",
      "Actualizaciones OTA frecuentes con nuevas funciones.",
      "Servicio móvil disponible para muchas reparaciones.",
    ],
    buyingChecklist: [
      "Confirma cobertura de Supercargadores en tu ruta.",
      "Revisa versión de batería (LFP vs NMC).",
      "Verifica si incluye FSD o es suscripción aparte.",
      "Inspecciona ajustes de paneles y pintura.",
    ],
    faqs: [
      {
        question: "¿Cuánto dura realmente la batería?",
        answer:
          "Tesla garantiza 8 años o 192.000 km con al menos 70% de capacidad. En la práctica suelen durar más.",
      },
    ],
    warnings: [
      "Autopilot/FSD es Nivel 2 — tú sigues siendo responsable.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "kia-ev5",
    brand: "KIA",
    model: "EV5",
    type: "EV",
    market: "Global / LatAm",
    shortDescription:
      "SUV eléctrico familiar con diseño moderno, espacio generoso y la garantía KIA. Pensado para uso diario sin complicaciones.",
    accentColor: "oklch(0.62 0.18 35)",
    battery: {
      chemistry: "LFP (Standard) o NMC (Long Range)",
      capacity: "~ 64–88 kWh, autonomía 400–720 km CLTC",
      safetyNotes:
        "Pack con gestión térmica activa y monitoreo por celda.",
      careTips: [
        "LFP tolera cargar al 100% sin problema.",
        "NMC: mantén entre 20% y 80% para uso diario.",
        "Aprovecha el precondicionamiento previo a carga rápida.",
      ],
    },
    charging: {
      ac: "Hasta 11 kW AC",
      dc: "Hasta 140 kW DC",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice:
        "Con cargador de pared de 11 kW recargas completo en ~7 horas.",
      publicChargingAdvice:
        "30–80% en aprox. 30 minutos en cargador rápido CCS.",
    },
    drivetrain: {
      motor: "Single Motor (FWD) o Dual Motor (AWD)",
      traction: "FWD o AWD según versión",
      performance: "0–100 km/h en 6.1 s (AWD) a 8.9 s (FWD)",
    },
    regen: {
      explanation:
        "4 niveles de regeneración + modo i-Pedal (one-pedal driving).",
      userTip:
        "Usa las paletas detrás del volante para cambiar regeneración al vuelo.",
    },
    adas: [
      "Crucero adaptativo con stop & go",
      "Mantenimiento de carril (LFA)",
      "Frenado autónomo de emergencia",
      "Cámara 360° y monitor de punto ciego",
      "Pantalla curva dual de 12.3\"",
    ],
    maintenance: [
      "Servicio cada 15.000 km o 1 año.",
      "Sin aceite, sin bujías, sin correas.",
      "Garantía de batería KIA de 7 años / 150.000 km.",
    ],
    buyingChecklist: [
      "Confirma versión (Standard, Long Range, AWD).",
      "Revisa cobertura de la red de servicio KIA.",
      "Verifica capacidad V2L (cargar electrodomésticos desde el carro).",
      "Prueba espacio en segunda fila y baúl.",
    ],
    faqs: [
      {
        question: "¿Sirve V2L para acampar?",
        answer:
          "Sí. Con el adaptador V2L puedes conectar electrodomésticos hasta 3.6 kW directamente al carro.",
      },
    ],
    warnings: [
      "Disponibilidad de versiones varía por mercado.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "chery-icar",
    brand: "Chery",
    model: "iCAR",
    type: "EV",
    market: "China / Global emergente",
    shortDescription:
      "SUV eléctrico compacto con diseño retro-futurista cuadrado, pensado para jóvenes y uso urbano con personalidad.",
    accentColor: "oklch(0.7 0.17 145)",
    battery: {
      chemistry: "LFP",
      capacity: "~ 50–70 kWh, autonomía 401–501 km CLTC",
      safetyNotes:
        "Pack LFP con buena tolerancia térmica y monitoreo integrado.",
      careTips: [
        "Cargar al 100% no daña la batería LFP.",
        "Evita dejarla descargada por días largos.",
      ],
    },
    charging: {
      ac: "Hasta 11 kW AC",
      dc: "Hasta 80 kW DC",
      connector: "Tipo 2 + CCS2 (mercados internacionales)",
      homeChargingAdvice:
        "Carga completa en casa en ~6–7 horas con cargador de 11 kW.",
      publicChargingAdvice:
        "30–80% en aprox. 35 minutos en cargador rápido.",
    },
    drivetrain: {
      motor: "Single Motor (RWD) o Dual Motor (AWD)",
      traction: "RWD o AWD",
      performance: "0–100 km/h en ~6.6 s (AWD) a 8.6 s (RWD)",
    },
    regen: {
      explanation:
        "Regeneración ajustable en varios niveles.",
      userTip:
        "Modo alto en ciudad mejora autonomía y reduce desgaste de frenos.",
    },
    adas: [
      "Crucero adaptativo",
      "Cámara 360°",
      "Asistente de mantenimiento de carril",
      "Pantalla central de 15.6\"",
      "Techo panorámico opcional",
    ],
    maintenance: [
      "Mantenimiento mínimo, similar a otros EV.",
      "Actualizaciones OTA según mercado.",
    ],
    buyingChecklist: [
      "Confirma disponibilidad oficial y servicio en tu país.",
      "Revisa repuestos y tiempos de espera.",
      "Verifica compatibilidad con cargadores locales.",
      "Prueba interior — el diseño cuadrado da mucho espacio útil.",
    ],
    faqs: [
      {
        question: "¿Chery es la misma marca de antes?",
        answer:
          "Sí, pero su línea EV (iCAR, Omoda) usa plataformas y tecnología nuevas, muy distintas a sus modelos a gasolina anteriores.",
      },
    ],
    warnings: [
      "Red de servicio y respaldo varía mucho según país.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "zeekr-001",
    brand: "Zeekr",
    model: "001",
    type: "EV",
    market: "Global",
    shortDescription:
      "Shooting brake eléctrico de alto rendimiento, plataforma SEA de Geely, autonomía premium y carga ultra rápida.",
    accentColor: "oklch(0.55 0.2 280)",
    battery: {
      chemistry: "NMC de alta densidad (Qilin / CATL en versiones top)",
      capacity: "~ 95–100 kWh, autonomía 656–741 km CLTC",
      safetyNotes:
        "Pack estructural con gestión térmica avanzada y batería 800V en versiones nuevas.",
      careTips: [
        "Mantén entre 20% y 80% para uso diario.",
        "Carga al 100% solo antes de viajes largos.",
        "Aprovecha el precondicionamiento de batería.",
      ],
    },
    charging: {
      ac: "Hasta 22 kW AC trifásico",
      dc: "Hasta 360 kW DC (arquitectura 800V)",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice:
        "Con AC trifásico de 22 kW carga completa en ~5 horas.",
      publicChargingAdvice:
        "10–80% en aprox. 15 minutos en cargador ultra rápido compatible.",
    },
    drivetrain: {
      motor: "Single Motor (RWD) o Dual Motor (AWD)",
      traction: "RWD o AWD",
      performance: "0–100 km/h en 3.8 s (AWD) a 5.6 s (RWD)",
    },
    regen: {
      explanation:
        "Regeneración ajustable + modo one-pedal.",
      userTip:
        "Combínalo con modo Eco en ciudad para máxima autonomía.",
    },
    adas: [
      "Zeekr Assisted Driving (ZAD)",
      "Crucero adaptativo con cambio de carril",
      "Cámara 360° transparente",
      "Pantalla central de 15.4\" + HUD AR",
      "Sistema de sonido Yamaha de 25 altavoces",
    ],
    maintenance: [
      "Servicio Zeekr cada 20.000 km o 1 año.",
      "Actualizaciones OTA constantes.",
      "Garantía de batería extensa (varía por mercado).",
    ],
    buyingChecklist: [
      "Confirma disponibilidad oficial y servicio en tu país.",
      "Revisa qué versión de batería trae (400V vs 800V).",
      "Verifica compatibilidad con cargadores ultra rápidos locales.",
      "Prueba ZAD en carretera antes de comprar.",
    ],
    faqs: [
      {
        question: "¿Es un sedán o un wagon?",
        answer:
          "Es un shooting brake: combina silueta de sedán deportivo con baúl tipo wagon, muy práctico.",
      },
    ],
    warnings: [
      "Sin red local en muchos mercados de LatAm — verifica respaldo.",
    ],
    cta: defaultCTA,
  },
  {
    slug: "zeekr-7x",
    brand: "Zeekr",
    model: "7X",
    type: "EV",
    market: "Global",
    shortDescription:
      "SUV mediano premium con arquitectura 800V, carga ultra rápida y enfoque tecnológico. El rival directo del Tesla Model Y.",
    accentColor: "oklch(0.6 0.18 260)",
    battery: {
      chemistry: "LFP Golden Battery (Standard) o NMC (Long Range / AWD)",
      capacity: "~ 75–100 kWh, autonomía 480–780 km CLTC",
      safetyNotes:
        "Arquitectura 800V con celdas de carga ultra rápida y monitoreo avanzado.",
      careTips: [
        "LFP: puedes cargar al 100% sin problema.",
        "NMC: mantén entre 20% y 80% diariamente.",
        "Aprovecha el precondicionamiento automático antes de carga rápida.",
      ],
    },
    charging: {
      ac: "Hasta 22 kW AC trifásico",
      dc: "Hasta 480 kW DC (arquitectura 800V)",
      connector: "Tipo 2 + CCS2",
      homeChargingAdvice:
        "Con AC trifásico de 22 kW recargas completo en ~4 horas.",
      publicChargingAdvice:
        "10–80% en aprox. 13 minutos en cargador ultra rápido compatible.",
    },
    drivetrain: {
      motor: "Single Motor (RWD) o Dual Motor (AWD)",
      traction: "RWD o AWD",
      performance: "0–100 km/h en 3.8 s (AWD Performance) a 6.0 s (RWD)",
    },
    regen: {
      explanation:
        "Regeneración ajustable + modo one-pedal opcional.",
      userTip:
        "El modo Eco con regen alta optimiza autonomía en trancón.",
    },
    adas: [
      "Conducción asistida ZAD con LiDAR",
      "Crucero adaptativo con cambio de carril",
      "Cámara 360° con visión transparente del chasis",
      "Pantalla central de 16\" + HUD AR",
      "Parqueo automático con memoria de rutas",
    ],
    maintenance: [
      "Servicio Zeekr cada 20.000 km o 1 año.",
      "Actualizaciones OTA frecuentes.",
      "Sin mantenimiento de motor térmico.",
    ],
    buyingChecklist: [
      "Confirma versión (Standard, Long Range, AWD Performance).",
      "Verifica disponibilidad de carga ultra rápida en tu ruta.",
      "Revisa red de servicio Zeekr en tu país.",
      "Prueba el sistema asistido en carretera.",
    ],
    faqs: [
      {
        question: "¿Para qué sirve la arquitectura 800V?",
        answer:
          "Permite cargar mucho más rápido y reducir pérdidas de energía. En la práctica: menos tiempo enchufado en viajes largos.",
      },
    ],
    warnings: [
      "Necesita cargadores DC potentes para aprovechar la arquitectura 800V.",
    ],
    cta: defaultCTA,
  },
];

export function getGuideBySlug(slug: string): VehicleGuide | undefined {
  return vehicleGuides.find((g) => g.slug === slug);
}
