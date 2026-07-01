import { ImageResponse } from "next/og";
import { getJobById } from "@/lib/cache";

export const alt = "Vaga de tecnologia - vagas.tec.br";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  const title = job?.title ?? "Vaga de tecnologia";
  const categoryName = job?.category.name ?? "";
  const categoryEmoji = job?.category.emoji ?? "🚀";
  const accentColor = job?.category.color ?? "#3b82f6";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(135deg, #18181b 0%, #27272a 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              background: accentColor,
            }}
          />
          <span>{categoryEmoji}</span>
          <span>{categoryName}</span>
        </div>

        <div
          style={{
            fontSize: title.length > 80 ? 44 : 56,
            fontWeight: "bold",
            color: "white",
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span style={{ fontWeight: "bold", color: "white" }}>
            vagas.tec.br
          </span>
          <span>Quadro de Vagas de Tecnologia 🇧🇷</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
