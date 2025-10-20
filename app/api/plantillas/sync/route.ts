import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllMetaTemplates } from '@/services/metaTemplateService';

/**
 * POST /api/plantillas/sync
 * Sincroniza plantillas de Meta con la base de datos local
 * - Crea plantillas de Meta que no existen en BD
 * - Actualiza estado de plantillas existentes
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[SYNC] Iniciando sincronización de plantillas Meta → BD...');

    // 1. Obtener todas las plantillas de Meta
    const metaResult = await getAllMetaTemplates();
    
    if (!metaResult.success || !metaResult.plantillas) {
      return NextResponse.json({
        success: false,
        mensaje: 'Error al obtener plantillas de Meta',
        error: metaResult.error
      }, { status: 500 });
    }

    const plantillasMeta = metaResult.plantillas;
    console.log(`[SYNC] ${plantillasMeta.length} plantillas obtenidas de Meta`);

    // 2. Obtener plantillas existentes en BD
    let plantillasDB: any[] = [];
    try {
      plantillasDB = await (prisma as any).plantilla.findMany({
        select: {
          id: true,
          nombre_meta: true,
          estado_meta: true,
          meta_id: true
        }
      });
      console.log(`[DB] ${plantillasDB.length} plantillas existentes en BD`);
    } catch (dbError: any) {
      console.warn('[WARNING] La tabla plantilla no existe o está vacía, se crearán todas las plantillas');
      plantillasDB = [];
    }

    // 3. Crear un mapa de plantillas existentes por nombre_meta
    const plantillasDBMap = new Map(
      plantillasDB.map(p => [p.nombre_meta, p])
    );

    let creadas = 0;
    let actualizadas = 0;
    let errores = 0;

    // 4. Sincronizar cada plantilla de Meta
    for (const plantillaMeta of plantillasMeta) {
      try {
        const plantillaExistente = plantillasDBMap.get(plantillaMeta.nombre_meta);

        if (plantillaExistente) {
          // ACTUALIZAR: Si el estado cambió en Meta
          if (plantillaExistente.estado_meta !== plantillaMeta.estado_meta) {
            await (prisma as any).plantilla.update({
              where: { id: plantillaExistente.id },
              data: {
                estado_meta: plantillaMeta.estado_meta,
                meta_id: plantillaMeta.meta_id,
                mensaje_cliente: plantillaMeta.mensaje_cliente,
                header: plantillaMeta.header,
                footer: plantillaMeta.footer,
                updated_at: new Date()
              }
            });
            actualizadas++;
            console.log(`[UPDATE] Actualizada: ${plantillaMeta.nombre}`);
          }
        } else {
          // CREAR: Nueva plantilla de Meta en BD
          await (prisma as any).plantilla.create({
            data: {
              nombre: plantillaMeta.nombre,
              mensaje_cliente: plantillaMeta.mensaje_cliente || '',
              nombre_meta: plantillaMeta.nombre_meta,
              meta_id: plantillaMeta.meta_id,
              estado_meta: plantillaMeta.estado_meta,
              categoria: plantillaMeta.categoria,
              idioma: plantillaMeta.idioma,
              header: plantillaMeta.header,
              footer: plantillaMeta.footer,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          creadas++;
          console.log(`[CREATE] Creada: ${plantillaMeta.nombre}`);
        }
      } catch (error: any) {
        errores++;
        console.error(`[ERROR] Error al sincronizar ${plantillaMeta.nombre}:`, error.message);
      }
    }

    console.log(`\n[SUMMARY] Resumen de sincronización:`);
    console.log(`   [NEW] Creadas: ${creadas}`);
    console.log(`   [UPD] Actualizadas: ${actualizadas}`);
    console.log(`   [ERR] Errores: ${errores}`);

    return NextResponse.json({
      success: true,
      mensaje: 'Sincronización completada',
      estadisticas: {
        total_meta: plantillasMeta.length,
        creadas,
        actualizadas,
        errores,
        total_bd: plantillasDB.length + creadas
      }
    });

  } catch (error: any) {
    console.error('[ERROR] Error en sincronización:', error);
    return NextResponse.json({
      success: false,
      mensaje: 'Error al sincronizar plantillas',
      error: error.message
    }, { status: 500 });
  }
}
