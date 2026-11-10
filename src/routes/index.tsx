import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Battery, ShieldCheck, Car, Plug } from "lucide-react";
import { useState } from "react";
import { EvGuideModal } from "@/components/EvGuideModal";
import { educationSearch, saveGuideSnapshot } from "@/lib/ev-guide-context";

import { vehicleGuides } from "@/data/vehicleGuides";

export const Route = createFileRoute("/")({
  component: Landing,
  validateSearch: educationSearch,
  head: () => ({
    meta: [
      { title: "Pura Academy by Pura Corriente" },
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

  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const education = search.guide === "education";
  const section = search.section ?? "bateria";
  const closeModal = () => {
    setModalSrc(null);
    if (education) void navigate({ search: {}, replace: true, resetScroll: false });
  };
  const openEducation = () => {
    setModalSrc(null);
    saveGuideSnapshot({ section: "bateria", pageY: window.scrollY, frameY: 0 });
    void navigate({
      search: { guide: "education", section: "bateria" },
      replace: true,
      resetScroll: false,
    });
  };

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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-green-500 text-slate-950 font-black text-xs">
            PC
          </span>
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
          <Sparkles className="h-3 w-3" /> Pura Academy
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
          Guías visuales e interactivas de cada modelo EV: batería, carga, ADAS, mantenimiento y
          checklist de compra. Sin tecnicismos, sin venta.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <button
            type="button"
            data-ev-guide-opener
            onClick={openEducation}
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 text-slate-950 font-semibold px-6 py-3 text-sm hover:bg-emerald-300 transition"
          >
            <Car className="h-4 w-4" /> Guía de Vehículo EV{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              openModal(
                "/interactivos/cargador-tesla.html",
                "Guías de Cargadores EV — Tesla Supercharger",
              )
            }
            className="group inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-emerald-400/40 text-white font-medium px-6 py-3 text-sm hover:bg-white/15 transition"
          >
            <Plug className="h-4 w-4 text-emerald-300" /> Guías de Cargadores EV{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {(education || modalSrc) && (
          <EvGuideModal
            key={education ? "education" : modalSrc}
            src={education ? "/interactivos/tesla-model-3.html?context=education" : modalSrc!}
            title={
              education ? "Guía de Vehículo EV — Sistemas de un automóvil eléctrico" : modalTitle
            }
            education={education}
            section={section}
            onClose={closeModal}
            onSection={(next) => {
              void navigate({
                search: { guide: "education", section: next },
                replace: true,
                resetScroll: false,
              });
            }}
            onLab={() => {
              void navigate({
                to: "/laboratorio/motor-electrico",
                search: { from: "ev-guide" },
                state: (previous) => ({ ...previous, evGuideReturn: true }),
              });
            }}
          />
        )}

        {/* Feature bullets */}
        <div className="mt-14 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() =>
              openModal(
                "/interactivos/bateria-en-simple.html",
                "Batería en simple — Guía interactiva",
              )
            }
            className="group text-left rounded-2xl bg-white/[0.04] ring-1 ring-emerald-400/30 p-4 hover:ring-emerald-400/70 hover:bg-white/[0.07] transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl opacity-60 group-hover:opacity-100 transition" />
            <Battery className="h-5 w-5 text-emerald-300 relative" />
            <div className="mt-2 text-sm font-bold relative inline-flex items-center gap-1">
              Batería en simple
              <ArrowRight className="h-3.5 w-3.5 text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 relative">
              Guía interactiva · 11 secciones para entenderla.
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold relative">
              ▶ Abrir guía
            </div>
          </button>
          <button
            type="button"
            onClick={() =>
              openModal("/interactivos/carga-ac-dc.html", "Carga AC y DC — Guía interactiva")
            }
            className="group text-left rounded-2xl bg-white/[0.04] ring-1 ring-emerald-400/30 p-4 hover:ring-emerald-400/70 hover:bg-white/[0.07] transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl opacity-60 group-hover:opacity-100 transition" />
            <Zap className="h-5 w-5 text-emerald-300 relative" />
            <div className="mt-2 text-sm font-bold relative inline-flex items-center gap-1">
              Carga AC y DC
              <ArrowRight className="h-3.5 w-3.5 text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 relative">
              Guía interactiva · 15 secciones sobre carga.
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold relative">
              ▶ Abrir guía
            </div>
          </button>
          <button
            type="button"
            onClick={() =>
              openModal(
                "/interactivos/antes-de-comprar.html",
                "Antes de comprar — Guía interactiva",
              )
            }
            className="group text-left rounded-2xl bg-white/[0.04] ring-1 ring-emerald-400/30 p-4 hover:ring-emerald-400/70 hover:bg-white/[0.07] transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl opacity-60 group-hover:opacity-100 transition" />
            <ShieldCheck className="h-5 w-5 text-emerald-300 relative" />
            <div className="mt-2 text-sm font-bold relative inline-flex items-center gap-1">
              Antes de comprar
              <ArrowRight className="h-3.5 w-3.5 text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 relative">
              Guía interactiva · EV vs gasolina, costos y checklist.
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold relative">
              ▶ Abrir guía
            </div>
          </button>
        </div>
      </header>

      {/* Guides preview */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">Guías disponibles</h2>
          <Link
            to="/guias"
            className="text-sm text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
          >
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
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">
                      {g.brand} · {g.type}
                    </div>
                    <div className="mt-1 text-2xl font-black">{g.model}</div>
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {g.shortDescription}
                    </p>

                    {/* Trabajos interactivos */}
                    {(() => {
                      const interactives: Record<string, { src: string; title: string }> = {
                        "byd-yuan-up": {
                          src: "/interactivos/byd-yuan-up.html",
                          title: "Modelo interactivo — BYD Yuan UP",
                        },
                        "tesla-model-y": {
                          src: "/interactivos/tesla-model-y.html",
                          title: "Modelo interactivo — Tesla Model Y",
                        },
                        "volvo-ex30": {
                          src: "/interactivos/volvo-ex30.html",
                          title: "Modelo interactivo — Volvo EX30",
                        },
                        "byd-dolphin-mini": {
                          src: "/interactivos/byd-dolphin-mini.html",
                          title: "Modelo interactivo — BYD Dolphin Mini",
                        },
                        "zeekr-x": {
                          src: "/interactivos/zeekr-x.html",
                          title: "Modelo interactivo — Zeekr X",
                        },
                        "tesla-model-3": {
                          src: "/interactivos/tesla-model-3.html",
                          title: "Modelo interactivo — Tesla Model 3",
                        },
                      };
                      const cfg = interactives[g.slug];
                      return cfg ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal(cfg.src, cfg.title);
                          }}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold px-3 py-2.5 text-xs uppercase tracking-wider hover:bg-emerald-300 transition"
                        >
                          ▶ Abrir modelo interactivo
                        </button>
                      ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-emerald-400/30 bg-white/[0.02] px-3 py-3 text-[11px] uppercase tracking-wider text-emerald-300/70">
                          Trabajos interactivos · próximamente
                        </div>
                      );
                    })()}

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
        Pura Academy by Pura Corriente · Hecho para entender, no para vender.
      </footer>
    </div>
  );
}
