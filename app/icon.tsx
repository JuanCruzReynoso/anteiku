import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          borderRadius: 6,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="#b91c1c" strokeWidth="4" fill="white" />
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontSize="40"
            fontWeight="bold"
            fill="#b91c1c"
            fontFamily="sans-serif"
          >
            A
          </text>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
