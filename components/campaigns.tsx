"use client"

import { useState, useEffect } from "react"
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
import { Upload, Send, MessageCircle, TrendingUp, Plus, Download, FileText, CheckCircle, AlertTriangle, X } from "lucide-react"

// Cambia esto por tu URL real o usa process.env.NEXT_PUBLIC_CLOUD_RUN_URL
const CLOUD_RUN_URL = process.env.NEXT_PUBLIC_CLOUD_RUN_URL || "https://your-cloud-run-url"

// Hook para obtener campañas desde la API
function useCampanas() {
  const [campanas, setCampanas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampanas = () => {
    setLoading(true)
    fetch("/api/campanas")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCampanas(data.campanas || [])
        } else {
          setCampanas(data || [])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("❌ Error cargando campañas:", error)
        setCampanas([])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCampanas()
  }, [])

  return { campanas, loading, refetchCampanas: fetchCampanas }
}

// Hook para obtener templates desde la API
function useTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = () => {
    setLoading(true)
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTemplates(data.templates || [])
        } else {
          setTemplates(data || [])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("❌ Error cargando templates:", error)
        setTemplates([])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return { templates, loading: loading, refetchTemplates: fetchTemplates }
}

export default function Campaigns() {
  const { campanas, loading: campanasLoading, refetchCampanas } = useCampanas()
  const { templates, loading: templatesLoading, refetchTemplates } = useTemplates()
  const { toast } = useToast()

  // Estados para crear campaña
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    selectedTemplate: ""
  })

  // Estados para upload de Excel
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'campaign' | 'inserting'>('upload')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedCampanaForUpload, setSelectedCampanaForUpload] = useState<string>('')

  // Estados para crear template
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    message: ""
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activa":
      case "enviada":
        return "bg-green-100 text-green-800"
      case "draft":
      case "borrador":
        return "bg-gray-100 text-gray-800"
      case "pausada":
        return "bg-yellow-100 text-yellow-800"
      case "finalizada":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "activa": "Activa",
      "enviada": "Enviada", 
      "pausada": "Pausada",
      "borrador": "Borrador",
      "finalizada": "Finalizada"
    }
    return statusMap[status] || status
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.selectedTemplate) {
      toast({
        title: "Campos requeridos",
        description: "Completa todos los campos obligatorios",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingCampaign(true)
      
      const payload = {
        nombre_campanha: newCampaign.name,
        descripcion: newCampaign.description || null,
        id_template: newCampaign.selectedTemplate ? parseInt(newCampaign.selectedTemplate) : null,
        estado_campanha: 'activa'
      }

      const response = await fetch("/api/campanas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: "Campaña creada",
          description: `La campaña "${newCampaign.name}" fue creada correctamente.`,
        })
        refetchCampanas()
        resetCampaignStates()
      } else {
        const error = await response.json()
        toast({
          title: "Error al crear campaña",
          description: error.error || "No se pudo crear la campaña",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    } finally {
      setIsCreatingCampaign(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({
        title: "Campos requeridos",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingTemplate(true)
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newTemplate.name,
          mensaje: newTemplate.message
        })
      })

      if (response.ok) {
        toast({
          title: "Template creado",
          description: `El template "${newTemplate.name}" fue creado correctamente.`,
        })
        refetchTemplates()
        resetTemplateStates()
      } else {
        const error = await response.json()
        toast({
          title: "Error al crear template",
          description: error.error || "No se pudo crear el template",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const useTemplateInCampaign = (templateId: string) => {
    setNewCampaign({
      ...newCampaign,
      selectedTemplate: templateId
    })
    setIsCampaignDialogOpen(true)
  }

  const resetCampaignStates = () => {
    setNewCampaign({ 
      name: "", 
      description: "", 
      selectedTemplate: ""
    })
    setIsCreatingCampaign(false)
    setIsCampaignDialogOpen(false)
  }

  const resetTemplateStates = () => {
    setNewTemplate({ name: "", message: "" })
    setIsCreatingTemplate(false)
    setIsTemplateDialogOpen(false)
  }

  // Enviar campaña a servicio externo
  const sendCampaignMessages = async (campaignId: string) => {
    try {
      const response = await fetch(`${CLOUD_RUN_URL}/api/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId,
          callbackUrl: `${window.location.origin}/api/campanas/${campaignId}/callback`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error al enviar campaña via Cloud Function:", error);
      throw error;
    }
  };

  // Handler para botón Enviar
  const handleSendCampaign = async (campaignId: string) => {
    toast({ title: "Enviando campaña...", description: "Procesando envío de mensajes." });
    try {
      await sendCampaignMessages(campaignId);
      toast({
        title: "Campaña enviada",
        description: `La campaña fue enviada correctamente.`,
      });
      refetchCampanas();
    } catch (error) {
      toast({
        title: "Error al enviar campaña",
        description: (error as Error).message || "No se pudo enviar la campaña",
        variant: "destructive"
      });
    }
  };

  // Funciones para upload de Excel
  const handleFileUpload = async (file: File) => {
    setUploadFile(file)
    setUploadStep('preview')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/contactos/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data)
        toast({
          title: "Archivo procesado",
          description: `Se procesaron ${data.resumen.totalFilas} contactos`
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error al procesar archivo",
          description: error.error,
          variant: "destructive"
        })
        setUploadStep('upload')
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo procesar el archivo",
        variant: "destructive"
      })
      setUploadStep('upload')
    }
  }

  const handleMassInsert = async () => {
    if (!previewData || !selectedCampanaForUpload) return
    
    setUploadStep('inserting')
    setUploadProgress(0)
    
    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/contactos/mass-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactos: previewData.contactos,
          campanhaId: selectedCampanaForUpload
        })
      })
      
      clearInterval(progressInterval)
      
      if (response.ok) {
        const result = await response.json()
        setUploadProgress(100)
        
        toast({
          title: "Contactos importados",
          description: `Se procesaron ${result.asociados} contactos exitosamente. ${result.insertados} nuevos contactos creados.`
        })
        
        // Refrescar campañas para mostrar nuevos contactos
        refetchCampanas()
        
        // Resetear estados después de un delay
        setTimeout(() => {
          resetUploadStates()
        }, 2000)
        
      } else {
        const error = await response.json()
        toast({
          title: "Error al insertar contactos",
          description: error.error,
          variant: "destructive"
        })
        setUploadStep('campaign')
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudieron insertar los contactos",
        variant: "destructive"
      })
      setUploadStep('campaign')
    }
  }

  const resetUploadStates = () => {
    setIsUploadDialogOpen(false)
    setUploadFile(null)
    setPreviewData(null)
    setUploadStep('upload')
    setUploadProgress(0)
    setSelectedCampanaForUpload('')
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/contactos/template')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'plantilla_contactos.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Plantilla descargada",
          description: "La plantilla de Excel fue descargada exitosamente"
        })
      }
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la plantilla",
        variant: "destructive"
      })
    }
  }

  // Mostrar loading mientras cargan los datos
  if (campanasLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando campañas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campañas</h1>
          <p className="text-muted-foreground">Gestión de campañas de WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={downloadTemplate}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Plantilla Excel
          </Button>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-primary hover:text-primary">
                <Upload className="w-4 h-4 mr-2" />
                Cargar Contactos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cargar Contactos desde Excel</DialogTitle>
              </DialogHeader>
              
              {uploadStep === 'upload' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Seleccionar archivo Excel</h3>
                    <p className="text-muted-foreground mb-4">
                      Arrastra el archivo o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Button asChild>
                      <label htmlFor="excel-upload" className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-2" />
                        Seleccionar Archivo
                      </label>
                    </Button>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Asegúrate de usar la plantilla de Excel descargable. 
                      Los campos obligatorios son: nombres y teléfono.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {uploadStep === 'preview' && previewData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {previewData.resumen.validos}
                      </div>
                      <p className="text-sm text-muted-foreground">Válidos</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {previewData.resumen.conErrores}
                      </div>
                      <p className="text-sm text-muted-foreground">Con errores</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {previewData.resumen.duplicadosEnArchivo || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Duplicados en archivo</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {previewData.resumen.existentesEnDB || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Ya en BD</p>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Nombres</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.contactos.slice(0, 50).map((contacto: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{contacto.fila}</TableCell>
                            <TableCell>{contacto.nombres}</TableCell>
                            <TableCell>{contacto.telefono}</TableCell>
                            <TableCell>{contacto.correo}</TableCell>
                            <TableCell>
                              {contacto.valid && !contacto.exists ? (
                                contacto.existsInDB ? (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Existe en BD
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Válido
                                  </Badge>
                                )
                              ) : contacto.exists ? (
                                <Badge variant="secondary">
                                  <X className="w-3 h-3 mr-1" />
                                  Duplicado en archivo
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {contacto.errors?.map((error: string, i: number) => (
                                  <div key={i} className="text-red-600">{error}</div>
                                ))}
                                {contacto.warnings?.map((warning: string, i: number) => (
                                  <div key={i} className="text-yellow-600">{warning}</div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setUploadStep('upload')}>
                      Volver
                    </Button>
                    <Button 
                      onClick={() => setUploadStep('campaign')}
                      disabled={previewData.resumen.validos === 0}
                    >
                      Continuar ({previewData.resumen.validos} contactos)
                    </Button>
                  </div>
                </div>
              )}
              
              {uploadStep === 'campaign' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Seleccionar Campaña</h3>
                  <p className="text-muted-foreground">
                    Los contactos se asociarán a la campaña seleccionada
                  </p>
                  
                  <Select value={selectedCampanaForUpload} onValueChange={setSelectedCampanaForUpload}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campaña..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campanas.map((campana) => (
                        <SelectItem key={campana.id} value={campana.id.toString()}>
                          {campana.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setUploadStep('preview')}>
                      Volver
                    </Button>
                    <Button 
                      onClick={handleMassInsert}
                      disabled={!selectedCampanaForUpload}
                    >
                      Insertar Contactos
                    </Button>
                  </div>
                </div>
              )}
              
              {uploadStep === 'inserting' && (
                <div className="space-y-6 text-center">
                  <h3 className="text-lg font-medium">Insertando contactos...</h3>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-muted-foreground">
                    Por favor espera mientras se procesan los contactos
                  </p>
                  {uploadProgress === 100 && (
                    <div className="text-green-600 font-medium">
                      ✅ Contactos insertados exitosamente
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCampaignDialogOpen} onOpenChange={(open) => {
            if (!open) resetCampaignStates()
            setIsCampaignDialogOpen(open)
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <MessageCircle className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Campaña</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Nombre de la campaña</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Ej: Reactivación Leads Enero"
                  />
                </div>
                
                <div>
                  <Label htmlFor="campaign-description">Descripción</Label>
                  <Textarea
                    id="campaign-description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder="Descripción de la campaña..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="campaign-template">Template</Label>
                  <Select 
                    value={newCampaign.selectedTemplate} 
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, selectedTemplate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newCampaign.selectedTemplate && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Vista previa del mensaje:</p>
                      <p className="text-sm mt-1">
                        {templates.find(t => t.id.toString() === newCampaign.selectedTemplate)?.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={resetCampaignStates}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={isCreatingCampaign || !newCampaign.name.trim()}
                  >
                    {isCreatingCampaign ? "Creando..." : "Crear Campaña"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campanas.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge className={getStatusColor(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.description && (
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              )}
              
              {campaign.template && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Template: {campaign.template.name}</p>
                  <p className="text-sm">{campaign.template.message}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{campaign.recipients || 0}</div>
                  <p className="text-xs text-muted-foreground">Contactos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.responses || 0}</div>
                  <p className="text-xs text-muted-foreground">Enviados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.conversions || 0}</div>
                  <p className="text-xs text-muted-foreground">Respuestas</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleSendCampaign(campaign.id)}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Enviar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Estadísticas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plantillas de Mensajes</CardTitle>
            <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
              if (!open) resetTemplateStates()
              setIsTemplateDialogOpen(open)
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nombre del template</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Ej: Saludo inicial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-message">Mensaje</Label>
                    <Textarea
                      id="template-message"
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                      placeholder="Hola {nombre}, te contactamos desde..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetTemplateStates}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate} disabled={isCreatingTemplate}>
                      {isCreatingTemplate ? "Creando..." : "Crear Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template: any) => (
              <Card key={template.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{template.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useTemplateInCampaign(template.id.toString())}
                    >
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.message}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {campanas.filter((c: any) => c.status === 'activa').length}
              </div>
              <p className="text-sm text-muted-foreground">Campañas activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {campanas.reduce((sum: number, c: any) => sum + (c.recipients || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total contactos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {campanas.reduce((sum: number, c: any) => sum + (c.responses || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Mensajes enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {(() => {
                  const totalResponses = campanas.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0)
                  const totalSent = campanas.reduce((sum: number, c: any) => sum + (c.responses || 0), 0)
                  return totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0
                })()}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de respuesta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}