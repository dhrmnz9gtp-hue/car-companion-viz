import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Battery,
  Zap,
  Plug,
  Gauge,
  ShieldCheck,
  Wrench,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Car,
  ArrowRight,
  Cpu,
  Activity,
  ClipboardList,
} from "lucide-react";
import { getGuideBySlug, vehicleGuides } from "@/data/vehicleGuides";

export const Route = createFileRoute("/guias/$slug")({
  component: GuidePage,
  loader: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.guide;
    const title = g
      ? `${g.brand} ${g.model} — Guía EV · PURA CORRIENTE`
      : "Guía EV · PURA CORRIENTE";
    const description = g?.shortDescription ?? "Guía interactiva de vehículos eléctricos por PURA CORRIENTE.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Guía no encontrada</h1>
        <p className="mt-2 text-slate-400">Esa guía aún no existe en EV Explainers.</p>
        <Link to="/guias" className="inline-flex mt-6 px-5 py-2.5 rounded-full bg-cyan-500 text-slate-900 font-semibold">
          Ver guías disponibles
        </Link>
      </div>
    </div>
  ),
});

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-2 text-cyan-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</span>
      </div>
      <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-white/5 py-3 last:border-0">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const accent = guide.accentColor ?? "oklch(0.65 0.2 220)";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Backdrop glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[600px] opacity-40"
        style={{
          background: `radial-gradient(60% 80% at 50% 0%, ${accent}, transparent 70%)`,
        }}
      />

      {/* Nav */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 font-black text-xs">PC</span>
          <span className="font-semibold tracking-tight">PURA CORRIENTE</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">EV Explainers</span>
        </Link>
        <Link
          to="/guias"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Todas las guías
        </Link>
      </div>

      {/* Hero */}
      <header className="relative z-10 mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center"
        >
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1"
              style={{ color: accent, borderColor: `color-mix(in oklab, ${accent} 50%, transparent)`, background: `color-mix(in oklab, ${accent} 12%, transparent)` }}
            >
              <Sparkles className="h-3 w-3" /> {guide.type} · {guide.market}
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              {guide.brand} <span className="text-slate-400">{guide.model}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
              {guide.shortDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#bateria" className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs hover:bg-white/10">Batería</a>
              <a href="#motor" className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs hover:bg-white/10">Motor</a>
              <a href="#carga" className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs hover:bg-white/10">Carga</a>
              <a href="#comprar" className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs hover:bg-white/10">Antes de comprar</a>
              <a href="#faqs" className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs hover:bg-white/10">FAQs</a>
            </div>
          </div>

          <Card className="relative overflow-hidden">
            <div
              className="absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-50"
              style={{ background: accent }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Car className="h-4 w-4" /> Ficha rápida
              </div>
              <div className="mt-3">
                <StatRow label="Tipo" value={guide.type} />
                <StatRow label="Batería" value={guide.battery.capacity} />
                <StatRow label="Química" value={guide.battery.chemistry} />
                <StatRow label="Motor" value={guide.drivetrain.motor} />
                <StatRow label="Tracción" value={guide.drivetrain.traction} />
                <StatRow label="Carga DC" value={guide.charging.dc} />
              </div>
            </div>
          </Card>
        </motion.div>
      </header>

      {/* Body */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 space-y-16">
        {/* Cómo funciona */}
        <Section id="como-funciona" icon={Cpu} eyebrow="Cómo funciona" title="Sistema eléctrico, en simple">
          <Card>
            <p className="text-slate-300 leading-relaxed">
              Un EV reemplaza el motor de combustión por uno o más motores eléctricos alimentados por una batería de alta tensión.
              Sin cambios, sin aceite y sin humos. La energía fluye de la batería al motor cuando aceleras, y del motor a la batería cuando frenas.
            </p>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {[
                { t: "Batería", d: "Almacena la energía." },
                { t: "Motor", d: "Convierte energía en movimiento." },
                { t: "Inversor", d: "Controla cuánta potencia entregar." },
              ].map((x) => (
                <div key={x.t} className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4">
                  <div className="text-sm font-bold text-white">{x.t}</div>
                  <div className="text-xs text-slate-400 mt-1">{x.d}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Batería */}
        <Section id="bateria" icon={Battery} eyebrow="Batería" title="El corazón del carro">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <StatRow label="Química" value={guide.battery.chemistry} />
              <StatRow label="Capacidad" value={guide.battery.capacity} />
              <div className="mt-3 text-sm text-slate-300 leading-relaxed">
                {guide.battery.safetyNotes}
              </div>
            </Card>
            <Card>
              <div className="text-sm font-semibold text-white mb-2">Cuidados clave</div>
              <ul className="space-y-2">
                {guide.battery.careTips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: accent }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* Motor */}
        <Section id="motor" icon={Zap} eyebrow="Motor y tracción" title="Cómo se mueve">
          <Card>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs uppercase text-slate-400">Motor</div>
                <div className="text-white font-medium mt-1">{guide.drivetrain.motor}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Tracción</div>
                <div className="text-white font-medium mt-1">{guide.drivetrain.traction}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Desempeño</div>
                <div className="text-white font-medium mt-1">{guide.drivetrain.performance}</div>
              </div>
            </div>
          </Card>
        </Section>

        {/* Carga */}
        <Section id="carga" icon={Plug} eyebrow="Carga AC / DC" title="Cómo y dónde se carga">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <div className="text-sm font-semibold text-white">En casa (AC)</div>
              <div className="mt-1 text-2xl font-black" style={{ color: accent }}>{guide.charging.ac}</div>
              <p className="mt-2 text-sm text-slate-300">{guide.charging.homeChargingAdvice}</p>
              <div className="mt-3 text-xs text-slate-500">Conector: {guide.charging.connector}</div>
            </Card>
            <Card>
              <div className="text-sm font-semibold text-white">Carga rápida (DC)</div>
              <div className="mt-1 text-2xl font-black" style={{ color: accent }}>{guide.charging.dc}</div>
              <p className="mt-2 text-sm text-slate-300">{guide.charging.publicChargingAdvice}</p>
            </Card>
          </div>
        </Section>

        {/* Regen */}
        <Section id="regen" icon={Activity} eyebrow="Frenado regenerativo" title="Energía que vuelve a la batería">
          <Card>
            <p className="text-slate-300 leading-relaxed">{guide.regen.explanation}</p>
            <div className="mt-4 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4 flex gap-3">
              <Sparkles className="h-5 w-5 shrink-0" style={{ color: accent }} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tip</div>
                <div className="text-sm text-white mt-0.5">{guide.regen.userTip}</div>
              </div>
            </div>
          </Card>
        </Section>

        {/* ADAS */}
        <Section id="adas" icon={ShieldCheck} eyebrow="ADAS y tecnología" title="Qué te ayuda al conducir">
          <Card>
            <ul className="grid sm:grid-cols-2 gap-2">
              {guide.adas.map((a) => (
                <li key={a} className="flex gap-2 text-sm text-slate-200 rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-3">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: accent }} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* Mantenimiento */}
        <Section id="mantenimiento" icon={Wrench} eyebrow="Mantenimiento" title="Mucho más simple que un carro a gasolina">
          <Card>
            <ul className="space-y-2">
              {guide.maintenance.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-slate-200">
                  <Gauge className="h-4 w-4 mt-0.5 shrink-0" style={{ color: accent }} />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* Antes de comprar */}
        <Section id="comprar" icon={ClipboardList} eyebrow="Antes de comprar" title="Checklist práctico">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <div className="text-sm font-semibold text-white mb-3">Qué revisar</div>
              <ul className="space-y-2">
                {guide.buyingChecklist.map((c) => (
                  <li key={c} className="flex gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: accent }} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Card>
            {guide.warnings.length > 0 && (
              <Card className="border border-amber-500/20 bg-amber-500/[0.04]">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" /> Ten en cuenta
                </div>
                <ul className="mt-3 space-y-2">
                  {guide.warnings.map((w) => (
                    <li key={w} className="text-sm text-amber-100/90">• {w}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </Section>

        {/* FAQs */}
        <Section id="faqs" icon={Sparkles} eyebrow="FAQs" title="Preguntas frecuentes">
          <div className="space-y-2">
            {guide.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <Card key={f.question} className="p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-white text-sm md:text-base">{f.question}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
                      <ChevronDown className="h-5 w-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                          {f.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* CTA */}
        <Section id="cta" icon={ArrowRight} eyebrow="Próximo paso" title={guide.cta.title}>
          <Card className="relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, ${accent}, transparent 70%)`,
              }}
            />
            <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
              <p className="text-slate-200 leading-relaxed">{guide.cta.text}</p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://klermobility.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-5 py-3 text-sm hover:bg-slate-100 transition"
                >
                  {guide.cta.buttonText} <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://puracorriente.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 text-white font-medium px-5 py-3 text-sm hover:bg-white/20 transition"
                >
                  Conocer PURA CORRIENTE
                </a>
              </div>
            </div>
          </Card>
        </Section>

        {/* Other guides */}
        <Section id="otras" icon={Car} eyebrow="Sigue explorando" title="Otras guías">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {vehicleGuides
              .filter((v) => v.slug !== guide.slug)
              .map((v) => (
                <Link
                  key={v.slug}
                  to="/guias/$slug"
                  params={{ slug: v.slug }}
                  className="group rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 hover:bg-white/[0.08] transition"
                >
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">{v.brand}</div>
                  <div className="text-white font-bold mt-0.5">{v.model}</div>
                  <div className="text-xs text-slate-400 mt-2 line-clamp-2">{v.shortDescription}</div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 group-hover:gap-2 transition-all">
                    Ver guía <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
          </div>
        </Section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        EV Explainers by PURA CORRIENTE · Guía educativa, no comercial.
      </footer>
    </div>
  );
}
