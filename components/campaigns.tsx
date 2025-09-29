"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, Send, MessageCircle, TrendingUp, Plus } from "lucide-react"

// Hook para obtener campañas desde la API
function useCampanas() {
  const [campanas, setCampanas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampanas = () => {
    setLoading(true)
    fetch("/api/campanas")
      .then((res) => res.json())
      .then((data) => {
        console.log("📋 Campañas desde API:", data)
        setCampanas(data)
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
        console.log("📋 Templates desde API:", data)
        setTemplates(data)
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

export function Campaigns() {
  const { campanas, loading: campanasLoading, refetchCampanas } = useCampanas()
  const { templates, loading: templatesLoading, refetchTemplates } = useTemplates()
  const { toast } = useToast()

  // Estados para crear campaña
  const [isCreating, setIsCreating] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    selectedTemplate: ""
  })

  // Estados para crear template
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
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
      case "programada":
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "activa":
        return "Activa"
      case "enviada":
        return "Enviada"
      case "draft":
      case "borrador":
        return "Borrador"
      case "programada":
      case "scheduled":
        return "Programada"
      default:
        return status || "Desconocido"
    }
  }

  const handleCreateCampaign = async () => {
    try {
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
        setNewCampaign({ 
          name: "", 
          description: "", 
          selectedTemplate: ""
        })
        setIsCreating(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error al crear campaña",
          description: error.error || "No se pudo crear la campaña",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    }
  }

  const handleCreateTemplate = async () => {
    try {
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
        setNewTemplate({ name: "", message: "" })
        setIsCreatingTemplate(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error al crear template",
          description: error.error || "No se pudo crear el template",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    }
  }

  const useTemplateInCampaign = (templateId: string) => {
    setNewCampaign({
      ...newCampaign,
      selectedTemplate: templateId
    })
    setIsCreating(true)
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
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
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
                <Label htmlFor="campaign-description">Descripción (opcional)</Label>
                <Textarea
                  id="campaign-description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Descripción de la campaña"
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
                    <SelectValue placeholder="Seleccionar template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newCampaign.selectedTemplate && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Vista previa del mensaje:</p>
                    <p className="text-sm text-muted-foreground">
                      {templates.find((t: any) => t.id.toString() === newCampaign.selectedTemplate)?.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name || !newCampaign.selectedTemplate}
                >
                  Crear Campaña
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Lista de Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Arrastra tu archivo Excel aquí</p>
            <p className="text-muted-foreground mb-4">o haz clic para seleccionar</p>
            <Button variant="outline">Seleccionar archivo</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Formato requerido:</strong> Excel (.xlsx) con columnas: Nombre, Teléfono, Email, Segmento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campanas.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge className={getStatusColor(campaign.status)}>{getStatusText(campaign.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{campaign.message}</p>
                {campaign.template && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Template: {campaign.template.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{campaign.recipients}</div>
                  <p className="text-xs text-muted-foreground">Destinatarios</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{campaign.responses}</div>
                  <p className="text-xs text-muted-foreground">Respuestas</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{campaign.conversions}</div>
                  <p className="text-xs text-muted-foreground">Conversiones</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {campaign.description && (
                    <span className="block">{campaign.description}</span>
                  )}
                </span>
                {campaign.sentDate && <span>Enviada: {campaign.sentDate}</span>}
              </div>

              <div className="flex gap-2">
                {(campaign.status === "draft" || campaign.status === "borrador") && (
                  <Button size="sm" className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                )}
                {(campaign.status === "activa" || campaign.status === "enviada") && (
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver métricas
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plantillas de Mensajes</CardTitle>
            <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nombre del template</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Ej: Reactivación de Leads"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-message">Mensaje</Label>
                    <Textarea
                      id="template-message"
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                      placeholder="Escribe el mensaje del template..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateTemplate}
                      disabled={!newTemplate.name || !newTemplate.message}
                    >
                      Crear Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {templatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id} className="p-4">
                  <h4 className="font-medium mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {template.message}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => useTemplateInCampaign(template.id.toString())}
                    >
                      Usar en campaña
                    </Button>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
              
              {templates.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No hay templates disponibles</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsCreatingTemplate(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primer template
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {campanas.filter((c: any) => c.status === "activa" || c.status === "enviada").length}
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
              <p className="text-sm text-muted-foreground">Total destinatarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {campanas.reduce((sum: number, c: any) => sum + (c.responses || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total respuestas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {(() => {
                  const totalResponses = campanas.reduce((sum: number, c: any) => sum + (c.responses || 0), 0)
                  const totalRecipients = campanas.reduce((sum: number, c: any) => sum + (c.recipients || 0), 0)
                  return totalRecipients > 0 ? Math.round((totalResponses / totalRecipients) * 100) : 0
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
