import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// function serializeBigInt(obj: any): any {
//   return JSON.parse(JSON.stringify(obj, (key, value) =>
//     typeof value === 'bigint' ? value.toString() : value
//   ));
// }
export async function POST(request: Request) {
  const data = await request.json();
  // data debe tener: id_contacto, fechaHora, notas
  // 1. Crear la cita
  const cita = await prisma.cita.create({
    data: {
      id_contacto: data.id_contacto,
      fecha_programada: data.fechaHora,
      notas: data.notas,
      tipo: 'visita',
    },
  });

  // 2. Obtener usuario logeado y su id_persona
  // Usando NextAuth
  // @ts-ignore
  const { getServerSession } = await import('next-auth/next');
  // @ts-ignore
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);
  let asesor_id = null;
  const idUsuario = (session?.user as any)?.id;
  if (idUsuario) {
    // Buscar persona por id_usuario
    const persona = await prisma.persona.findFirst({
      where: { id_usuario: Number(idUsuario) },
    });
    asesor_id = persona?.id_persona ?? null;
  }

  // 3. Crear accion_comercial si tenemos asesor_id
  if (asesor_id) {
    await prisma.accion_comercial.create({
      data: {
        tipo_accion: 'contacto',
        id_contacto: data.id_contacto,
        id_lead: null,
        id_cita: cita.id_cita,
        asesor_id,
        estado: 'Visita agendada',
        nota: data.notas ?? '',
      },
    });
  }

  return NextResponse.json(cita);
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
