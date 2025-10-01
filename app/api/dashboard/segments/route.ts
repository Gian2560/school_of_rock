import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type SegmentItem = { name: "C1" | "C2" | "C3"; count: number; percentage: number };

const TARGETS = ["C1", "C2", "C3"] as const;
type Target = typeof TARGETS[number];

// normaliza valores de BD a C1/C2/C3 (p. ej. "c-1", " c 1 ")
function normalize(seg?: string | null): Target | null {
  if (!seg) return null;
  const s = seg.toUpperCase().replace(/[^A-Z0-9]/g, ""); // quita espacios/guiones
  if (s === "C1") return "C1";
  if (s === "C2") return "C2";
  if (s === "C3") return "C3";
  return null;
}

export async function GET() {
  try {
    // Trae todos los segmentos no nulos
    const raw = await prisma.contacto.groupBy({
      by: ["segmento"],
      where: { segmento: { not: null } },
      _count: { _all: true },
    });

    // Consolida SOLO C1/C2/C3
    const bucket = new Map<Target, number>([["C1", 0], ["C2", 0], ["C3", 0]]);
    for (const r of raw) {
      const key = normalize(r.segmento);
      if (key) bucket.set(key, (bucket.get(key) ?? 0) + r._count._all);
    }

    const total = Array.from(bucket.values()).reduce((a, b) => a + b, 0);

    const segments: SegmentItem[] = (["C1", "C2", "C3"] as Target[]).map((name) => {
      const count = bucket.get(name) ?? 0;
      return {
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return NextResponse.json(
      { total, segments },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Segments API error:", err);
    return NextResponse.json(
      { error: "No se pudo obtener la segmentación" },
      { status: 500 }
    );
  }
}
