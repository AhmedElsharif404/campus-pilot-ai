import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CampusPilot AI — your syllabus, put to work";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f0e8",
          color: "#142235",
          padding: "70px 78px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: "Georgia",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              border: "2px solid #173a5e",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Arial",
              fontSize: 16,
            }}
          >
            CP
          </div>
          CampusPilot AI
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}
        >
          <div
            style={{
              color: "#235b87",
              fontFamily: "Arial",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Academic planning, with receipts
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: "Georgia",
              fontSize: 78,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            Your syllabus already knows the semester. Put it to work.
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #b9b0a1",
            paddingTop: 20,
            color: "#56616d",
            fontFamily: "Arial",
            fontSize: 20,
          }}
        >
          Grounded extraction · Human confirmation · Realistic study plans
        </div>
      </div>
    ),
    size,
  );
}
