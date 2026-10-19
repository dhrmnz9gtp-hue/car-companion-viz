import type { SynchronousLesson } from "../model";

export function OperationLessons({ lesson }: { lesson: SynchronousLesson }) {
  return (
    <section className="lab-lessons" aria-label="Explicaciones del funcionamiento">
      <span className="lab-small-label">ENTIENDE EL FUNCIONAMIENTO</span>
      <div className="lab-operation-lessons">
        {lesson.lessons.map((item) => (
          <details key={item.title}>
            <summary>{item.title}</summary>
            <p>{item.text}</p>
          </details>
        ))}
      </div>
      <details className="lab-operation-limits">
        <summary>Qué representa y qué omite</summary>
        <ul>
          {lesson.limitations.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
