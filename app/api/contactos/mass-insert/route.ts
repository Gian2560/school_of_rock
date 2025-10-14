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

// POST: Insertar contactos masivamente
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contactos, campanhaId } = body

    if (!contactos || !Array.isArray(contactos)) {
      return NextResponse.json(
        { error: "Se requiere un array de contactos" },
        { status: 400 }
      )
    }

    console.log(`📥 Insertando ${contactos.length} contactos...`)

    // Filtrar solo los contactos válidos (incluye los que ya existen en BD)
    const contactosValidos = contactos.filter((c: any) => c.valid && !c.exists)

    if (contactosValidos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay contactos válidos para procesar",
        insertados: 0,
        asociados: 0,
        omitidos: contactos.length
      })
    }

    // Si hay campaña, verificar qué contactos ya están en esa campaña específica
    let contactosYaEnCampana = new Set()
    if (campanhaId) {
      const telefonosValidos = contactosValidos
        .map(c => c.telefono ? c.telefono.toString().replace(/\D/g, '') : null)
        .filter(t => t)

      if (telefonosValidos.length > 0) {
        const contactosEnCampana = await prisma.$queryRaw`
          SELECT c.telefono 
          FROM contacto c
          INNER JOIN cliente_campanha cc ON c.id_contacto = cc.id_contacto
          WHERE cc.id_campanha = ${parseInt(campanhaId)}
          AND c.telefono = ANY(${telefonosValidos})
        ` as any[]

        contactosYaEnCampana = new Set(contactosEnCampana.map(c => c.telefono))
      }
    }

    let insertados = 0
    let asociados = 0
    let errores: any[] = []

    // Procesar contactos uno por uno para manejar errores individuales
    for (const contacto of contactosValidos) {
      try {
        // Limpiar y normalizar datos
        const telefonoLimpio = contacto.telefono ? contacto.telefono.toString().replace(/\D/g, '') : null
        const correoLimpio = contacto.correo ? contacto.correo.toString().toLowerCase().trim() : null

        let contactoId = null

        // Verificar si ya está en esta campaña específica
        if (campanhaId && telefonoLimpio && contactosYaEnCampana.has(telefonoLimpio)) {
          console.log(`⚠️ Contacto ${contacto.nombres} ya está en la campaña ${campanhaId}`)
          continue
        }

        // Si el contacto ya existe en la BD, obtener su ID
        if (contacto.existsInDB && telefonoLimpio) {
          const contactoExistente = await prisma.$queryRaw`
            SELECT id_contacto FROM contacto WHERE telefono = ${telefonoLimpio} LIMIT 1
          ` as any[]

          if (contactoExistente.length > 0) {
            contactoId = contactoExistente[0].id_contacto
            console.log(`📋 Usando contacto existente ID: ${contactoId}`)
          }
        }

        // Si no existe, crearlo
        if (!contactoId) {
          const nuevoContacto = await prisma.$queryRaw`
            INSERT INTO contacto (
              nombres, apellidos, telefono, correo, distrito, 
              segmento, estado, fecha_creacion
            ) VALUES (
              ${contacto.nombres?.trim() || ''},
              ${contacto.apellidos?.trim() || ''},
              ${telefonoLimpio},
              ${correoLimpio},
              ${contacto.distrito?.trim() || ''},
              ${contacto.segmento?.trim() || 'general'},
              ${contacto.estado || 'activo'},
              NOW()
            ) RETURNING id_contacto
          ` as any[]

          if (nuevoContacto && nuevoContacto.length > 0) {
            contactoId = nuevoContacto[0].id_contacto
            insertados++
            console.log(`✅ Nuevo contacto creado ID: ${contactoId}`)
          }
        }

        // Si hay campaña y tenemos un contactoId, crear la asociación
        if (campanhaId && contactoId) {
          try {
            await prisma.$queryRaw`
              INSERT INTO cliente_campanha (id_contacto, id_campanha, fecha_asociacion)
              VALUES (${contactoId}, ${parseInt(campanhaId)}, NOW())
            `
            asociados++
            console.log(`📋 Contacto ${contactoId} asociado con campaña ${campanhaId}`)
          } catch (assocError) {
            console.log(`⚠️ Error al asociar contacto ${contactoId} con campaña ${campanhaId}:`, assocError)
            // No fallar por error de asociación
          }
        }

      } catch (insertError) {
        console.error(`❌ Error al procesar contacto:`, insertError)
        errores.push({
          fila: contacto.fila,
          nombres: contacto.nombres,
          error: insertError instanceof Error ? insertError.message : String(insertError)
        })
      }
    }

    console.log(`✅ Insertados ${insertados} contactos nuevos, ${asociados} asociados a campaña de ${contactosValidos.length} procesados`)

    // Log successful campaign association
    if (campanhaId && asociados > 0) {
      console.log(`📋 ${asociados} contactos asociados con campaña ${campanhaId}`)
    }

    return NextResponse.json(serializeBigInt({
      success: true,
      message: `Se procesaron ${asociados} contactos exitosamente`,
      insertados,
      asociados,
      omitidos: contactos.length - contactosValidos.length,
      errores: errores.length > 0 ? errores : undefined,
      totalProcesados: contactos.length
    }))

  } catch (error) {
    console.error("❌ Error en inserción masiva:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}