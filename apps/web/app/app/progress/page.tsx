const weeks = [
  { label: "Week 1", planned: 8, completed: 6, hours: "4h 10m" },
  { label: "Week 2", planned: 10, completed: 8, hours: "5h 05m" },
  { label: "Week 3", planned: 9, completed: 9, hours: "6h 00m" },
  { label: "Week 4", planned: 11, completed: 7, hours: "5h 25m" },
];

export const metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <div className="workspace-page progress-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Reflection · First four weeks</p>
          <h1>Your plan is getting more honest.</h1>
          <p>
            Completion improved as sessions became shorter and started earlier.
            This is planning feedback—not a grade.
          </p>
        </div>
      </header>
      <section className="progress-hero">
        <div>
          <span className="progress-big">79%</span>
          <p>of planned sessions completed</p>
        </div>
        <blockquote>
          “Your strongest weeks use 35–55 minute sessions and leave Friday
          evening unplanned.”<cite>Pattern from 30 completed sessions</cite>
        </blockquote>
      </section>
      <section className="progress-section">
        <div className="content-heading">
          <div>
            <p className="eyebrow">Follow-through</p>
            <h2>Weekly sessions</h2>
          </div>
          <span>Completed / planned</span>
        </div>
        <div className="week-bars">
          {weeks.map((week) => (
            <article key={week.label}>
              <div>
                <strong>{week.label}</strong>
                <span>{week.hours} focused</span>
              </div>
              <div className="bar-track">
                <span
                  style={{ width: `${(week.completed / week.planned) * 100}%` }}
                />
                <i>
                  {week.completed} / {week.planned}
                </i>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="progress-section course-progress">
        <div className="content-heading">
          <div>
            <p className="eyebrow">By course</p>
            <h2>Where time went</h2>
          </div>
        </div>
        {[
          ["BIO 214", "Cell Biology", 8.4, 86],
          ["HIST 238", "Cities & Memory", 5.8, 76],
          ["STAT 201", "Applied Statistics", 4.6, 81],
          ["ENGL 170", "Writing the Natural World", 2.2, 68],
        ].map(([code, name, hours, value]) => (
          <div key={String(code)}>
            <span>
              <strong>{code}</strong>
              <small>{name}</small>
            </span>
            <span>{hours}h</span>
            <span className="progress-inline">
              <span style={{ width: `${value}%` }} />
            </span>
            <span>{value}% follow-through</span>
          </div>
        ))}
      </section>
    </div>
  );
}
