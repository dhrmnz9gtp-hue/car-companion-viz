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
  CircleDollarSign,
  Wrench,
  MapPin,
  HomeIcon,
  Sparkles,
  ChevronDown,
  X,
} from "lucide-react";

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
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "bateria",
    title: "Batería Blade",
    short: "El corazón del Yuan UP",
    icon: Battery,
    top: "62%",
    left: "50%",
    body: "Usa la batería Blade de BYD (LFP), reconocida por ser más segura frente a sobrecalentamiento y con una vida útil muy larga. Va instalada en el piso del carro, lo que mejora el equilibrio y deja más espacio adentro.",
    tags: ["LFP", "Larga vida", "Más segura"],
  },
  {
    id: "motor",
    title: "Motor eléctrico",
    short: "Empuje suave y silencioso",
    icon: Zap,
    top: "55%",
    left: "20%",
    body: "Un solo motor eléctrico delantero entrega potencia desde que pisas el acelerador. Sin cambios, sin ruido, sin vibración: maneja como un celular comparado con un teléfono fijo.",
    tags: ["Sin cambios", "Silencioso", "Tracción delantera"],
  },
  {
    id: "carga",
    title: "Puerto de carga",
    short: "Casa o estación pública",
    icon: Plug,
    top: "48%",
    left: "82%",
    body: "Carga en casa con un tomacorriente reforzado durante la noche, o usa cargadores rápidos públicos para llenar gran parte de la batería en una parada de café.",
    tags: ["AC en casa", "DC rápida", "Plug & Play"],
  },
  {
    id: "pantalla",
    title: "Pantalla giratoria",
    short: "Tu centro de control",
    icon: MonitorSmartphone,
    top: "40%",
    left: "50%",
    body: "Pantalla central rotatoria con apps, navegación, cámara 360° y conexión al celular. Diseñada para que todo esté a un toque, como usar una tablet.",
    tags: ["Rotatoria", "Apps", "Cámara 360°"],
  },
  {
    id: "regen",
    title: "Frenado regenerativo",
    short: "Recupera energía al frenar",
    icon: Gauge,
    top: "70%",
    left: "78%",
    body: "Cuando sueltas el acelerador o frenas, el motor se vuelve generador y devuelve energía a la batería. Resultado: más autonomía y menos desgaste de pastillas.",
    tags: ["Más rango", "Menos desgaste", "One-pedal"],
  },
  {
    id: "seguridad",
    title: "Seguridad activa",
    short: "Asistentes inteligentes",
    icon: ShieldCheck,
    top: "32%",
    left: "22%",
    body: "Incluye airbags, control de estabilidad, asistente de frenado, cámara 360° y sensores. Pensado para el tráfico real de ciudades colombianas.",
    tags: ["Airbags", "ABS+EBD", "Cámara 360°"],
  },
];

type Card = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  details: string[];
};

const CARDS: Card[] = [
  {
    id: "autonomia",
    title: "Autonomía real",
    icon: MapPin,
    summary: "Hasta ~300 km por carga según versión y manejo.",
    details: [
      "La versión estándar rinde alrededor de 300 km reales mezclando ciudad y carretera.",
      "En ciudad el consumo baja gracias al frenado regenerativo: más kilómetros por carga.",
      "El aire acondicionado y manejar a alta velocidad reducen el rango, igual que en cualquier eléctrico.",
    ],
  },
  {
    id: "precio",
    title: "Precio en Colombia",
    icon: CircleDollarSign,
    summary: "Uno de los SUV eléctricos más accesibles del país.",
    details: [
      "Se ubica entre los eléctricos más asequibles, compitiendo con SUV de gasolina de gama media.",
      "Tiene beneficios tributarios: descuento en IVA y exención parcial de impuestos según la ciudad.",
      "Pico y placa: en varias ciudades los eléctricos están exentos.",
    ],
  },
  {
    id: "recarga",
    title: "Recarga en casa",
    icon: HomeIcon,
    summary: "Cargas mientras duermes, sin estaciones.",
    details: [
      "Con un cargador residencial de pared (wallbox) se llena en unas 6–8 horas.",
      "En tomacorriente normal reforzado funciona como carga lenta de respaldo.",
      "El 80% de la carga la harás en casa: la gasolinera deja de ser parte de tu rutina.",
    ],
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento",
    icon: Wrench,
    summary: "Mucho más simple que un carro a gasolina.",
    details: [
      "No tiene aceite de motor, ni bujías, ni correa de distribución, ni filtros típicos.",
      "Las pastillas de freno duran mucho más por el frenado regenerativo.",
      "Las revisiones son básicamente líquidos, frenos, llantas y software.",
    ],
  },
  {
    id: "garantia",
    title: "Garantía",
    icon: ShieldCheck,
    summary: "Respaldo extendido sobre la batería.",
    details: [
      "Garantía del vehículo de varios años con kilometraje amplio.",
      "Garantía especial de la batería Blade de hasta 8 años, según condiciones del concesionario.",
      "Red de servicio BYD en crecimiento en las principales ciudades del país.",
    ],
  },
  {
    id: "clima",
    title: "Clima colombiano",
    icon: Snowflake,
    summary: "Calor, lluvia y subidas: cómo se porta.",
    details: [
      "El calor moderado de la costa o los valles no afecta mucho su rendimiento.",
      "En subidas largas (tipo Bogotá–La Calera) el motor entrega torque parejo, pero gasta más batería.",
      "Bajando, el regenerativo recupera buena parte de esa energía: muy útil en zonas montañosas.",
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
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="relative rounded-3xl bg-white/60 backdrop-blur-md p-4 md:p-6 shadow-[0_20px_60px_-20px_oklch(0.5_0.15_240/0.35)] ring-1 ring-white/60">
            {/* IMAGE PLACEHOLDER: full car photo */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <p className="text-sm font-semibold">📸 Imagen del BYD Yuan UP</p>
                <p className="text-xs mt-1">(reemplaza este espacio con la foto del carro)</p>
              </div>

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
                    className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center"
                  >
                    <div className="text-center text-slate-400 px-4">
                      <p className="text-xs font-semibold">📸 Imagen: {activeSpot.title}</p>
                      <p className="text-[10px] mt-1">(espacio para tu foto)</p>
                    </div>
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
