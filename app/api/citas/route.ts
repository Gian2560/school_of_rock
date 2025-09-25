import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// function serializeBigInt(obj: any): any {
//   return JSON.parse(JSON.stringify(obj, (key, value) =>
//     typeof value === 'bigint' ? value.toString() : value
//   ));
// }

export async function GET() {
  // Trae todas las citas con el contacto relacionado
  const citas = await prisma.cita.findMany({
    include: {
      contacto: true,
    },
    orderBy: {
      fecha_programada: 'asc',
    },
  });
  const serializedCitas = citas;
  return NextResponse.json(serializedCitas);
}
