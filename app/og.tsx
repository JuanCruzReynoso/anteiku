import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #f0f0f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f0f0f0 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#b91c1c"
              strokeWidth="4"
              fill="white"
            />
            <text
              x="50"
              y="65"
              textAnchor="middle"
              fontSize="48"
              fontWeight="bold"
              fill="#b91c1c"
              fontFamily="sans-serif"
            >
              A
            </text>
          </svg>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: "#0a0a0a",
                letterSpacing: -2,
                fontFamily: "sans-serif",
              }}
            >
              ANTEIKU
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#666",
                fontFamily: "sans-serif",
              }}
            >
              Merchandise Geek & Café de Especialidad
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
