import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Battery,
  Zap,
  Plug,
  Gauge,
  MonitorSmartphone,
  ShieldCheck,
  Snowflake,
  Wrench,
  Sparkles,
  ChevronDown,
  X,
  Car,
  Camera,
  Cpu,
  Waypoints,
  Brain,
  Activity,
} from "lucide-react";
import bydYuanUp from "@/assets/byd-yuan-up.jpg";
import imgMotor from "@/assets/hotspot-motor.png";
import imgBateria from "@/assets/hotspot-bateria.png";
import imgSuspension from "@/assets/hotspot-suspension.png";
import imgLlantas from "@/assets/hotspot-llantas.png";
import imgCarga from "@/assets/hotspot-carga.png";
import imgFrenos from "@/assets/hotspot-frenos.png";
import imgCabina from "@/assets/hotspot-cabina.png";
import imgSensores from "@/assets/hotspot-sensores.png";
import imgCarroceria from "@/assets/hotspot-carroceria.png";
import imgRegen from "@/assets/card-regen.png";

// Custom pretty wheel icon
const WheelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    <path d="M12 4.5 L12 9.8" />
    <path d="M12 14.2 L12 19.5" />
    <path d="M4.5 12 L9.8 12" />
    <path d="M14.2 12 L19.5 12" />
    <path d="M6.7 6.7 L10.4 10.4" />
    <path d="M13.6 13.6 L17.3 17.3" />
    <path d="M17.3 6.7 L13.6 10.4" />
    <path d="M10.4 13.6 L6.7 17.3" />
  </svg>
);

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "BYD Yuan UP — Guía Interactiva" },
      {
        name: "description",
        content:
          "Conoce el BYD Yuan UP, uno de los eléctricos más vendidos en Colombia. Guía visual, fresca y fácil de entender.",
      },
    ],
  }),
});

type Hotspot = {
  id: string;
  title: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  // position in % over the car image area
  top: string;
  left: string;
  body: string;
  tags: string[];
  image: string;

};

const HOTSPOTS: Hotspot[] = [
  {
    id: "motor",
    title: "Motor eléctrico",
    short: "Empuje instantáneo y silencioso",
    icon: Zap,
    top: "48%",
    left: "88%",
    body: "Un motor eléctrico delantero entrega potencia desde el primer toque del acelerador. Sin cambios, sin ruido, sin vibración. En el Yuan UP rinde alrededor de 70 kW (95 hp), suficiente para ciudad y trochas suaves.",
    tags: ["Sin cambios", "Silencioso", "Torque instantáneo"],
    image: imgMotor,
  },
  {
    id: "bateria",
    title: "Batería Blade",
    short: "El corazón del carro",
    icon: Battery,
    top: "76%",
    left: "50%",
    body: "Batería Blade de BYD con química LFP (litio-ferrofosfato), conocida por ser más segura frente a incendios y por durar muchos más ciclos de carga. Va en el piso del carro, lo que baja el centro de gravedad y mejora la estabilidad.",
    tags: ["LFP", "Larga vida", "Más segura"],
    image: imgBateria,
  },
  {
    id: "suspension",
    title: "Suspensión",
    short: "Cómoda para huecos colombianos",
    icon: Waypoints,
    top: "72%",
    left: "30%",
    body: "Suspensión McPherson adelante y de barra de torsión atrás. Está calibrada para absorber huecos y reductores, algo clave en las vías de nuestras ciudades. El peso de la batería abajo ayuda a que se sienta plantado en curvas.",
    tags: ["McPherson", "Confort urbano", "Estable"],
    image: imgSuspension,
  },
  {
    id: "llantas",
    title: "Llantas y rines",
    short: "Rines de 16\" con llantas eco",
    icon: WheelIcon,
    top: "82%",
    left: "74%",
    body: "Rines de aleación de 16 pulgadas con llantas de baja resistencia a la rodadura. Esto significa menos esfuerzo del motor y, por tanto, más autonomía. Repuestos y mantenimiento de llantas son estándar en cualquier montallantas.",
    tags: ["Rin 16\"", "Baja rodadura", "Repuestos fáciles"],
    image: imgLlantas,
  },
  {
    id: "carga",
    title: "Puerto de carga",
    short: "Casa o estación pública",
    icon: Plug,
    top: "62%",
    left: "70%",
    body: "Tiene puerto AC para carga lenta en casa (Tipo 2) y puerto DC para carga rápida en estaciones públicas. En casa cargas mientras duermes; en una estación rápida recuperas el 30–80% en cerca de 30–40 minutos.",
    tags: ["AC Tipo 2", "DC rápida", "Carga en casa"],
    image: imgCarga,
  },
  {
    id: "frenos",
    title: "Sistema de frenos",
    short: "Disco + regenerativo",
    icon: Gauge,
    top: "72%",
    left: "20%",
    body: "Frenos de disco adelante y tambor atrás, apoyados por el frenado regenerativo del motor. Al usar mucho el regenerativo, las pastillas se desgastan muy poco, así que el mantenimiento de frenos es más espaciado que en un carro de gasolina.",
    tags: ["ABS", "EBD", "Regenerativo"],
    image: imgFrenos,
  },
  {
    id: "cabina",
    title: "Cabina y pantalla",
    short: "Pantalla giratoria de 10.1\"",
    icon: MonitorSmartphone,
    top: "40%",
    left: "52%",
    body: "Pantalla central rotatoria (horizontal o vertical) con navegación, apps, cámara 360° y conexión al celular. Tablero digital para el conductor, climatización automática y materiales suaves al tacto. Todo pensado como una tablet sobre ruedas.",
    tags: ["Rotatoria", "Cámara 360°", "Conectividad"],
    image: imgCabina,
  },
  {
    id: "sensores",
    title: "Sensores y cámaras",
    short: "Ojos alrededor del carro",
    icon: Camera,
    top: "32%",
    left: "58%",
    body: "Cámaras perimetrales (vista 360°), sensores de parqueo y radares para asistencias de conducción. Te ayudan a parquear en espacios apretados y a detectar peatones o ciclistas que no ves directamente.",
    tags: ["360°", "Sensores", "Radar"],
    image: imgSensores,
  },
  {
    id: "carroceria",
    title: "Carrocería y peso",
    short: "SUV compacto, ~1.500 kg",
    icon: Car,
    top: "34%",
    left: "35%",
    body: "SUV compacto de unos 4.31 m de largo y aproximadamente 1.500 kg. La estructura usa aceros de alta resistencia en zonas clave para proteger la batería y a los ocupantes en caso de choque.",
    tags: ["SUV compacto", "Acero alta resistencia", "~1.500 kg"],
    image: imgCarroceria,
  },
];

type Card = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  details: string[];
  image?: string;
};

const CARDS: Card[] = [
  {
    id: "regen",
    title: "Frenos regenerativos",
    icon: Activity,
    summary: "Recuperas energía cada vez que sueltas el acelerador.",
    details: [
      "Cuando frenas o sueltas el pedal, el motor funciona al revés y devuelve energía a la batería.",
      "Resultado práctico: más autonomía en ciudad y pastillas de freno que duran mucho más.",
      "El Yuan UP permite elegir el nivel de regeneración para que se sienta más suave o más fuerte.",
    ],
    image: imgRegen,
  },
  {
    id: "autonoma",
    title: "Conducción autónoma",
    icon: Brain,
    summary: "Asistida nivel 2: ayuda, pero tú sigues manejando.",
    details: [
      "El Yuan UP ofrece asistencias de Nivel 2 (SAE): el carro puede acelerar, frenar y mantener carril por sí solo en ciertas condiciones.",
      "No es un carro autónomo: el conductor debe mantener las manos en el volante y la atención en la vía.",
      "Pensado para aliviar trancones largos y carretera, no para dejar de conducir.",
    ],
  },
  {
    id: "adas",
    title: "ADAS (asistencias al conductor)",
    icon: Cpu,
    summary: "Un copiloto digital que te avisa y reacciona.",
    details: [
      "Incluye frenado autónomo de emergencia, alerta de colisión frontal y aviso de cambio de carril.",
      "Control crucero adaptativo: mantiene distancia con el carro de adelante en autopista.",
      "Cámara 360° y sensores de parqueo facilitan maniobras en parqueaderos estrechos.",
    ],
  },
  {
    id: "clima",
    title: "Climas extremos",
    icon: Snowflake,
    summary: "Cómo se comporta en calor, frío y montaña.",
    details: [
      "Calor de tierra caliente (Cali, costa): la batería LFP tolera bien el calor; usar aire acondicionado reduce algo el rango.",
      "Frío de páramo o noches en Bogotá: el rango baja un poco al inicio porque la batería se calienta sola.",
      "Subidas largas (La Línea, La Calera): gasta más batería, pero al bajar el regenerativo recupera buena parte.",
    ],
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento",
    icon: Wrench,
    summary: "Mucho más simple y barato que un carro a gasolina.",
    details: [
      "No tiene aceite de motor, ni bujías, ni correa de distribución, ni filtros de combustible.",
      "Las pastillas de freno duran mucho más gracias al frenado regenerativo.",
      "Las revisiones son básicamente líquido de frenos, refrigerante de batería, llantas y actualizaciones de software.",
    ],
  },
  {
    id: "ia",
    title: "IA y tecnología",
    icon: Sparkles,
    summary: "Software que aprende y se actualiza solo.",
    details: [
      "Asistente de voz para controlar clima, música y navegación sin soltar el volante.",
      "Actualizaciones OTA (por internet): el carro recibe mejoras como un celular, sin ir al taller.",
      "Integración con apps del celular y conexión a la nube de BYD para diagnóstico remoto.",
    ],
  },
  {
    id: "seguridad-bateria",
    title: "Seguridad de la batería",
    icon: ShieldCheck,
    summary: "La batería Blade es de las más seguras del mercado.",
    details: [
      "La química LFP es mucho más estable: resiste perforaciones y altas temperaturas sin incendiarse fácilmente.",
      "BYD hace una prueba famosa: clavar un clavo en la celda Blade sin que se prenda fuego.",
      "Está sellada y refrigerada, y va protegida por la propia estructura del piso del carro.",
    ],
  },
];

function Index() {
  const [active, setActive] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const activeSpot = HOTSPOTS.find((h) => h.id === active);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.98_0.02_220)] via-[oklch(0.96_0.04_200)] to-[oklch(0.94_0.06_180)] py-10 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-[oklch(0.45_0.18_240)] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Guía interactiva
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            BYD Yuan UP
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600">
            Conoce uno de los eléctricos más vendidos en Colombia — sin tecnicismos, sin venta.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Toca los puntos sobre el carro para descubrir cada parte ✨
          </p>
        </motion.div>

        {/* Car diagram */}
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="relative rounded-3xl bg-white/60 backdrop-blur-md p-2 md:p-3 shadow-[0_20px_60px_-20px_oklch(0.5_0.15_240/0.35)] ring-1 ring-white/60">
            {/* Car image */}
            <div className="relative min-h-[410px] sm:min-h-[480px] md:min-h-[600px] lg:min-h-[672px] w-full overflow-hidden rounded-2xl bg-white">
              <img
                src={bydYuanUp}
                alt="BYD Yuan UP — vista lateral"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />


              {/* Hotspots overlay */}
              {HOTSPOTS.map((h, i) => {
                const isActive = active === h.id;
                return (
                  <motion.button
                    key={h.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260 }}
                    onClick={() => setActive(isActive ? null : h.id)}
                    style={{ top: h.top, left: h.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    aria-label={h.title}
                  >
                    {/* Pulse ring */}
                    <span
                      className={`absolute inset-0 -m-1 rounded-full ${
                        isActive ? "bg-[oklch(0.7_0.18_200)]" : "bg-[oklch(0.65_0.2_240)]"
                      } opacity-40 animate-ping`}
                    />
                    <span
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-[oklch(0.6_0.2_180)] to-[oklch(0.55_0.22_220)] scale-110"
                          : "bg-gradient-to-br from-[oklch(0.65_0.2_240)] to-[oklch(0.55_0.22_280)] group-hover:scale-110"
                      }`}
                    >
                      <h.icon className="h-5 w-5" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hotspot detail panel */}
        <AnimatePresence mode="wait">
          {activeSpot && (
            <motion.div
              key={activeSpot.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 max-w-4xl"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
                {/* Decorative gradient blob */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[oklch(0.85_0.15_200)] to-[oklch(0.8_0.18_280)] opacity-30 blur-3xl" />

                <button
                  onClick={() => setActive(null)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 transition"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
                  {/* IMAGE PLACEHOLDER inside hotspot */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="aspect-square w-[85%] mx-auto overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
                  >
                    <img
                      src={activeSpot.image}
                      alt={activeSpot.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.95_0.04_220)] px-2.5 py-1 text-[11px] font-semibold text-[oklch(0.45_0.18_240)]">
                      <activeSpot.icon className="h-3.5 w-3.5" />
                      {activeSpot.short}
                    </span>
                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                      {activeSpot.title}
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                      {activeSpot.body}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeSpot.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-gradient-to-r from-[oklch(0.95_0.04_200)] to-[oklch(0.93_0.06_260)] px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards section */}
        <div className="mt-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-extrabold text-slate-900"
          >
            Lo que debes saber del Yuan UP
          </motion.h2>
          <p className="mt-1 text-sm text-slate-600">
            Datos prácticos sobre tener un BYD Yuan UP en Colombia.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c, i) => {
              const isOpen = openCard === c.id;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-200 transition-shadow hover:shadow-xl cursor-pointer"
                  onClick={() => setOpenCard(isOpen ? null : c.id)}
                >
                  {/* IMAGE PLACEHOLDER on card */}
                  <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <div className="text-center text-slate-400 px-2">
                      <p className="text-[11px] font-semibold">📸 {c.title}</p>
                      <p className="text-[9px] mt-0.5">(espacio para imagen)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.2_200)] to-[oklch(0.55_0.22_260)] text-white shadow-md">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 leading-snug">{c.summary}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-slate-400"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                          {c.details.map((d, idx) => (
                            <li key={idx} className="flex gap-2 text-[13px] text-slate-600 leading-relaxed">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_200)] to-[oklch(0.55_0.22_260)]" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-slate-500">
          Guía informativa · BYD Yuan UP · Hecho para entender, no para vender.
        </footer>
      </div>
    </div>
  );
}
