import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Personas cuyo usuario tiene rol = 2 (asesora)
  const advisors = await prisma.persona.findMany({
    where: { usuario: { id_rol: 2 } },
    select: { id_persona: true, nombres: true, apellidos: true },
    orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
  });
  return NextResponse.json(advisors);
}
