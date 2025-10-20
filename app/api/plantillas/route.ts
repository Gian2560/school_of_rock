import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {createMetaTemplate, getAllMetaTemplates, updateMetaTemplate, deleteMetaTemplate} from '@/services/metaTemplateService';

export async function GET(request: NextRequest) {
  try {
    // Obtener plantillas de la base de datos local (tabla template)
    const templatesDB = await prisma.$queryRaw`
      SELECT 
        id_template,
        nombre,
        mensaje,
        nombre_meta,
        meta_id,
        estado_meta,
        categoria,
        idioma,
        header,
        footer,
        created_at,
        updated_at
      FROM template
      ORDER BY created_at DESC
    ` as any[];

    // También obtener de Meta para tener datos completos
    const metaResult = await getAllMetaTemplates();
    
    // Combinar datos de BD con Meta si es necesario
    const templatesFormateados = templatesDB.map((template: any) => ({
      id: template.id_template,
      nombre: template.nombre,
      mensaje_cliente: template.mensaje,
      nombre_meta: template.nombre_meta,
      meta_id: template.meta_id,
      estado_meta: template.estado_meta,
      categoria: template.categoria,
      idioma: template.idioma,
      header: template.header,
      footer: template.footer,
      created_at: template.created_at,
      updated_at: template.updated_at
    }));

    return NextResponse.json(templatesFormateados);
  } catch (error: any) {
    console.error("Error al obtener plantillas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, mensaje, categoria, idioma, header, footer, botones, guardar_en_bd, ejemplos_mensaje, ejemplos_header } = await request.json();
    
    const metaResult = await createMetaTemplate({
      nombre, mensaje, categoria: categoria || 'MARKETING', idioma: idioma || 'es',
      header, footer, botones, ejemplos_mensaje, ejemplos_header
    });

    if (!metaResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: metaResult.error,
        ...(metaResult.detalles && { detalles: metaResult.detalles })
      }, { status: 500 });
    }

    let bdResult: any = null;
    if (guardar_en_bd) {
      try {
        // Asegurar que nombre y nombre_meta sean iguales
        const nombreTemplate = nombre;
        const nombreMeta = metaResult.nombre_meta || nombre;

        const templateDB = await prisma.$queryRaw`
          INSERT INTO template (
            nombre, 
            mensaje, 
            nombre_meta,
            meta_id,
            estado_meta,
            categoria,
            idioma,
            header,
            footer,
            created_at,
            updated_at
          ) VALUES (
            ${nombreTemplate},
            ${mensaje},
            ${nombreMeta},
            ${metaResult.meta_id},
            ${metaResult.estado},
            ${categoria || 'MARKETING'},
            ${idioma || 'es'},
            ${header || null},
            ${footer || null},
            NOW(),
            NOW()
          ) RETURNING id_template
        ` as any[];
        
        bdResult = { success: true, id: templateDB[0].id_template };
        console.log(`✅ Template creado en BD - nombre: ${nombreTemplate}, nombre_meta: ${nombreMeta}`);
      } catch (dbError: any) {
        console.error("Error al guardar en BD:", dbError);
        bdResult = { success: false, error: dbError.message };
      }
    }

    return NextResponse.json({
      success: true,
      plantilla: {
        id: metaResult.meta_id, 
        nombre: nombre, 
        nombre_meta: nombre, // Asegurar que sean iguales
        estado_meta: metaResult.estado, 
        mensaje: mensaje,
        categoria: categoria || 'MARKETING', 
        idioma: idioma || 'es'
      },
      bd: bdResult
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nombre, mensaje, categoria, idioma, header, footer, botones, ejemplos_mensaje, ejemplos_header } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido para actualizar' }, { status: 400 });
    }

    // Actualizar en Meta
    const metaResult = await updateMetaTemplate({
      id, nombre, mensaje, categoria: categoria || 'MARKETING', idioma: idioma || 'es',
      header, footer, botones, ejemplos_mensaje, ejemplos_header
    });

    if (!metaResult.success) {
      return NextResponse.json({ success: false, error: metaResult.error }, { status: 500 });
    }

    // Actualizar en BD
    try {
      const templateDB = await prisma.$queryRaw`
        UPDATE template 
        SET 
          nombre = ${nombre},
          nombre_meta = ${nombre},
          mensaje = ${mensaje},
          categoria = ${categoria || 'MARKETING'},
          idioma = ${idioma || 'es'},
          header = ${header || null},
          footer = ${footer || null},
          estado_meta = ${metaResult.estado},
          updated_at = NOW()
        WHERE id_template = ${parseInt(id)}
        RETURNING *
      ` as any[];

      if (templateDB.length === 0) {
        return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        plantilla: {
          id: templateDB[0].id_template,
          nombre: templateDB[0].nombre,
          mensaje_cliente: templateDB[0].mensaje,
          estado_meta: templateDB[0].estado_meta,
          categoria: templateDB[0].categoria,
          idioma: templateDB[0].idioma
        }
      });
    } catch (dbError: any) {
      console.error("Error al actualizar en BD:", dbError);
      return NextResponse.json({ success: false, error: 'Error al actualizar en base de datos: ' + dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { nombre_meta, id } = await request.json();
    
    if (!nombre_meta && !id) {
      return NextResponse.json({ success: false, error: 'nombre_meta o id es requerido' }, { status: 400 });
    }

    // Obtener la plantilla para el nombre_meta si solo se proporciona id
    let templateToDelete: any = null;
    if (id && !nombre_meta) {
      const templateResult = await prisma.$queryRaw`
        SELECT * FROM template WHERE id_template = ${parseInt(id)} LIMIT 1
      ` as any[];
      
      if (templateResult.length === 0) {
        return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
      }
      templateToDelete = templateResult[0];
    }

    const metaNombre = nombre_meta || templateToDelete?.nombre_meta;
    
    if (metaNombre) {
      // Eliminar de Meta
      const metaResult = await deleteMetaTemplate(metaNombre);
      if (!metaResult.success) {
        console.warn('Error al eliminar de Meta:', metaResult.error);
      }
    }

    // Eliminar de BD
    try {
      let deletedTemplate: any;
      if (id) {
        const deleteResult = await prisma.$queryRaw`
          DELETE FROM template WHERE id_template = ${parseInt(id)} RETURNING *
        ` as any[];
        deletedTemplate = deleteResult[0];
      } else {
        const deleteResult = await prisma.$queryRaw`
          DELETE FROM template WHERE nombre_meta = ${metaNombre} RETURNING *
        ` as any[];
        deletedTemplate = deleteResult[0];
      }

      if (!deletedTemplate) {
        return NextResponse.json({ success: false, error: 'No se pudo eliminar la plantilla' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Plantilla "${deletedTemplate.nombre}" eliminada correctamente`
      });
    } catch (dbError: any) {
      console.error("Error al eliminar de BD:", dbError);
      return NextResponse.json({ success: false, error: 'Error al eliminar de base de datos: ' + dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
