import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { vehicleGuides } from "@/data/vehicleGuides";

export const Route = createFileRoute("/guias/")({
  component: GuidesIndex,
  head: () => ({
    meta: [
      { title: "Guías EV — EV Explainers by PURA CORRIENTE" },
      {
        name: "description",
        content:
          "Guías interactivas de vehículos eléctricos: BYD, Tesla, Volvo, Zeekr y más. Explicadas en simple por PURA CORRIENTE.",
      },
    ],
  }),
});

function GuidesIndex() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[500px] opacity-30 bg-[radial-gradient(60%_80%_at_50%_0%,oklch(0.65_0.2_220),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 font-black text-xs">PC</span>
          <span className="font-semibold tracking-tight">PURA CORRIENTE</span>
        </Link>
      </div>

      <header className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
          <Sparkles className="h-3 w-3" /> EV Explainers
        </span>
        <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">
          Guías de vehículos eléctricos
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-slate-300">
          Cada guía explica el carro en simple: batería, carga, ADAS, mantenimiento y qué revisar antes de comprarlo.
        </p>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicleGuides.map((g, i) => {
            const accent = g.accentColor ?? "oklch(0.65 0.2 220)";
            return (
              <motion.div
                key={g.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
              >
                <Link
                  to="/guias/$slug"
                  params={{ slug: g.slug }}
                  className="group block relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 hover:ring-white/30 transition"
                >
                  <div
                    className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ background: accent }}
                  />
                  <div className="relative">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">{g.brand} · {g.type}</div>
                    <div className="mt-1 text-2xl font-black">{g.model}</div>
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">{g.shortDescription}</p>
                    <div className="mt-5 inline-flex items-center gap-1 text-sm text-cyan-300 group-hover:gap-2 transition-all">
                      Abrir guía <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
