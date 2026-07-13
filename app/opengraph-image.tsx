import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <circle cx="50" cy="50" r="48" stroke="#b91c1c" strokeWidth="4" fill="white" />
          <path d="M50 15 L35 75 L45 75 L50 55 L55 75 L65 75 Z" fill="#b91c1c" />
        </svg>
        <div
          style={{
            fontSize: 52,
            fontWeight: "bold",
            letterSpacing: "-0.03em",
          }}
        >
          Anteiku
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#a1a1aa",
            marginTop: 8,
          }}
        >
          Merchandise Geek & Café de Especialidad
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
