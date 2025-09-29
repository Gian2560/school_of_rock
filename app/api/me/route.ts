import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ajusta la ruta si difiere

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Busca usuario por email y trae su rol y persona vinculada
  const user = await prisma.usuario.findUnique({
    where: { correo: session.user.email },
    select: {
      id_usuario: true,
      id_rol: true,
      persona: { select: { id_persona: true, nombres: true, apellidos: true } },
      rol: { select: { id_rol: true, nombre: true } },
    },
  });

  if (!user) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({
    ok: true,
    id_usuario: user.id_usuario,
    roleId: user.id_rol ?? null,
    roleName: user.rol?.nombre ?? null,
    personaId: user.persona?.id_persona ?? null,
    personaNombre: user.persona ? `${user.persona.nombres} ${user.persona.apellidos}` : null,
  });
}
