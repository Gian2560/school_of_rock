import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Función helper para serializar BigInt
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
};

// POST: Registrar acción comercial en una tarea
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_tarea, estado, nota, tipo_accion = 'llamada' } = body

    // Validaciones
    if (!id_tarea) {
      return NextResponse.json(
        { error: "id_tarea es requerido" },
        { status: 400 }
      )
    }

    if (!estado) {
      return NextResponse.json(
        { error: "estado es requerido" },
        { status: 400 }
      )
    }

    console.log("📝 Registrando acción comercial:", { id_tarea, estado, nota, tipo_accion})

    // Obtener usuario logueado y su id_persona
    // @ts-ignore
    const { getServerSession } = await import('next-auth/next');
    // @ts-ignore
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);
    
    let asesorId: number | null = null;
    
    if (session && (session.user as any)?.id) {
      const persona = await prisma.persona.findFirst({
        where: { id_usuario: Number((session.user as any).id) },
      });
      asesorId = persona?.id_persona ?? null;
    }
    
    if (!asesorId) {
      return NextResponse.json(
        { error: "No autorizado - debe iniciar sesión" },
        { status: 401 }
      )
    }

    console.log("✅ Usando asesor ID del usuario logueado:", asesorId)

    // 1) Traer tarea + id_contacto
    const tareaExiste = await prisma.$queryRaw<
      Array<{ id_tarea: number; id_contacto: number }>
    >`SELECT id_tarea, id_contacto FROM tarea WHERE id_tarea = ${id_tarea}`

    if (tareaExiste.length === 0) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }
    const { id_contacto } = tareaExiste[0]

    // Registrar la acción comercial
    const accionComercial = await prisma.$queryRaw`
      INSERT INTO accion_comercial (tipo_accion, id_tarea, id_contacto, asesor_id, estado, fecha_accion, nota)
      VALUES (${tipo_accion}, ${id_tarea}, ${id_contacto}, ${asesorId}, ${estado}, NOW(), ${nota || ''})
      RETURNING *
    ` as any[]

    console.log("✅ Acción comercial registrada:", accionComercial[0])

    return NextResponse.json(serializeBigInt({
      success: true,
      accion_comercial: accionComercial[0]
    }))

  } catch (error) {
    console.error("❌ Error al registrar acción comercial:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
