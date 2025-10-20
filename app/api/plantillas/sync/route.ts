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
    let templatesDB: any[] = [];
    try {
      templatesDB = await prisma.$queryRaw`
        SELECT 
          id_template,
          nombre_meta,
          estado_meta,
          meta_id
        FROM template
        WHERE nombre_meta IS NOT NULL
      ` as any[];
      console.log(`[DB] ${templatesDB.length} plantillas existentes en BD`);
    } catch (dbError: any) {
      console.warn('[WARNING] La tabla template no existe o está vacía, se crearán todas las plantillas');
      templatesDB = [];
    }

    // 3. Crear un mapa de plantillas existentes por nombre_meta
    const templatesDBMap = new Map(
      templatesDB.map(t => [t.nombre_meta, t])
    );

    let creadas = 0;
    let actualizadas = 0;
    let errores = 0;

    // 4. Sincronizar cada plantilla de Meta
    for (const plantillaMeta of plantillasMeta) {
      try {
        const templateExistente = templatesDBMap.get(plantillaMeta.nombre_meta);

        if (templateExistente) {
          // ACTUALIZAR: Si el estado cambió en Meta
          if (templateExistente.estado_meta !== plantillaMeta.estado_meta) {
            await prisma.$queryRaw`
              UPDATE template 
              SET 
                estado_meta = ${plantillaMeta.estado_meta},
                meta_id = ${plantillaMeta.meta_id},
                mensaje = ${plantillaMeta.mensaje || ''},
                header = ${plantillaMeta.header},
                footer = ${plantillaMeta.footer},
                updated_at = NOW()
              WHERE id_template = ${templateExistente.id_template}
            `;
            actualizadas++;
            console.log(`[UPDATE] Actualizada: ${plantillaMeta.nombre}`);
          }
        } else {
          // CREAR: Nueva plantilla de Meta en BD
          const nombreTemplate = plantillaMeta.nombre_meta || plantillaMeta.nombre;
          await prisma.$queryRaw`
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
              ${plantillaMeta.mensaje || ''},
              ${nombreTemplate},
              ${plantillaMeta.meta_id},
              ${plantillaMeta.estado_meta},
              ${plantillaMeta.categoria || 'MARKETING'},
              ${plantillaMeta.idioma || 'es'},
              ${plantillaMeta.header},
              ${plantillaMeta.footer},
              NOW(),
              NOW()
            )
          `;
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
        total_bd: templatesDB.length + creadas
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
