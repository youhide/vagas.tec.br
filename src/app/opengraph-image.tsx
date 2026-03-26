import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "vagas.tec.br - Quadro de Vagas de Tecnologia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 192 192" fill="none">
              <path d="M56 52 L96 96 L56 140" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <path d="M136 52 L96 96 L136 140" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <line x1="80" y1="150" x2="112" y2="150" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: "bold",
              color: "white",
            }}
          >
            vagas.tec.br
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 16,
          }}
        >
          Quadro de Vagas de Tecnologia
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            display: "flex",
            gap: 16,
          }}
        >
          <span>🔧 DevOps</span>
          <span>•</span>
          <span>⚙️ Backend</span>
          <span>•</span>
          <span>� Frontend</span>
          <span>•</span>
          <span>�🇧🇷 Brasil</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
