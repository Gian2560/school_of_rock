// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function GET() {
//   // Trae todas las citas con el contacto relacionado
//   const citas = await prisma.cita.findMany({
//     include: {
//       contacto: true,
//     },
//     orderBy: {
//       fecha_programada: 'asc',
//     },
//   });
//   const serializedCitas = citas;
//   return NextResponse.json(serializedCitas);
// }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const advisorId = req.nextUrl.searchParams.get("advisorId");
  const where = advisorId
    ? { accion_comercial: { some: { asesor_id: Number(advisorId) } } }
    : undefined;

  const citas = await prisma.cita.findMany({
    where,
    include: {
      contacto: true,
      accion_comercial: true, // por si quieres revisar el asesor en el cliente
    },
    orderBy: { fecha_programada: "asc" },
  });

  return NextResponse.json(citas);
}
