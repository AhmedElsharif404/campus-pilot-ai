from dataclasses import dataclass


@dataclass(frozen=True)
class PlanningSummary:
    planned_sessions: int
    completed_sessions: int
    focused_minutes: int

    @property
    def completion_rate(self) -> float:
        return self.completed_sessions / self.planned_sessions if self.planned_sessions else 0.0
