import { createFileRoute } from "@tanstack/react-router";
import { Lab } from "@/features/ev-lab/Lab";
import { modelLibrary } from "@/features/ev-lab/library";
import { PmsmDiagram } from "@/features/ev-lab/models/PmsmDiagram";

export const Route = createFileRoute("/laboratorio/motor-electrico")({
  component: MotorLab,
  head: () => ({
    meta: [
      { title: "Motor eléctrico PMSM · EV Interactive Lab | PURA CORRIENTE" },
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
  return <Lab model={modelLibrary["motor-pmsm-generico"]} Diagram={PmsmDiagram} />;
}
