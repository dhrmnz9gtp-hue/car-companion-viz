const lessons = [
  [
    "Torque, rpm y potencia: ¿qué cambia?",
    "El torque es la capacidad de producir un giro y se mide en newton metro (Nm). Las rpm cuentan las vueltas por minuto. La potencia mecánica indica la rapidez con la que el eje entrega trabajo: al duplicar el torque a la misma velocidad, o la velocidad al mismo torque, se duplica la potencia. Aquí eliges un punto estable: no calculamos aceleración ni dinámica del vehículo.",
  ],
  [
    "Entrada eléctrica, eficiencia y pérdidas",
    "La potencia eléctrica estimada es la entrada al motor necesaria para entregar la potencia del eje con la eficiencia elegida. Por ejemplo, 90% significa que por cada 100 W de entrada se obtienen 90 W mecánicos y se estiman 10 W de pérdidas. En motores reales intervienen pérdidas en el cobre, el hierro, los rodamientos y otras. Aquí solo calculamos su suma a partir de una eficiencia supuesta; no resolvemos sus causas. No añadimos pérdidas de batería, inversor o transmisión.",
  ],
  [
    "Un ejemplo que puedes comprobar",
    "Con 3000 rpm, 150 Nm y 90%: ω = 2π × 3000 / 60 = 314.1593 rad/s. Pm = 150 × 314.1593 = 47123.89 W ≈ 47.12 kW ≈ 63.19 hp. Pe = 47123.89 / 0.90 ≈ 52.36 kW. Pérdidas = 52.36 − 47.12 ≈ 5.24 kW. Se conserva toda la precisión al calcular; solo se redondea para mostrar.",
  ],
  [
    "kW, hp y kWh: potencia frente a energía",
    "El kilowatt (kW) y el horsepower mecánico (hp) miden potencia: 1 hp ≈ 0.7457 kW y 1 kW ≈ 1.3410 hp. Así, 100 kW ≈ 134.1 hp. El hp usado aquí no es el caballo métrico CV/PS. El kilowatt-hora (kWh) mide energía: potencia multiplicada por tiempo. 100 kW constantes durante 0.5 horas son 50 kWh. No existe conversión directa de hp a kWh sin especificar una duración.",
  ],
  [
    "Qué ocurre si la velocidad o el torque son cero",
    "Las ecuaciones dan potencia mecánica, eléctrica y pérdidas nulas si la velocidad o el torque son cero. Es una limitación de esta aproximación con eficiencia constante: un motor real puede consumir electricidad y calentarse incluso detenido o sin carga. La eficiencia seleccionada sigue siendo un supuesto, no una eficiencia medida como 0/0.",
  ],
];

export function SimulationLessons() {
  return (
    <section className="lab-lessons" aria-label="Explicaciones de la simulación">
      <span className="lab-small-label">LEE EL MOTOR EN NÚMEROS</span>
      <div className="lab-speed-formula">
        <strong>Relaciones de un punto de operación</strong>
        <code>ω = 2π · rpm / 60</code>
        <code>Pm = T · ω ··· Pe = Pm / η</code>
        <code>Pérdidas = Pe − Pm</code>
        <p>Unidades internas: rad/s, Nm y W; η entre 0 y 1, sin incluir cero.</p>
      </div>
      <div className="lab-operation-lessons">
        {lessons.map(([title, text]) => (
          <details key={title}>
            <summary>{title}</summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
      <details className="lab-operation-limits">
        <summary>Supuestos y límites del modelo</summary>
        <p>
          Solo funcionamiento motor: velocidad y torque no negativos. No hay regeneración,
          transitorios, cálculo electromagnético, mapa de eficiencia ni curva de torque máximo. Los
          valores elegidos no garantizan un punto realizable.
        </p>
        <p>
          Los motores reales están limitados por corriente, tensión, temperatura y velocidad. Este
          recurso no calcula esos límites. La animación reutiliza el conjunto giratorio y sus
          pivotes; su escala temporal solo facilita observarlo.
        </p>
        <p>
          Al cambiar de modo se conservan los dos escenarios, la exploración y la posición angular,
          y se pausa el giro. Restablecer vista recupera el ensamblaje y la cámara sin borrar
          escenarios. Restablecer escenarios recupera ambos puntos iniciales y reinicia el giro. El
          esquema 2D conserva los cálculos y muestra las piezas estáticas.
        </p>
        <p>
          <a
            href="https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStax: potencia de rotación ↗
          </a>
        </p>
        <p>
          <a
            href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8"
            target="_blank"
            rel="noopener noreferrer"
          >
            NIST: equivalencias de hp y kWh ↗
          </a>
        </p>
      </details>
    </section>
  );
}
