import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f0e8",
          color: "#173a5e",
        }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "12px solid #173a5e",
            borderRadius: "50%",
            fontFamily: "Georgia",
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: "-10px",
          }}
        >
          CP
        </div>
      </div>
    ),
    size,
  );
}
