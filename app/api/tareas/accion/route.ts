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
    const { id_tarea, estado, nota, tipo_accion = 'llamada', asesor_id } = body

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

    console.log("📝 Registrando acción comercial:", { id_tarea, estado, nota, tipo_accion })

    // Verificar que la tarea existe
    const tareaExiste = await prisma.$queryRaw`
      SELECT id_tarea FROM tarea WHERE id_tarea = ${id_tarea}
    ` as any[]

    if (tareaExiste.length === 0) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    // Verificar qué personas (asesores) existen
    const personas = await prisma.$queryRaw`
      SELECT id_persona FROM persona LIMIT 1
    ` as any[]

    console.log("👤 Personas disponibles:", personas)

    let personaId = asesor_id
    
    if (!personaId && personas.length > 0) {
      personaId = personas[0].id_persona
      console.log("✅ Usando persona existente con ID:", personaId)
    } else if (!personaId) {
      // Crear un usuario y persona por defecto si no existe ninguno
      console.log("👤 Creando usuario y persona por defecto...")
      try {
        // Crear usuario por defecto
        const nuevoUsuario = await prisma.$queryRaw`
          INSERT INTO usuario (username, correo, password, activo)
          VALUES ('sistema', 'sistema@saya.com', 'sistema123', true)
          ON CONFLICT (correo) DO NOTHING
          RETURNING id_usuario
        ` as any[]

        let usuarioId
        if (nuevoUsuario.length > 0) {
          usuarioId = nuevoUsuario[0].id_usuario
        } else {
          // Si ya existe, obtener el ID
          const usuarioExistente = await prisma.$queryRaw`
            SELECT id_usuario FROM usuario WHERE correo = 'sistema@saya.com'
          ` as any[]
          usuarioId = usuarioExistente[0].id_usuario
        }

        // Crear persona asociada
        const nuevaPersona = await prisma.$queryRaw`
          INSERT INTO persona (id_usuario, nombres, apellidos)
          VALUES (${usuarioId}, 'Sistema', 'Automatizado')
          ON CONFLICT (id_usuario) DO NOTHING
          RETURNING id_persona
        ` as any[]

        if (nuevaPersona.length > 0) {
          personaId = nuevaPersona[0].id_persona
        } else {
          // Si ya existe, obtener el ID
          const personaExistente = await prisma.$queryRaw`
            SELECT id_persona FROM persona WHERE id_usuario = ${usuarioId}
          ` as any[]
          personaId = personaExistente[0].id_persona
        }

        console.log("✅ Persona por defecto creada/encontrada con ID:", personaId)
      } catch (createError) {
        console.error("❌ Error creando usuario/persona por defecto:", createError)
        return NextResponse.json(
          { error: "No se pudo crear el usuario por defecto" },
          { status: 500 }
        )
      }
    }

    console.log("✅ Usando persona ID:", personaId, "para registrar acción comercial...")

    // Registrar la acción comercial
    const accionComercial = await prisma.$queryRaw`
      INSERT INTO accion_comercial (tipo_accion, id_tarea, asesor_id, estado, fecha_accion, nota)
      VALUES (${tipo_accion}, ${id_tarea}, ${personaId}, ${estado}, NOW(), ${nota || ''})
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