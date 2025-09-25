import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// function serializeBigInt(obj: any): any {
//   return JSON.parse(JSON.stringify(obj, (key, value) =>
//     typeof value === 'bigint' ? value.toString() : value
//   ));
// }
export async function POST(request: Request) {
  const data = await request.json();
  // if (data.id_cita) data.id_cita = BigInt(data.id_cita);
  // if (data.id_contacto) data.id_contacto = BigInt(data.id_contacto);
    
  
  // data debe tener: contactoId, fecha, hora, notas
  const cita = await prisma.cita.create({
    data: {
      id_contacto: data.id_contacto,
      fecha_programada: data.fechaHora,
      notas: data.notas,
      tipo: 'visita', // Por defecto, puedes ajustar esto según tus necesidades
    },
  });
  const serializedCita = cita;
  return NextResponse.json(serializedCita);
}

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
