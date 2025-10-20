import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {createMetaTemplate, getAllMetaTemplates, updateMetaTemplate, deleteMetaTemplate} from '@/services/metaTemplateService';

export async function GET(request: NextRequest) {
  try {
    const metaResult = await getAllMetaTemplates();
    if (!metaResult.success) {
      return NextResponse.json({ error: metaResult.error }, { status: 500 });
    }
    return NextResponse.json(metaResult.plantillas);
  } catch (error: any) {
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
        const plantillaDB = await (prisma as any).plantilla.create({
          data: {
            nombre, 
            mensaje_cliente: mensaje, 
            nombre_meta: metaResult.nombre_meta,
            meta_id: metaResult.meta_id, 
            estado_meta: metaResult.estado,
            categoria: categoria || 'MARKETING', 
            idioma: idioma || 'es',
            header: header || null, 
            footer: footer || null,
            created_at: new Date(), 
            updated_at: new Date()
          }
        });
        bdResult = { success: true, id: plantillaDB.id };
      } catch (dbError: any) {
        bdResult = { success: false, error: dbError.message };
      }
    }

    return NextResponse.json({
      success: true,
      plantilla: {
        id: metaResult.meta_id, 
        nombre, 
        nombre_meta: metaResult.nombre_meta,
        estado_meta: metaResult.estado, 
        mensaje_cliente: mensaje,
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
      const plantillaDB = await (prisma as any).plantilla.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          mensaje_cliente: mensaje,
          categoria: categoria || 'MARKETING',
          idioma: idioma || 'es',
          header: header || null,
          footer: footer || null,
          estado_meta: metaResult.estado,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        plantilla: {
          id: plantillaDB.id,
          nombre: plantillaDB.nombre,
          mensaje_cliente: plantillaDB.mensaje_cliente,
          estado_meta: plantillaDB.estado_meta,
          categoria: plantillaDB.categoria,
          idioma: plantillaDB.idioma
        }
      });
    } catch (dbError: any) {
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
    let plantillaToDelete: any = null;
    if (id && !nombre_meta) {
      plantillaToDelete = await (prisma as any).plantilla.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!plantillaToDelete) {
        return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
      }
    }

    const metaNombre = nombre_meta || plantillaToDelete?.nombre_meta;
    
    if (metaNombre) {
      // Eliminar de Meta
      const metaResult = await deleteMetaTemplate(metaNombre);
      if (!metaResult.success) {
        console.warn('Error al eliminar de Meta:', metaResult.error);
      }
    }

    // Eliminar de BD
    try {
      let deletedPlantilla: any;
      if (id) {
        deletedPlantilla = await (prisma as any).plantilla.delete({
          where: { id: parseInt(id) }
        });
      } else {
        deletedPlantilla = await (prisma as any).plantilla.delete({
          where: { nombre_meta: metaNombre }
        });
      }

      return NextResponse.json({
        success: true,
        message: `Plantilla "${deletedPlantilla.nombre}" eliminada correctamente`
      });
    } catch (dbError: any) {
      return NextResponse.json({ success: false, error: 'Error al eliminar de base de datos: ' + dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
