"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, Send, MessageCircle, TrendingUp } from "lucide-react"

const campaignsData = [
  {
    id: 1,
    name: "Reactivación Leads C1",
    message: "¡Hola! ¿Sigues interesado en nuestras clases de música? Tenemos promociones especiales este mes.",
    segment: "C1",
    status: "sent",
    sentDate: "2024-01-15",
    recipients: 23,
    responses: 8,
    conversions: 3,
  },
  {
    id: 2,
    name: "Seguimiento Visitas Pendientes",
    message: "Te recordamos tu visita programada. ¿Necesitas cambiar el horario?",
    segment: "C2",
    status: "draft",
    sentDate: null,
    recipients: 15,
    responses: 0,
    conversions: 0,
  },
  {
    id: 3,
    name: "Promoción Clases de Verano",
    message: "¡Aprovecha nuestras clases de verano! Descuentos especiales hasta fin de mes.",
    segment: "all",
    status: "scheduled",
    sentDate: "2024-01-20",
    recipients: 67,
    responses: 0,
    conversions: 0,
  },
]

export function Campaigns() {
  const [campaigns, setCampaigns] = useState(campaignsData)
  const [isCreating, setIsCreating] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    segment: "all",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviada"
      case "draft":
        return "Borrador"
      case "scheduled":
        return "Programada"
      default:
        return "Desconocido"
    }
  }

  const handleCreateCampaign = () => {
    const campaign = {
      id: campaigns.length + 1,
      ...newCampaign,
      status: "draft",
      sentDate: null,
      recipients: 0,
      responses: 0,
      conversions: 0,
    }
    setCampaigns([...campaigns, campaign])
    setNewCampaign({ name: "", message: "", segment: "all" })
    setIsCreating(false)
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
                <Label htmlFor="campaign-segment">Segmento objetivo</Label>
                <Select
                  value={newCampaign.segment}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, segment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los leads</SelectItem>
                    <SelectItem value="C1">Solo C1</SelectItem>
                    <SelectItem value="C2">Solo C2</SelectItem>
                    <SelectItem value="C3">Solo C3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="campaign-message">Mensaje</Label>
                <Textarea
                  id="campaign-message"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  placeholder="Escribe el mensaje que se enviará a los leads..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCampaign}>Crear Campaña</Button>
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
        {campaigns.map((campaign) => (
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
                <span>Segmento: {campaign.segment === "all" ? "Todos" : campaign.segment}</span>
                {campaign.sentDate && <span>Enviada: {campaign.sentDate}</span>}
              </div>

              <div className="flex gap-2">
                {campaign.status === "draft" && (
                  <Button size="sm" className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                )}
                {campaign.status === "sent" && (
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
          <CardTitle>Plantillas de Mensajes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Reactivación de Leads</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "¡Hola [Nombre]! ¿Sigues interesado en nuestras clases de música? Tenemos promociones especiales este
                mes."
              </p>
              <Button size="sm" variant="outline">
                Usar plantilla
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Recordatorio de Visita</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "Te recordamos tu visita programada para mañana a las [Hora]. ¿Necesitas cambiar el horario?"
              </p>
              <Button size="sm" variant="outline">
                Usar plantilla
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Promoción Especial</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "¡Oferta especial! 20% de descuento en tu primera mensualidad. Válido hasta fin de mes."
              </p>
              <Button size="sm" variant="outline">
                Usar plantilla
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Seguimiento Post-Visita</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "¡Gracias por visitarnos! ¿Te gustaría agendar tu clase de prueba gratuita?"
              </p>
              <Button size="sm" variant="outline">
                Usar plantilla
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {campaigns.filter((c) => c.status === "sent").length}
              </div>
              <p className="text-sm text-muted-foreground">Campañas enviadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {campaigns.reduce((sum, c) => sum + c.recipients, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total destinatarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {campaigns.reduce((sum, c) => sum + c.responses, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total respuestas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(
                  (campaigns.reduce((sum, c) => sum + c.responses, 0) /
                    campaigns.reduce((sum, c) => sum + c.recipients, 0)) *
                    100,
                ) || 0}
                %
              </div>
              <p className="text-sm text-muted-foreground">Tasa de respuesta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
