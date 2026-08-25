import { StudyPlanner } from "@/components/study-planner";

export const metadata = { title: "Study plan" };

export default function StudyPlanPage() {
  return (
    <div className="workspace-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Plan · Week 4</p>
          <h1>A realistic week, not an ideal one.</h1>
          <p>
            Suggested sessions fit around your confirmed schedule, deadlines,
            course priorities, and the study windows you said are genuinely
            available.
          </p>
        </div>
      </header>
      <StudyPlanner />
    </div>
  );
}
