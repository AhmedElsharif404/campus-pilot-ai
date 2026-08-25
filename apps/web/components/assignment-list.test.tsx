import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssignmentList } from "./assignment-list";

describe("AssignmentList", () => {
  it("shows a recoverable empty state for unmatched search", () => {
    render(<AssignmentList />);
    fireEvent.change(screen.getByPlaceholderText("Search assignments"), {
      target: { value: "nonexistent course" },
    });
    expect(
      screen.getByRole("heading", { name: "No assignments here." }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Cell membrane lab report")).toBeInTheDocument();
  });
});
