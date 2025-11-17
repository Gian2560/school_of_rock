import { NextResponse } from "next/server"
import * as XLSX from 'xlsx'

// GET: Descargar plantilla Excel para contactos
export async function GET() {
  try {
    console.log("📥 Generando plantilla Excel para contactos...")

    // Generar archivo Excel usando xlsx

    // Datos de ejemplo para la plantilla
    const datosEjemplo = [
      {
        nombres: "Juan Carlos",
        apellidos: "Pérez García",
        telefono: "999123456",
        correo: "juan.perez@email.com",
        distrito: "Miraflores"
        //segmento: "premium"
      },
      {
        nombres: "María Elena",
        apellidos: "Rodríguez López",
        telefono: "987654321",
        correo: "maria.rodriguez@email.com",
        distrito: "San Isidro"
        //segmento: "standard"
      },
      {
        nombres: "Carlos Alberto",
        apellidos: "Mendoza Silva",
        telefono: "956789123",
        correo: "carlos.mendoza@email.com",
        distrito: "Surco"
        //segmento: "basic"
      }
    ]

    // Crear workbook
    const workbook = XLSX.utils.book_new()

    // Crear hoja con datos de ejemplo
    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo)

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // nombres
      { wch: 20 }, // apellidos
      { wch: 12 }, // telefono
      { wch: 25 }, // correo
      { wch: 15 }, // distrito
      //{ wch: 12 }  // segmento
    ]
    worksheet['!cols'] = columnWidths

    // Añadir hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contactos")

    // Crear hoja de instrucciones
    const instrucciones = [
      {
        "INSTRUCCIONES PARA CARGAR CONTACTOS": "Siga estas reglas para un correcto procesamiento:"
      },
      {},
      {
        "CAMPOS OBLIGATORIOS": "Estos campos son requeridos:"
      },
      {
        "• nombres": "Nombre(s) del contacto - OBLIGATORIO"
      },
      {
        "• telefono": "Teléfono celular - OBLIGATORIO (mínimo 9 dígitos)"
      },
      {},
      {
        "CAMPOS OPCIONALES": "Estos campos son recomendados:"
      },
      {
        "• apellidos": "Apellidos del contacto"
      },
      {
        "• correo": "Email del contacto (formato válido)"
      },
      {
        "• distrito": "Distrito de residencia"
      },
      // {
      //   "• segmento": "Categoría del contacto (premium, standard, basic, etc.)"
      // },
      {},
      {
        "NOTAS IMPORTANTES": ""
      },
      {
        "• No modifique los nombres de las columnas": ""
      },
      {
        "• Los contactos duplicados serán omitidos automáticamente": ""
      },
      {
        "• Se detectan duplicados por teléfono y email": ""
      },
      {
        "• El formato debe ser .xlsx o .xls": ""
      },
      {
        "• Elimine esta hoja antes de cargar el archivo": ""
      },
      {},
      {
        "VARIACIONES ACEPTADAS": "Puede usar estos nombres alternativos:"
      },
      {
        "nombres": "nombre, name, first_name"
      },
      {
        "apellidos": "apellido, last_name, surname"
      },
      {
        "telefono": "celular, phone, movil"
      },
      {
        "correo": "email, mail, e-mail"
      },
      {
        "distrito": "district, ubicacion, location"
      }
      // {
      //   "segmento": "segment, categoria, category"
      // }
    ]

    const worksheetInstrucciones = XLSX.utils.json_to_sheet(instrucciones)
    worksheetInstrucciones['!cols'] = [{ wch: 40 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(workbook, worksheetInstrucciones, "INSTRUCCIONES")

    // Convertir a buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Configurar headers para descarga
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', 'attachment; filename="plantilla_contactos.xlsx"')

    console.log("✅ Plantilla Excel generada exitosamente")

    return new Response(buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("❌ Error al generar plantilla:", error)
    return NextResponse.json(
      { error: "Error al generar la plantilla", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}