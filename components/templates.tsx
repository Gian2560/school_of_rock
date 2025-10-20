"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, RefreshCw, Edit, Trash2, MessageCircle, Search, Filter, CheckCircle, AlertTriangle, Clock, X, Info, FileText, Zap, Settings, Save, AlertCircle, CheckCircle2, Loader2, User, Globe } from "lucide-react"

export default function TemplatesPage() {
  const { toast } = useToast()
  
  // Estados principales
  const [templates, setTemplates] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // Estados del formulario
  const [nombreTemplate, setNombreTemplate] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [categoria, setCategoria] = useState("MARKETING")
  const [idioma, setIdioma] = useState("es_PE")
  const [header, setHeader] = useState("")
  const [footer, setFooter] = useState("")
  const [botones, setBotones] = useState<any[]>([])
  
  // Estados de filtros
  const [filterNombre, setFilterNombre] = useState("")
  const [filterEstadoMeta, setFilterEstadoMeta] = useState("ALL")
  
  // Estados para parámetros
  const [parametrosMensaje, setParametrosMensaje] = useState<string[]>([])
  const [ejemplosMensaje, setEjemplosMensaje] = useState<{[key: string]: string}>({})
  const [parametrosHeader, setParametrosHeader] = useState<string[]>([])
  const [ejemplosHeader, setEjemplosHeader] = useState<{[key: string]: string}>({})
  
  // Estados para mensajes de error y éxito mejorados
  const [errorMessage, setErrorMessage] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [showError, setShowError] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successDetails, setSuccessDetails] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  // Detectar parámetros en el mensaje automáticamente
  useEffect(() => {
    const params = (mensaje.match(/\{\{(\d+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''))
    const uniqueParams = [...new Set(params)].sort((a, b) => Number(a) - Number(b))
    setParametrosMensaje(uniqueParams)
    
    // Mantener ejemplos existentes, agregar vacíos para nuevos parámetros
    const newEjemplos = { ...ejemplosMensaje }
    uniqueParams.forEach(param => {
      if (!newEjemplos[param]) {
        newEjemplos[param] = ''
      }
    })
    setEjemplosMensaje(newEjemplos)
  }, [mensaje])

  // Detectar parámetros en el header automáticamente
  useEffect(() => {
    const params = (header.match(/\{\{(\d+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''))
    const uniqueParams = [...new Set(params)].sort((a, b) => Number(a) - Number(b))
    setParametrosHeader(uniqueParams)
    
    const newEjemplos = { ...ejemplosHeader }
    uniqueParams.forEach(param => {
      if (!newEjemplos[param]) {
        newEjemplos[param] = ''
      }
    })
    setEjemplosHeader(newEjemplos)
  }, [header])

  useEffect(() => {
    fetchTemplates()
    syncMetaStatus()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/plantillas')
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al cargar plantillas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const syncMetaStatus = async () => {
    try {
      setSyncing(true)
      const res = await fetch('/api/plantillas/sync', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        const stats = data.estadisticas
        toast({
          title: "Sincronización completada",
          description: `Nuevas: ${stats.creadas} | Actualizadas: ${stats.actualizadas} | Total: ${stats.total_bd}`,
        })
        await fetchTemplates()
      }
    } catch (error) {
      console.error("Error sync:", error)
      toast({
        title: "Error",
        description: "Error al sincronizar plantillas",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterNombre && !t.nombre.toLowerCase().includes(filterNombre.toLowerCase())) return false
      if (filterEstadoMeta && filterEstadoMeta !== "ALL" && t.estado_meta !== filterEstadoMeta) return false
      return true
    })
  }, [templates, filterNombre, filterEstadoMeta])

  const handleOpenNew = () => {
    setEditTemplate(null)
    setNombreTemplate("")
    setMensaje("")
    setCategoria("MARKETING")
    setIdioma("es_PE")
    setHeader("")
    setFooter("")
    setBotones([])
    setParametrosMensaje([])
    setEjemplosMensaje({})
    setParametrosHeader([])
    setEjemplosHeader({})
    setModalOpen(true)
  }

  const handleOpenEdit = (template: any) => {
    setEditTemplate(template)
    setNombreTemplate(template.nombre)
    setMensaje(template.mensaje_cliente)
    setCategoria(template.categoria || "MARKETING")
    setIdioma(template.idioma || "es")
    setHeader(template.header || "")
    setFooter(template.footer || "")
    setBotones([])
    setParametrosMensaje([])
    setEjemplosMensaje({})
    setParametrosHeader([])
    setEjemplosHeader({})
    setModalOpen(true)
  }

  // Función de validación de parámetros (como en el otro proyecto)
  const validarParametros = (texto: string, campo: string) => {
    const params = texto.match(/\{\{(\w+)\}\}/g)
    if (params) {
      const nums = params.map((p: string) => p.replace(/\{\{|\}\}/g, ''))
      if (!nums.every((p: string) => /^\d+$/.test(p))) {
        setErrorMessage(`❌ Error en ${campo}`)
        setErrorDetails(`Los parámetros deben ser numéricos ({{1}}, {{2}}, etc.)\nEncontrados: ${nums.join(', ')}`)
        setShowError(true)
        return false
      }
    }
    return true
  }

  // Función mejorada para mostrar errores
  const mostrarError = (titulo: string, mensaje: string, detalles?: string) => {
    setErrorMessage(mensaje)
    setErrorDetails(detalles || '')
    setShowError(true)
    toast({
      title: titulo.replace(/❌|⚠️/g, '').trim(),
      description: mensaje,
      variant: "destructive"
    })
  }

  // Función para mostrar éxito
  const mostrarExito = (titulo: string, mensaje: string, detalles?: string) => {
    setSuccessMessage(mensaje)
    setSuccessDetails(detalles || '')
    setShowSuccess(true)
    toast({
      title: titulo.replace(/✅|🎉/g, '').trim(),
      description: mensaje,
    })
  }

  const handleSave = async () => {
    if (!nombreTemplate.trim() || !mensaje.trim()) {
      mostrarError("Error de validación", "Complete nombre y mensaje")
      return
    }

    // Validar formato del nombre (solo minúsculas, números y guiones bajos)
    if (!/^[a-z0-9_]+$/.test(nombreTemplate)) {
      mostrarError(
        "Error en nombre de plantilla",
        "El nombre solo puede contener letras minúsculas, números y guiones bajos (_)",
        "Ejemplos válidos:\n• bienvenida_cliente\n• recordatorio_cita_2024\n• promocion_navidad"
      )
      return
    }

    // Validar parámetros en el mensaje
    const parametrosEnMensaje = mensaje.match(/\{\{(\w+)\}\}/g)
    if (parametrosEnMensaje) {
      const parametros = parametrosEnMensaje.map(p => p.replace(/\{\{|\}\}/g, ''))
      
      // Verificar que sean solo números
      const tienenSoloNumeros = parametros.every(p => /^\d+$/.test(p))
      if (!tienenSoloNumeros) {
        mostrarError(
          "Error en parámetros del mensaje",
          "Los parámetros deben ser numéricos. Use {{1}}, {{2}}, {{3}}, etc.",
          `Parámetros encontrados: ${parametros.join(', ')}\nFormato correcto: {{1}}, {{2}}, {{3}}`
        )
        return
      }

      // Verificar que no se repitan
      const parametrosUnicos = new Set(parametros)
      if (parametrosUnicos.size !== parametros.length) {
        const duplicados = parametros.filter((item, index) => parametros.indexOf(item) !== index)
        mostrarError(
          "Parámetros duplicados",
          "Los parámetros no pueden repetirse. Cada número debe aparecer solo una vez",
          `Parámetros duplicados: ${[...new Set(duplicados)].join(', ')}\nUse números únicos: {{1}}, {{2}}, {{3}}`
        )
        return
      }

      // Verificar que sean consecutivos desde 1
      const numerosOrdenados = parametros.map(Number).sort((a, b) => a - b)
      for (let i = 0; i < numerosOrdenados.length; i++) {
        if (numerosOrdenados[i] !== i + 1) {
          mostrarError(
            "Parámetros no consecutivos",
            `Los parámetros deben ser consecutivos desde {{1}}. Falta {{${i + 1}}}`,
            `Parámetros actuales: ${parametros.join(', ')}\nDeben ser: ${Array.from({length: parametros.length}, (_, i) => `{{${i + 1}}}`).join(', ')}`
          )
          return
        }
      }

      // Validar que todos los parámetros tengan ejemplos
      for (const param of parametrosMensaje) {
        if (!ejemplosMensaje[param] || !ejemplosMensaje[param].trim()) {
          mostrarError(
            "Falta ejemplo de parámetro",
            `El parámetro {{${param}}} necesita un ejemplo`,
            `Por favor proporcione un ejemplo para el parámetro {{${param}}} en la sección "Ejemplos para parámetros del mensaje"`
          )
          return
        }
      }

      // 🚨 VALIDACIÓN: Parámetros al inicio o final (Meta WhatsApp no permite)
      const mensajeTrimmed = mensaje.trim()
      if (mensajeTrimmed.startsWith('{{') || mensajeTrimmed.endsWith('}}')) {
        mostrarError(
          "Error de formato",
          "Los parámetros no pueden estar al principio ni al final de la plantilla",
          "Solución: Agrega texto antes del primer parámetro y después del último parámetro\n\nEjemplo: 'Hola {{1}}, bienvenido a nuestra empresa'"
        )
        return
      }

      // 🚨 VALIDACIÓN DEL RATIO DE PARÁMETROS (Meta WhatsApp Business)
      const ratioParametros = parametrosMensaje.length / mensaje.length
      const porcentajeRatio = (ratioParametros * 100).toFixed(1)
      
      console.log(`📊 Análisis: ${parametrosMensaje.length} parámetros, ${mensaje.length} caracteres, ratio: ${ratioParametros.toFixed(3)} (${porcentajeRatio}%)`)
      
      if (ratioParametros > 0.15) {
        const confirm = window.confirm(
          `ADVERTENCIA: Ratio alto de parámetros (${porcentajeRatio}%)\n\n` +
          `Meta WhatsApp puede rechazar esta plantilla porque tiene demasiados parámetros.\n\n` +
          `Recomendación: Máximo 15% de parámetros\n` +
          `Actual: ${parametrosMensaje.length} parámetros en ${mensaje.length} caracteres\n\n` +
          `¿Quieres continuar de todos modos?`
        )
        if (!confirm) return
      }
    }

    // Validar parámetros en header
    if (header && !validarParametros(header, "Header")) return
    if (footer && !validarParametros(footer, "Footer")) return

    // Validar ejemplos del header
    if (parametrosHeader.length > 0) {
      for (const param of parametrosHeader) {
        if (!ejemplosHeader[param] || !ejemplosHeader[param].trim()) {
          mostrarError(
            "Falta ejemplo en header",
            `El parámetro del header {{${param}}} necesita un ejemplo`,
            `Por favor proporcione un ejemplo para el parámetro {{${param}}} en la sección "Ejemplos para parámetros del header"`
          )
          return
        }
      }
    }

    // Construir ejemplos para enviar al backend
    const ejemplosMensajeArray = parametrosMensaje.map(p => ejemplosMensaje[p])
    const ejemplosHeaderArray = parametrosHeader.length > 0 
      ? parametrosHeader.map(p => ejemplosHeader[p]) 
      : undefined

    // Debug: verificar que los ejemplos estén correctamente construidos
    console.log('🔍 Parámetros detectados:', {
      mensaje: parametrosMensaje,
      header: parametrosHeader,
      ejemplosMensaje: ejemplosMensaje,
      ejemplosHeader: ejemplosHeader,
      ejemplosMensajeArray,
      ejemplosHeaderArray
    })

    const templateData = {
      nombre: nombreTemplate,
      mensaje: mensaje,
      guardar_en_bd: true,
      categoria,
      idioma,
      header: header || undefined,
      footer: footer || undefined,
      botones: botones.length > 0 ? botones : undefined,
      ejemplos_mensaje: ejemplosMensajeArray.length > 0 ? ejemplosMensajeArray : undefined,
      ejemplos_header: ejemplosHeaderArray
    }

    console.log('🔍 Enviando datos al API:', JSON.stringify(templateData, null, 2))

    try {
      setLoading(true)
      let res
      if (editTemplate) {
        res = await fetch('/api/plantillas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...templateData, id: editTemplate.id })
        })
      } else {
        res = await fetch('/api/plantillas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        })
      }
      
      const data = await res.json()
      
      if (data.success) {
        const titulo = editTemplate ? "Plantilla actualizada" : "Plantilla creada exitosamente"
        const mensaje = `La plantilla "${nombreTemplate}" fue ${editTemplate ? 'actualizada' : 'creada'} correctamente`
        const detalles = editTemplate 
          ? `Plantilla actualizada en Meta WhatsApp Business\nEstado: ${data.plantilla?.estado_meta || 'PENDING'}\nLos cambios requieren nueva aprobación (24-48 hrs)`
          : `Plantilla enviada a Meta WhatsApp Business\nEstado inicial: PENDING\nAprobación en 24-48 hrs\nGuardada en base de datos local`
        
        mostrarExito(titulo, mensaje, detalles)
        await fetchTemplates()
        setModalOpen(false)
      } else {
        // Si hay error en data, manejar específicamente los errores de Meta
        let errorMsg = data.error || 'Error desconocido'
        let errorDetalles = ""
        
        if (data.detalles?.error?.error_user_msg) {
          errorMsg = data.detalles.error.error_user_msg
          
          // Contexto específico para errores comunes de Meta
          if (data.detalles.error.error_subcode === 2388299) {
            errorDetalles = "Solución: Los parámetros {{1}}, {{2}} deben estar dentro del texto, no al inicio o final"
          } else if (data.detalles.error.error_subcode === 2388293) {
            errorDetalles = "Solución: Reduce parámetros o aumenta el texto del mensaje"
          }
        }
        
        mostrarError("Error de Meta WhatsApp", errorMsg, errorDetalles)
        return
      }
    } catch (error: any) {
      console.error("Error al guardar plantilla:", error)
      
      // El error ya viene procesado del catch del fetch anterior
      // Simplemente mostrar el mensaje que ya está en error
      let errorMsg = error.message || "Error al guardar plantilla"
      let errorDetalles = ""
      
      // Si hay información de Meta en el error, extraerla
      if (error.metaResponse?.error?.error_user_msg) {
        errorMsg = error.metaResponse.error.error_user_msg
        
        // Agregar contexto específico para errores comunes
        if (error.metaResponse.error.error_subcode === 2388299) {
          errorDetalles = "Solución: Los parámetros {{1}}, {{2}} deben estar dentro del texto, no al inicio o final"
        }
      }
      
      mostrarError("Error de Meta WhatsApp", errorMsg, errorDetalles)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (row: any) => {
    if (window.confirm(`¿Eliminar plantilla "${row.nombre}"?`)) {
      try {
        setLoading(true)
        const res = await fetch('/api/plantillas', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_meta: row.nombre_meta || row.id })
        })
        
        const data = await res.json()
        if (data.success) {
          mostrarExito(
            "Plantilla eliminada",
            `La plantilla "${row.nombre}" fue eliminada correctamente`,
            `Eliminada de Meta WhatsApp Business\nEliminada de la base de datos local\nEstado anterior: ${row.estado_meta}`
          )
          await fetchTemplates()
        } else {
          throw new Error(data.error || 'Error desconocido')
        }
      } catch (error: any) {
        console.error("Error:", error)
        
        // Mostrar error exacto de Meta (sin traducir)
        let errorMsg = "Error al eliminar plantilla"
        
        if (error.response?.data?.error_user_msg) {
          errorMsg = error.response.data.error_user_msg
        } else if (error.response?.data?.detalles?.error?.error_user_msg) {
          errorMsg = error.response.data.detalles.error.error_user_msg
        } else if (error.response?.data?.mensaje) {
          errorMsg = error.response.data.mensaje
        } else if (error.response?.data?.error) {
          errorMsg = error.response.data.error
        } else if (error.message) {
          errorMsg = error.message
        }
        
        mostrarError("Error al eliminar plantilla", errorMsg, "")
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "REJECTED":
        return <X className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            Plantillas WhatsApp
          </h1>
          <p className="text-muted-foreground">Gestión de plantillas de mensajes para Meta WhatsApp Business</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={syncMetaStatus}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-nombre">Buscar por nombre</Label>
              <Input
                id="filter-nombre"
                placeholder="Nombre de la plantilla..."
                value={filterNombre}
                onChange={(e) => setFilterNombre(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter-estado">Estado en Meta</Label>
              <Select value={filterEstadoMeta} onValueChange={setFilterEstadoMeta}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Plantillas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Plantillas ({filteredTemplates.length})</CardTitle>
            <Badge variant="outline">{templates.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Cargando plantillas...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron plantillas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{template.nombre}</div>
                        <div className="text-sm text-muted-foreground">{template.nombre_meta}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {template.mensaje_cliente}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {template.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(template.estado_meta)}>
                          {getStatusIcon(template.estado_meta)}
                          <span className="ml-1">{template.estado_meta}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.created_at ? new Date(template.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEdit(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(template)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear/editar plantilla */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
          style={{ 
            width: '60vw', 
            maxWidth: '700px',
            minWidth: '700px'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {editTemplate ? 'Editar Plantilla de WhatsApp' : 'Nueva Plantilla de WhatsApp'}
            </DialogTitle>
            <div className="mt-3">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Información importante:</strong> Las plantillas requieren aprobación de Meta WhatsApp Business (24-48 horas). 
                  Usa parámetros como {`{{1}}, {{2}}`} para personalizar mensajes.
                </AlertDescription>
              </Alert>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Sección: Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Configuración Básica</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <Label htmlFor="nombre">Nombre de la plantilla *</Label>
                  <Input
                    id="nombre"
                    value={nombreTemplate}
                    onChange={(e) => setNombreTemplate(e.target.value)}
                    placeholder="ej: bienvenida_cliente"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo letras minúsculas, números y guiones bajos
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="UTILITY">Utilidad</SelectItem>
                      <SelectItem value="AUTHENTICATION">Autenticación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={idioma} onValueChange={setIdioma}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es_PE">Español (Perú)</SelectItem>
                      <SelectItem value="es_MX">Español (México)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sección: Contenido del Mensaje */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-gray-900">Contenido del Mensaje</h3>
              </div>
              
              {/* Header */}
              <div>
                <Label htmlFor="header">Header (Opcional - máximo 60 caracteres)</Label>
                <Input
                  id="header"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Encabezado del mensaje..."
                  maxLength={60}
                />
                {header && (
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${header.length > 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {header.length}/60 caracteres
                    </p>
                    {header.length > 50 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Casi al límite</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mensaje principal */}
              <div>
                <Label htmlFor="mensaje">Mensaje principal * (máximo 1024 caracteres)</Label>
                <Textarea
                  id="mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje aquí. Usa {{1}}, {{2}} para parámetros..."
                  rows={4}
                  maxLength={1024}
                />
                {mensaje && (
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${mensaje.length > 900 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {mensaje.length}/1024 caracteres
                    </p>
                    {mensaje.length > 900 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Casi al límite</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            {/* Ejemplos de parámetros del mensaje */}
            {parametrosMensaje.length > 0 && (
              <div>
                <Alert className="mb-3 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Parámetros detectados:</strong> Se encontraron {parametrosMensaje.length} parámetro(s) en el mensaje. Por favor, proporcione ejemplos para cada uno.
                  </AlertDescription>
                </Alert>
                <Label>Ejemplos para parámetros del mensaje</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {parametrosMensaje.map((param) => (
                    <div key={param}>
                      <Label htmlFor={`ejemplo-${param}`}>Ejemplo para {`{{${param}}}`}</Label>
                      <Input
                        id={`ejemplo-${param}`}
                        value={ejemplosMensaje[param] || ''}
                        onChange={(e) => setEjemplosMensaje({
                          ...ejemplosMensaje,
                          [param]: e.target.value
                        })}
                        placeholder={param === '1' ? 'Juan Pérez' : param === '2' ? 'Maqui Sistemas' : `Valor ${param}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ejemplos de parámetros del header */}
            {parametrosHeader.length > 0 && (
              <div>
                <Alert className="mb-3 border-purple-200 bg-purple-50">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Parámetros en encabezado:</strong> Se encontraron {parametrosHeader.length} parámetro(s) en el encabezado. Proporcione ejemplos para cada uno.
                  </AlertDescription>
                </Alert>
                <Label>Ejemplos para parámetros del header</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {parametrosHeader.map((param) => (
                    <div key={param}>
                      <Label htmlFor={`ejemplo-header-${param}`}>Ejemplo para header {`{{${param}}}`}</Label>
                      <Input
                        id={`ejemplo-header-${param}`}
                        value={ejemplosHeader[param] || ''}
                        onChange={(e) => setEjemplosHeader({
                          ...ejemplosHeader,
                          [param]: e.target.value
                        })}
                        placeholder={param === '1' ? 'Bienvenido' : param === '2' ? 'Usuario' : `Texto ${param}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Footer */}
              <div>
              <Label htmlFor="footer">Footer (Opcional - máximo 60 caracteres)</Label>
              <Input
                id="footer"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Pie del mensaje..."
                maxLength={60}
              />
              {footer && (
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm ${footer.length > 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {footer.length}/60 caracteres
                  </p>
                  {footer.length > 50 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Casi al límite</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sección: Mejores Prácticas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Zap className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Tips</h3>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Use parámetros {`{{1}}, {{2}}, {{3}}`} para personalizar mensajes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Mantenga los mensajes claros y concisos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Evite texto promocional excesivo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Proporcione valor real al usuario
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    Las plantillas requieren aprobación de Meta (24-48 hrs)
                  </li>
                </ul>
              </div>
            </div>
            </div>

            {/* Preview */}
            {mensaje && (
              <div>
                <Label>Vista previa</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  {header && (
                    <div className="font-medium text-sm mb-2 text-primary">
                      {header.replace(/\{\{(\d+)\}\}/g, (_, num) => ejemplosHeader[num] || `{{${num}}}`)}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {mensaje.replace(/\{\{(\d+)\}\}/g, (_, num) => ejemplosMensaje[num] || `{{${num}}}`)}
                  </div>
                  {footer && (
                    <div className="text-xs mt-2 text-muted-foreground">
                      {footer}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !nombreTemplate.trim() || !mensaje.trim()}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editTemplate ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {editTemplate ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Actualizar Plantilla
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Plantilla
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}