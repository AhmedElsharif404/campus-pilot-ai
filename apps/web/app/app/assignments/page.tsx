import { AssignmentList } from "@/components/assignment-list";

export const metadata = { title: "Assignments" };

export default function AssignmentsPage() {
  return (
    <div className="workspace-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Semester work</p>
          <h1>Assignments</h1>
          <p>
            Confirmed work across four courses, ordered by what needs attention
            rather than by which course shouts loudest.
          </p>
        </div>
        <button className="button">Add assignment</button>
      </header>
      <AssignmentList />
    </div>
  );
}
