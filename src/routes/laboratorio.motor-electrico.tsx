import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Lab } from "@/features/ev-lab/Lab";
import { modelLibrary } from "@/features/ev-lab/library";
import { labOriginSearch } from "@/lib/ev-guide-context";
import { PmsmDiagram } from "@/features/ev-lab/models/PmsmDiagram";

export const Route = createFileRoute("/laboratorio/motor-electrico")({
  component: MotorLab,
  validateSearch: labOriginSearch,
  head: () => ({
    meta: [
      { title: "Motor eléctrico PMSM · EV Interactive Lab | Pura Academy by Pura Corriente" },
      {
        name: "description",
        content:
          "Explora un motor eléctrico didáctico en 3D. Descubre sus componentes y cómo la electricidad se convierte en movimiento.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function MotorLab() {
  const search = Route.useSearch();
  const router = useRouter();
  const returnToGuide = () => {
    if (window.history.state?.evGuideReturn && router.history.canGoBack()) router.history.back();
    else
      void router.navigate({
        to: "/",
        search: { guide: "education", section: "motor" },
        replace: true,
      });
  };
  return (
    <>
      {search.from === "ev-guide" && (
        <nav
          aria-label="Regreso a la guía educativa"
          className="bg-slate-950 text-emerald-300 px-5 py-3 text-sm border-b border-emerald-400/20"
        >
          <button
            type="button"
            onClick={returnToGuide}
            className="rounded-full px-4 py-2 ring-1 ring-emerald-400/40 hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2"
          >
            ← Regresar a Motor · Guía de Vehículo EV
          </button>
        </nav>
      )}
      <Lab model={modelLibrary["motor-pmsm-generico"]} Diagram={PmsmDiagram} />
    </>
  );
}
