import { UploadPanel } from "@/components/upload-panel";

export const metadata = { title: "Import syllabus" };

export default function UploadPage() {
  return (
    <div className="workspace-page narrow-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Intake · Step 1 of 3</p>
          <h1>Bring in a syllabus.</h1>
          <p>
            CampusPilot will read the document, separate proposed academic
            details, and prepare a page-grounded review. Nothing is added to
            your semester yet.
          </p>
        </div>
      </header>
      <UploadPanel />
    </div>
  );
}
