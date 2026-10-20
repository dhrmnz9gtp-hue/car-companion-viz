import { useId, useState } from "react";

export function ParameterControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const invalid =
    draft !== null &&
    (draft.trim() === "" ||
      !Number.isFinite(Number(draft)) ||
      Number(draft) < min ||
      Number(draft) > max);
  const display = Number(value.toFixed(6));
  return (
    <div className="lab-sim-parameter">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step="any"
        value={draft ?? display}
        aria-invalid={invalid}
        aria-describedby={`${id}-help`}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          const next = Number(text);
          if (text.trim() && Number.isFinite(next) && next >= min && next <= max) onChange(next);
        }}
        onBlur={() => setDraft(null)}
      />
      <input
        type="range"
        aria-label={`Ajustar ${label}`}
        min={min}
        max={max}
        step={step}
        value={display}
        onChange={(e) => {
          setDraft(null);
          onChange(Number(e.target.value));
        }}
      />
      <small id={`${id}-help`} className={invalid ? "lab-sim-error" : ""}>
        {invalid
          ? `Introduce un valor entre ${min} y ${max}. Se conserva el último cálculo válido.`
          : `${min}–${max} · rango ilustrativo`}
      </small>
    </div>
  );
}
