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

// POST: Agendar cita desde una tarea
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_tarea, fechaHora, notas } = body

    // Validaciones
    if (!id_tarea) {
      return NextResponse.json(
        { error: "id_tarea es requerido" },
        { status: 400 }
      )
    }

    if (!fechaHora) {
      return NextResponse.json(
        { error: "fechaHora es requerida" },
        { status: 400 }
      )
    }

    console.log("📅 Agendando cita desde tarea:", { id_tarea, fechaHora, notas })

    // Obtener datos de la tarea y el contacto
    const tareaConContacto = await prisma.$queryRaw`
      SELECT t.id_tarea, t.id_contacto, c.nombres, c.apellidos
      FROM tarea t
      INNER JOIN contacto c ON t.id_contacto = c.id_contacto
      WHERE t.id_tarea = ${id_tarea}
    ` as any[]

    if (tareaConContacto.length === 0) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    const tarea = tareaConContacto[0]

    // Crear la cita
    const cita = await prisma.$queryRaw`
      INSERT INTO cita (id_contacto, tipo, fecha_programada, estado, notas, fecha_creacion)
      VALUES (${tarea.id_contacto}, 'Visita comercial', ${fechaHora}::timestamptz, 'agendada', ${notas || ''}, NOW())
      RETURNING *
    ` as any[]

    // Registrar acción comercial asociada
    await prisma.$queryRaw`
      INSERT INTO accion_comercial (tipo_accion, id_tarea, id_cita, id_contacto,asesor_id, estado, fecha_accion, nota)
      VALUES ('visita', ${id_tarea}, ${cita[0].id_cita}, ${tarea.id_contacto}, 1, 'Visita agendada', NOW(), ${`Cita agendada para ${fechaHora}. ${notas || ''}`})
    `

    console.log("✅ Cita agendada desde tarea:", cita[0])

    return NextResponse.json(serializeBigInt({
      success: true,
      cita: cita[0],
      message: `Cita agendada para ${tarea.nombres} ${tarea.apellidos}`
    }))

  } catch (error) {
    console.error("❌ Error al agendar cita:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}