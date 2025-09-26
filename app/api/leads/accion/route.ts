import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const data = await request.json();
  // Obtener usuario logeado y su id_persona
  // @ts-ignore
  const { getServerSession } = await import('next-auth/next');
  // @ts-ignore
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);
  let asesor_id = null;
  if (session && (session.user as any)?.id) {
    const persona = await prisma.persona.findFirst({
      where: { id_usuario: Number((session.user as any).id) },
    });
    asesor_id = persona?.id_persona ?? null;
  }
  if (!asesor_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  // Crear accion comercial
  const accion = await prisma.accion_comercial.create({
    data: {
      tipo_accion: 'lead',
      id_contacto: null,
      id_lead: data.id_lead,
      id_cita: null,
      asesor_id,
      estado: data.estado,
      nota: data.nota ?? '',
    },
  });
  return NextResponse.json(accion);
}
