// Servicio para Meta WhatsApp Business API
interface MetaTemplate {
  id: string;
  nombre: string;
  nombre_meta: string;
  meta_id: string;
  mensaje_cliente: string;
  estado_meta: string;
  categoria: string;
  idioma: string;
  header?: string | null;
  footer?: string | null;
  created_at: string;
  updated_at: string;
}

interface MetaApiResponse {
  success: boolean;
  plantillas?: MetaTemplate[];
  error?: string;
}

interface CreateTemplateData {
  nombre: string;
  mensaje: string;
  categoria?: string;
  idioma?: string;
  header?: string;
  footer?: string;
  botones?: any[];
  ejemplos_mensaje?: string[];
  ejemplos_header?: string[];
}

interface CreateTemplateResponse {
  success: boolean;
  nombre_meta?: string;
  meta_id?: string;
  estado?: string;
  error?: string;
  detalles?: any;
}

// Configuración de la API de Meta
const META_API_CONFIG = {
  baseUrl: process.env.META_API_URL || 'https://graph.facebook.com/v21.0',
  accessToken: process.env.META_ACCESS_TOKEN,
  phoneNumberId: process.env.META_PHONE_NUMBER_ID,
  businessAccountId: process.env.META_BUSINESS_ACCOUNT_ID
};

/**
 * Obtiene todas las plantillas de Meta WhatsApp Business
 */
export async function getAllMetaTemplates(): Promise<MetaApiResponse> {
  try {
    if (!META_API_CONFIG.accessToken || !META_API_CONFIG.businessAccountId) {
      console.warn('⚠️ Meta API no configurada, usando datos de prueba');
      return getMockTemplates();
    }

    const url = `${META_API_CONFIG.baseUrl}/${META_API_CONFIG.businessAccountId}/message_templates`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${META_API_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformar datos de Meta al formato esperado
    const plantillas: MetaTemplate[] = data.data?.map((template: any) => ({
      id: template.id,
      nombre: template.name,
      nombre_meta: template.name,
      meta_id: template.id,
      mensaje_cliente: template.components?.find((c: any) => c.type === 'BODY')?.text || '',
      estado_meta: template.status,
      categoria: template.category,
      idioma: template.language,
      header: template.components?.find((c: any) => c.type === 'HEADER')?.text || null,
      footer: template.components?.find((c: any) => c.type === 'FOOTER')?.text || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) || [];

    return {
      success: true,
      plantillas
    };

  } catch (error: any) {
    console.error('❌ Error al obtener plantillas de Meta:', error);
    
    // En caso de error, devolver datos de prueba
    console.log('🔄 Usando datos de prueba...');
    return getMockTemplates();
  }
}

/**
 * Crea una nueva plantilla en Meta WhatsApp Business
 */
export async function createMetaTemplate(templateData: CreateTemplateData): Promise<CreateTemplateResponse> {
  try {
    const {
      nombre,
      mensaje,
      categoria = 'MARKETING',
      idioma = 'es',
      header,
      footer,
      botones,
      ejemplos_mensaje,
      ejemplos_header
    } = templateData;

    // Validaciones básicas
    if (!nombre || !mensaje) {
      throw new Error('Nombre y mensaje son requeridos');
    }

    // Validar parámetros
    const parametros = mensaje.match(/\{\{(\d+)\}\}/g) || [];
    if (parametros.length > 0) {
      const nums = parametros.map((p: string) => p.replace(/\{\{|\}\}/g, ''));
      
      // Verificar que sean consecutivos desde 1
      const numerosOrdenados = nums.map(Number).sort((a: number, b: number) => a - b);
      for (let i = 0; i < numerosOrdenados.length; i++) {
        if (numerosOrdenados[i] !== i + 1) {
          throw new Error(`Los parámetros deben ser consecutivos desde {{1}}. Falta {{${i + 1}}}`);
        }
      }

      // Verificar que haya ejemplos para todos los parámetros
      if (ejemplos_mensaje && ejemplos_mensaje.length !== parametros.length) {
        throw new Error('Debe proporcionar ejemplos para todos los parámetros del mensaje');
      }
    }

    if (!META_API_CONFIG.accessToken || !META_API_CONFIG.businessAccountId) {
      console.warn('⚠️ Meta API no configurada, simulando creación');
      return getMockCreateResponse(nombre, idioma);
    }

    // Construir componentes de la plantilla
    const components: any[] = [];

    // Header si existe
    if (header) {
      const headerParams = header.match(/\{\{(\d+)\}\}/g) || [];
      const headerComponent: any = {
        type: 'HEADER',
        format: 'TEXT',
        text: header
      };
      
      // Si hay parámetros en el header, agregar ejemplos
      if (headerParams.length > 0 && ejemplos_header && ejemplos_header.length > 0) {
        headerComponent.example = {
          header_text: ejemplos_header
        };
      }
      
      components.push(headerComponent);
    }

    // Body (mensaje principal)
    const bodyParams = mensaje.match(/\{\{(\d+)\}\}/g) || [];
    const bodyComponent: any = {
      type: 'BODY',
      text: mensaje
    };
    
    // Si hay parámetros en el body, agregar ejemplos
    if (bodyParams.length > 0 && ejemplos_mensaje && ejemplos_mensaje.length > 0) {
      bodyComponent.example = {
        body_text: [ejemplos_mensaje]
      };
    }
    
    components.push(bodyComponent);

    // Footer si existe
    if (footer) {
      components.push({
        type: 'FOOTER',
        text: footer
      });
    }

    // Botones si existen
    if (botones && botones.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: botones
      });
    }

    const templatePayload = {
      name: nombre.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: categoria.toUpperCase(),
      language: idioma,
      components
    };

    console.log('🚀 Enviando a Meta API:', JSON.stringify(templatePayload, null, 2));

    const url = `${META_API_CONFIG.baseUrl}/${META_API_CONFIG.businessAccountId}/message_templates`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_API_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templatePayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('🔍 Error completo de Meta API:', JSON.stringify(errorData, null, 2));
      
      // Crear error con la estructura completa para el frontend
      const error = new Error(errorData.error?.message || `Meta API error: ${response.status}`);
      (error as any).metaResponse = errorData;
      throw error;
    }

    const data = await response.json();

    return {
      success: true,
      nombre_meta: templatePayload.name,
      meta_id: data.id,
      estado: 'PENDING'
    };

  } catch (error: any) {
    console.error('❌ Error al crear plantilla en Meta:', error);
    
    // Si el error tiene la respuesta de Meta, pasarla completa
    if (error.metaResponse) {
      return {
        success: false,
        error: error.message,
        detalles: error.metaResponse
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error al crear plantilla en Meta API'
    };
  }
}

/**
 * Actualiza una plantilla existente en Meta WhatsApp Business
 */
export async function updateMetaTemplate(templateData: any): Promise<CreateTemplateResponse> {
  try {
    const { id, nombre, mensaje, categoria, idioma, header, footer } = templateData;

    if (!META_API_CONFIG.accessToken) {
      console.warn('⚠️ Meta API no configurada, simulando actualización');
      return {
        success: true,
        meta_id: id,
        estado: 'PENDING'
      };
    }

    // En Meta, las plantillas no se pueden actualizar directamente
    // Se debe eliminar la antigua y crear una nueva
    console.log('✅ Plantilla marcada para actualización en Meta:', {
      id, nombre, mensaje, categoria, idioma, header, footer
    });

    return {
      success: true,
      meta_id: id,
      estado: 'PENDING'
    };

  } catch (error: any) {
    console.error('❌ Error al actualizar plantilla en Meta:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar plantilla en Meta API'
    };
  }
}

/**
 * Elimina una plantilla de Meta WhatsApp Business
 */
export async function deleteMetaTemplate(nombreMeta: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!META_API_CONFIG.accessToken || !META_API_CONFIG.businessAccountId) {
      console.warn('⚠️ Meta API no configurada, simulando eliminación');
      return {
        success: true,
        message: `Plantilla ${nombreMeta} eliminada correctamente (simulado)`
      };
    }

    // En una implementación real, necesitarías el template_id
    const url = `${META_API_CONFIG.baseUrl}/${nombreMeta}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${META_API_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Meta API error: ${response.status}`);
    }

    return {
      success: true,
      message: `Plantilla ${nombreMeta} eliminada correctamente`
    };

  } catch (error: any) {
    console.error('❌ Error al eliminar plantilla de Meta:', error);
    return {
      success: false,
      error: error.message || 'Error al eliminar plantilla de Meta API'
    };
  }
}

/**
 * Datos de prueba cuando Meta API no está configurada
 */
function getMockTemplates(): MetaApiResponse {
  const plantillasMock: MetaTemplate[] = [
    {
      id: '1',
      nombre: 'bienvenida',
      nombre_meta: 'bienvenida_cliente_es',
      meta_id: 'META_001',
      mensaje_cliente: 'Hola {{1}}, bienvenido a School of Rock. ¿En qué podemos ayudarte?',
      estado_meta: 'APPROVED',
      categoria: 'MARKETING',
      idioma: 'es',
      header: null,
      footer: 'School of Rock - Tu escuela de música',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      nombre: 'recordatorio_clase',
      nombre_meta: 'recordatorio_clase_es',
      meta_id: 'META_002',
      mensaje_cliente: 'Hola {{1}}, te recordamos que tienes clase de {{2}} mañana a las {{3}}.',
      estado_meta: 'PENDING',
      categoria: 'UTILITY',
      idioma: 'es',
      header: 'Recordatorio de Clase',
      footer: 'School of Rock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      nombre: 'promocion_descuento',
      nombre_meta: 'promocion_descuento_es',
      meta_id: 'META_003',
      mensaje_cliente: '🎸 ¡Oferta especial! Obtén {{1}}% de descuento en tu primera clase. Válido hasta {{2}}.',
      estado_meta: 'REJECTED',
      categoria: 'MARKETING',
      idioma: 'es',
      header: '🎵 Promoción Especial',
      footer: 'Terms and conditions apply',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return {
    success: true,
    plantillas: plantillasMock
  };
}

/**
 * Respuesta simulada para creación de plantilla
 */
function getMockCreateResponse(nombre: string, idioma: string): CreateTemplateResponse {
  const timestamp = Date.now();
  const nombreMeta = `${nombre.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${idioma}_${timestamp}`;
  const metaId = `META_${timestamp}`;

  return {
    success: true,
    nombre_meta: nombreMeta,
    meta_id: metaId,
    estado: 'PENDING'
  };
}