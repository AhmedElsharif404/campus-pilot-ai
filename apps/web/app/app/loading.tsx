export default function WorkspaceLoading() {
  return (
    <div
      className="workspace-page"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="skeleton skeleton-label" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton skeleton-rule" />
      {[1, 2, 3, 4].map((item) => (
        <div className="skeleton skeleton-row" key={item} />
      ))}
    </div>
  );
}
