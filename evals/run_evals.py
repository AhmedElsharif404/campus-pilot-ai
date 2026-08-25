import asyncio
import json
from pathlib import Path

from campus_pilot.ai.provider import MockAIProvider


async def main() -> None:
    provider = MockAIProvider()
    results: list[dict[str, object]] = []
    for path in sorted(
        Path(__file__).parent.joinpath("synthetic-syllabi").glob("*.json")
    ):
        case = json.loads(path.read_text(encoding="utf-8"))
        fields = await provider.extract_document(case["document"])
        values = " ".join(field.extracted_value for field in fields).lower()
        expected = case["expected"]
        passed = len(fields) >= expected["minimum_grounded_fields"] and not any(
            term.lower() in values for term in expected["forbidden_hallucinations"]
        )
        results.append(
            {
                "id": case["id"],
                "passed": passed,
                "field_count": len(fields),
                "grounding_rate": sum(
                    bool(field.source_text_reference) for field in fields
                )
                / len(fields)
                if fields
                else 0,
            }
        )
    print(json.dumps(results, indent=2))
    if not all(result["passed"] for result in results):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
