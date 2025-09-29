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

    // Filtrar solo los contactos válidos que no existen
    const contactosParaInsertar = contactos.filter((c: any) => c.valid && !c.exists)

    if (contactosParaInsertar.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay contactos válidos para insertar",
        insertados: 0,
        omitidos: contactos.length
      })
    }

    let insertados = 0
    let errores: any[] = []

    // Insertar contactos uno por uno para manejar errores individuales
    for (const contacto of contactosParaInsertar) {
      try {
        // Limpiar y normalizar datos
        const telefonoLimpio = contacto.telefono ? contacto.telefono.toString().replace(/\D/g, '') : null
        const correoLimpio = contacto.correo ? contacto.correo.toString().toLowerCase().trim() : null

        // Insertar contacto
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
          const contactoId = nuevoContacto[0].id_contacto

          // Si hay campaña, crear la asociación
          if (campanhaId) {
            try {
              await prisma.$queryRaw`
                INSERT INTO cliente_campanha (id_contacto, id_campanha, fecha_asociacion)
                VALUES (${contactoId}, ${parseInt(campanhaId)}, NOW())
              `
            } catch (assocError) {
              console.log(`⚠️ Error al asociar contacto ${contactoId} con campaña ${campanhaId}:`, assocError)
              // No fallar la inserción del contacto por error de asociación
            }
          }

          insertados++
        }

      } catch (insertError) {
        console.error(`❌ Error al insertar contacto:`, insertError)
        errores.push({
          fila: contacto.fila,
          nombres: contacto.nombres,
          error: insertError instanceof Error ? insertError.message : String(insertError)
        })
      }
    }

    console.log(`✅ Insertados ${insertados} contactos de ${contactosParaInsertar.length}`)

    // Log successful campaign association
    if (campanhaId && insertados > 0) {
      console.log(`📋 ${insertados} contactos asociados con campaña ${campanhaId}`)
    }

    return NextResponse.json(serializeBigInt({
      success: true,
      message: `Se insertaron ${insertados} contactos exitosamente`,
      insertados,
      omitidos: contactos.length - contactosParaInsertar.length,
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