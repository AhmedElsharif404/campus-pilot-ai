import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayAgenda } from "./today-agenda";

describe("TodayAgenda", () => {
  it("marks a study session complete and allows undo", () => {
    render(
      <TodayAgenda
        initialItems={[
          {
            id: "one",
            time: "10:00",
            duration: "45m",
            title: "Study chapter",
            course: "Biology",
            courseCode: "BIO 101",
            kind: "study",
          },
        ]}
      />,
    );
    const button = screen.getByRole("button", { name: "Complete" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Undo" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText("Study session marked complete."),
    ).toBeInTheDocument();
  });
});
