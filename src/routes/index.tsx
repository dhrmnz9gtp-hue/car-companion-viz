import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Battery, ShieldCheck, Car, Plug, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";


import { vehicleGuides } from "@/data/vehicleGuides";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EV Explainers by PURA CORRIENTE" },
      {
        name: "description",
        content:
          "Guías interactivas de vehículos eléctricos explicadas en simple. Una iniciativa de PURA CORRIENTE.",
      },
    ],
  }),
});

function Landing() {
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  useEffect(() => {
    if (!modalSrc) return;
    const scrollY = window.scrollY;
    const { overflow, position, top, width } = document.body.style;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [modalSrc]);


  const openModal = (src: string, title: string) => {
    setModalTitle(title);
    setModalSrc(src);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(60%_80%_at_50%_0%,oklch(0.55_0.22_260/0.5),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(40%_60%_at_80%_10%,oklch(0.65_0.2_200/0.4),transparent_70%)]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 mx-auto max-w-6xl px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-green-500 text-slate-950 font-black text-xs">PC</span>
          <span className="font-semibold tracking-tight">PURA CORRIENTE</span>
        </div>
        <Link
          to="/guias"
          className="text-sm text-slate-300 hover:text-white inline-flex items-center gap-1"
        >
          Ver guías <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>

      {/* Hero */}
      <header className="relative z-10 mx-auto max-w-6xl px-4 pt-16 md:pt-24 pb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300"
        >
          <Sparkles className="h-3 w-3" /> EV Explainers
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 text-5xl md:text-7xl font-black tracking-tight leading-[1.02]"
        >
          Entiende los carros{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300 bg-clip-text text-transparent">
            eléctricos
          </span>
          <br />
          antes de comprarlos.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-2xl mx-auto text-slate-300 text-base md:text-lg"
        >
          Guías visuales e interactivas de cada modelo EV: batería, carga, ADAS, mantenimiento y checklist de compra. Sin tecnicismos, sin venta.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => openModal("/interactivos/tesla-model-3.html", "Guía de Vehículo EV — Tesla Model 3")}
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 text-slate-950 font-semibold px-6 py-3 text-sm hover:bg-emerald-300 transition"
          >
            <Car className="h-4 w-4" /> Guía de Vehículo EV <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => openModal("/interactivos/cargador-tesla.html", "Guías de Cargadores EV — Tesla Supercharger")}
            className="group inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-emerald-400/40 text-white font-medium px-6 py-3 text-sm hover:bg-white/15 transition"
          >
            <Plug className="h-4 w-4 text-emerald-300" /> Guías de Cargadores EV <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {modalSrc && typeof document !== "undefined" && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle}
            onKeyDown={(e) => { if (e.key === "Escape") setModalSrc(null); }}
            className="fixed inset-0 w-screen h-screen bg-slate-950"
            style={{ zIndex: 2147483647 }}
          >
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
            <div className="absolute inset-0 flex items-center justify-center">
              <iframe
                src={modalSrc}
                title={modalTitle}
                className="w-full h-full border-0 bg-slate-950"
              />
            </div>
            <button
              type="button"
              onClick={() => setModalSrc(null)}
              className="fixed top-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 text-white ring-1 ring-emerald-400/50 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-emerald-400 hover:text-slate-950 transition shadow-2xl"
              style={{ zIndex: 2147483647 }}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" /> Cerrar
            </button>
          </div>,
          document.body,
        )}




        {/* Feature bullets */}
        <div className="mt-14 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => openModal("/interactivos/bateria-en-simple.html", "Batería en simple — Guía interactiva")}
            className="group text-left rounded-2xl bg-white/[0.04] ring-1 ring-emerald-400/30 p-4 hover:ring-emerald-400/70 hover:bg-white/[0.07] transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl opacity-60 group-hover:opacity-100 transition" />
            <Battery className="h-5 w-5 text-emerald-300 relative" />
            <div className="mt-2 text-sm font-bold relative inline-flex items-center gap-1">
              Batería en simple
              <ArrowRight className="h-3.5 w-3.5 text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 relative">Guía interactiva · 11 secciones para entenderla.</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold relative">▶ Abrir guía</div>
          </button>
          {[
            { icon: Zap, t: "Carga AC y DC", d: "Tiempos, conectores y consejos." },
            { icon: ShieldCheck, t: "Antes de comprar", d: "Checklist y advertencias claras." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 text-left">
              <x.icon className="h-5 w-5 text-emerald-300" />
              <div className="mt-2 text-sm font-bold">{x.t}</div>
              <div className="text-xs text-slate-400 mt-0.5">{x.d}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Guides preview */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">Guías disponibles</h2>
          <Link to="/guias" className="text-sm text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicleGuides.map((g, i) => {
            const accent = g.accentColor ?? "oklch(0.65 0.2 220)";
            return (
              <motion.div
                key={g.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
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

                    {/* Trabajos interactivos */}
                    {g.slug === "byd-yuan-up" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openModal("/interactivos/byd-yuan-up.html", "Modelo interactivo — BYD Yuan UP");
                        }}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold px-3 py-2.5 text-xs uppercase tracking-wider hover:bg-emerald-300 transition"
                      >
                        ▶ Abrir modelo interactivo
                      </button>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-emerald-400/30 bg-white/[0.02] px-3 py-3 text-[11px] uppercase tracking-wider text-emerald-300/70">
                        Trabajos interactivos · próximamente
                      </div>
                    )}

                    <div className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-300 group-hover:gap-2 transition-all">
                      Abrir guía <ArrowRight className="h-4 w-4" />
                    </div>

                  </div>
                </Link>

              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        EV Explainers by PURA CORRIENTE · Hecho para entender, no para vender.
      </footer>
    </div>
  );
}
