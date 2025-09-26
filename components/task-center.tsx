"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  MessageCircle,
  FileText 
} from "lucide-react"

const tasksData = [
  {
    id: 1,
    title: "Llamar a María González",
    description: "Seguimiento post-visita, confirmar inscripción",
    priority: "I",
    leadName: "María González",
    segment: "C1",
    phone: "999-111-111",
    district: "Miraflores",
    email: "maria.gonzalez@email.com",
    status_asesor: "Visita agendada",
    dueDate: "2024-01-16",
    status: "pending",
    type: "call",
    id_contacto: 1,
  },
  {
    id: 2,
    title: "Agendar visita Carlos Ruiz",
    description: "Coordinar horario para visita al local",
    priority: "I",
    leadName: "Carlos Ruiz",
    segment: "C2",
    phone: "999-222-222",
    district: "San Isidro",
    email: "carlos.ruiz@email.com",
    status_asesor: "Volver a contactar",
    dueDate: "2024-01-16",
    status: "pending",
    type: "schedule",
    id_contacto: 2,
  },
  {
    id: 3,
    title: "Enviar información Ana López",
    description: "Enviar detalles de horarios y precios",
    priority: "II",
    leadName: "Ana López",
    segment: "C1",
    phone: "999-333-333",
    district: "Surco",
    email: "ana.lopez@email.com",
    status_asesor: "No contesta",
    dueDate: "2024-01-17",
    status: "pending",
    type: "follow-up",
    id_contacto: 3,
  },
  {
    id: 4,
    title: "Seguimiento Pedro Martín",
    description: "Verificar interés después de 1 semana",
    priority: "III",
    leadName: "Pedro Martín",
    segment: "C3",
    phone: "999-444-444",
    district: "La Molina",
    email: "pedro.martin@email.com",
    status_asesor: "En seguimiento",
    dueDate: "2024-01-18",
    status: "pending",
    type: "follow-up",
    id_contacto: 4,
  },
  {
    id: 5,
    title: "Confirmar clase de prueba",
    description: "Recordar cita de mañana a las 10:00 AM",
    priority: "I",
    leadName: "Lucía Fernández",
    segment: "C1",
    phone: "999-555-555",
    district: "Barranco",
    email: "lucia.fernandez@email.com",
    status_asesor: "Enrolado",
    dueDate: "2024-01-16",
    status: "completed",
    type: "reminder",
    id_contacto: 5,
  },
]

// Hook para obtener las tareas desde la API
function useTareas() {
  const [tareas, setTareas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTareas = () => {
    setLoading(true)
    fetch("/api/tareas")
      .then((res) => res.json())
      .then((data) => {
        console.log("📋 Tareas desde API:", data)
        setTareas(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("❌ Error cargando tareas:", error)
        setTareas(tasksData) // Fallback a datos estáticos
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTareas()
  }, [])

  return { tareas, loading, refetchTareas: fetchTareas }
}

export function TaskCenter() {
  const { tareas, loading, refetchTareas } = useTareas()
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)

  // Estados para modales (igual que en contactos)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [visitModalOpen, setVisitModalOpen] = useState(false)
  const [creditModalOpen, setCreditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [callNotes, setCallNotes] = useState("")
  const [callResult, setCallResult] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [visitTime, setVisitTime] = useState("")
  const [visitNotes, setVisitNotes] = useState("")
  const [creditScore, setCreditScore] = useState("")
  const [dni, setDni] = useState("")
  const [interestLevel, setInterestLevel] = useState("")

  // Estados para conversación
  const [convOpen, setConvOpen] = useState(false)
  const [convLoading, setConvLoading] = useState(false)
  const [convError, setConvError] = useState<string | null>(null)
  const [convMsgs, setConvMsgs] = useState<
    { id: string; text: string; from: "bot" | "usuario"; fechaTexto: string }[]
  >([])

  const { toast } = useToast()

  // Agrupar tareas por prioridad
  const priorityGroups = tareas.reduce((acc: any, task: any) => {
    const priority = task.priority
    if (!acc[priority]) {
      acc[priority] = []
    }
    acc[priority].push(task)
    return acc
  }, {} as Record<string, any[]>)

  // Debug: mostrar agrupación
  console.log("🏷️ Agrupación de tareas:", priorityGroups)
  console.log("📊 Total tareas recibidas:", tareas.length)
  console.log("🔍 Detalle por prioridad:")
  Object.entries(priorityGroups).forEach(([priority, tasks]) => {
    console.log(`  - Prioridad ${priority}: ${tasks.length} tareas`)
    tasks.forEach((task: any, index: number) => {
      console.log(`    ${index + 1}. ${task.leadName} (ID: ${task.id})`)
    })
  })

  // Asegurar que todas las prioridades existan aunque estén vacías
  if (!priorityGroups["I"]) priorityGroups["I"] = []
  if (!priorityGroups["II"]) priorityGroups["II"] = []
  if (!priorityGroups["III"]) priorityGroups["III"] = []
  if (!priorityGroups["IV"]) priorityGroups["IV"] = []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "I":
        return "bg-red-100 text-red-800 border-red-200"
      case "II":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "III":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "IV":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "C1":
        return "bg-accent text-accent-foreground"
      case "C2":
        return "bg-primary text-primary-foreground"
      case "C3":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />
      case "schedule":
        return <Calendar className="w-4 h-4" />
      case "follow-up":
        return <User className="w-4 h-4" />
      case "reminder":
        return <Clock className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getStatusAsesorColor = (estado_accion_comercial: string) => {
    switch (estado_accion_comercial) {
      case "No contesta":
        return "bg-blue-100 text-blue-800"
      case "Volver a contactar":
        return "bg-yellow-100 text-yellow-800"
      case "Visita agendada":
        return "bg-green-100 text-green-800"
      case "Linea ocupada":
        return "bg-purple-100 text-purple-800"
      case "En seguimiento":
        return "bg-orange-100 text-orange-800"
      case "Enrolado":
        return "bg-emerald-100 text-emerald-800"
      case "No interesado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Funciones para abrir modales
  const handleCallAction = (lead: any) => {
    console.log("handleCallAction ejecutada para:", lead.leadName);
    setSelectedLead(lead)
    setCallModalOpen(true)
    setCallNotes("")
    setCallResult("")
  }

  const handleVisitAction = (lead: any) => {
    console.log("handleVisitAction ejecutada para:", lead.leadName);
    setSelectedLead(lead)
    setVisitModalOpen(true)
    setVisitDate("")
    setVisitTime("")
    setVisitNotes("")
  }

  const handleCreditAction = (lead: any) => {
    console.log("handleCreditAction ejecutada para:", lead.leadName);
    setSelectedLead(lead)
    setCreditModalOpen(true)
    setCreditScore("")
    setDni("")
    setInterestLevel("")
  }

  // Función para abrir conversación
  const openConversation = async (lead: any) => {
    console.log("openConversation ejecutada para:", lead.leadName);
    setSelectedLead(lead)
    setConvOpen(true)
    setConvLoading(true)
    setConvError(null)
    setConvMsgs([])

    try {
      const res = await fetch(`/api/conversacion/${lead.id_contacto}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setConvMsgs(data.conversaciones ?? [])
    } catch (e: any) {
      setConvError("No se pudo cargar la conversación")
    } finally {
      setConvLoading(false)
    }
  }

  // Funciones para guardar acciones
  const saveCall = () => {
    if (["No contesta", "Volver a contactar", "Linea ocupada", "No interesado"].includes(callResult)) {
      fetch("/api/tareas/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tarea: selectedLead.id, // Usar ID de la tarea, no del contacto
          estado: callResult,
          nota: callNotes,
          tipo_accion: 'llamada'
        }),
      })
      .then(res => {
        if (res.ok) {
          toast({
            title: "Acción comercial registrada",
            description: `La llamada (${callResult}) fue registrada correctamente.`,
          });
          refetchTareas(); // Refrescar datos después de la acción
        } else {
          toast({
            title: "Error al registrar llamada",
            description: "No se pudo guardar la acción comercial.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor.",
          variant: "destructive"
        });
      });
    }
    setCallModalOpen(false);
    setSelectedLead(null);
  }

  const saveVisit = async () => {
    if (!selectedLead) return;
    const fechaHora = `${visitDate}T${visitTime}:00-05:00`;
    try {
      const res = await fetch("/api/tareas/cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tarea: selectedLead.id, // Usar ID de la tarea
          fechaHora,
          notas: visitNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Cita agendada con éxito",
          description: data.message || `La cita para ${selectedLead.leadName} fue registrada correctamente.`,
        });
        refetchTareas(); // Refrescar datos después de la acción
      } else {
        toast({
          title: "Error al agendar cita",
          description: "No se pudo registrar la cita. Intenta nuevamente.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive"
      });
    }
    setVisitModalOpen(false);
    setSelectedLead(null);
  }

  const saveCredit = () => {
    // Registrar variables como acción comercial en la tarea
    if (selectedLead && creditScore && dni && interestLevel) {
      const nota = `Score: ${creditScore}, DNI: ${dni}, Interés: ${interestLevel}`;
      
      fetch("/api/tareas/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tarea: selectedLead.id,
          estado: 'Variables registradas',
          nota: nota,
          tipo_accion: 'registro_variables'
        }),
      })
      .then(res => {
        if (res.ok) {
          toast({
            title: "Variables registradas",
            description: `Las variables de ${selectedLead.leadName} fueron guardadas correctamente.`,
          });
          refetchTareas(); // Refrescar datos después de la acción
        } else {
          toast({
            title: "Error al registrar variables",
            description: "No se pudieron guardar las variables.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor.",
          variant: "destructive"
        });
      });
    }
    setCreditModalOpen(false)
    setSelectedLead(null)
  }

  const handlePriorityClick = (priority: string) => {
    setSelectedPriority(priority)
  }

  const handleBackToOverview = () => {
    setSelectedPriority(null)
  }

  // Mostrar loading mientras cargan los datos
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando tareas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (selectedPriority) {
    const priorityTasks = priorityGroups[selectedPriority as keyof typeof priorityGroups]

    return (
      <div className="p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToOverview}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prioridad {selectedPriority}</h1>
            <p className="text-muted-foreground">{priorityTasks.length} tareas en esta prioridad</p>
          </div>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tareas Prioridad {selectedPriority}
              <Badge className={getPriorityColor(selectedPriority)}>{priorityTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Estado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Estado asesor</TableHead>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityTasks.map((task: any) => (
                  <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                    <TableCell>
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status === "completed" ? "✓" : "○"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{task.leadName}</TableCell>
                    <TableCell>
                      <Badge className={getSegmentColor(task.segment)}>{task.segment}</Badge>
                    </TableCell>
                    <TableCell>{task.phone}</TableCell>
                    <TableCell>{task.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusAsesorColor(task.status_asesor)}>
                        {task.status_asesor}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${task.status === "completed" ? "line-through" : ""}`}>
                        {getTypeIcon(task.type)}
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Modal de Conversación */}
                        <Dialog open={convOpen} onOpenChange={setConvOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                console.log("Abriendo conversación para:", task.leadName);
                                openConversation(task);
                              }}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Conversación con {task.leadName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {convLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
                              {convError && <p className="text-sm text-red-600">{convError}</p>}

                              {!convLoading && !convError && convMsgs.map((m) => {
                                const isUser = m.from === "usuario";
                                return (
                                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div
                                      className={`max-w-[75%] rounded-lg px-3 py-2
                                        ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}
                                      `}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">
                                        <strong className="mr-1">{isUser ? "Contacto" : "Bot"}:</strong>
                                        {m.text}
                                      </p>
                                      <span className={`block mt-1 text-[10px] opacity-70 ${isUser ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                        {m.fechaTexto}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {!convLoading && !convError && convMsgs.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin mensajes.</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log("Abriendo modal de llamada para:", task.leadName);
                            handleCallAction(task);
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log("Abriendo modal de visita para:", task.leadName);
                            handleVisitAction(task);
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log("Abriendo modal de variables para:", task.leadName);
                            handleCreditAction(task);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* MODALES - En el mismo scope que los botones */}
        
        {/* Modal de Llamada */}
        <Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Llamada - {selectedLead?.leadName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="call-result">Resultado de la llamada</Label>
                <Select value={callResult} onValueChange={setCallResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No contesta">No contesta</SelectItem>
                    <SelectItem value="Linea ocupada">Línea ocupada</SelectItem>
                    <SelectItem value="Volver a contactar">Volver a contactar</SelectItem>
                    <SelectItem value="No interesado">No interesado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="call-notes">Notas de la llamada</Label>
                <Textarea
                  id="call-notes"
                  placeholder="Escribe las notas de la conversación..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCallModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCall} disabled={!callResult}>
                  Guardar Llamada
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Visita */}
        <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Visita - {selectedLead?.leadName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visit-date">Fecha</Label>
                  <Input id="visit-date" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="visit-time">Hora</Label>
                  <Select value={visitTime} onValueChange={setVisitTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                      <SelectItem value="17:00">05:00 PM</SelectItem>
                      <SelectItem value="18:00">06:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="visit-notes">Notas adicionales</Label>
                <Textarea
                  id="visit-notes"
                  placeholder="Información adicional sobre la visita..."
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setVisitModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveVisit} disabled={!visitDate || !visitTime}>
                  Agendar Visita
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Variables */}
        <Dialog open={creditModalOpen} onOpenChange={setCreditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Variables - {selectedLead?.leadName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="credit-score">Score Crediticio</Label>
                <Input
                  id="credit-score"
                  type="number"
                  placeholder="Ej: 750"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                  min="300"
                  max="850"
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  placeholder="Ej: 12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                />
              </div>
              <div>
                <Label htmlFor="interest-level">Nivel de Interés</Label>
                <Select value={interestLevel} onValueChange={setInterestLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel de interés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muy-alto">Muy Alto</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="bajo">Bajo</SelectItem>
                    <SelectItem value="muy-bajo">Muy Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCreditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCredit} disabled={!creditScore || !dni || !interestLevel}>
                  Guardar Variables
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Tareas</h1>
          <p className="text-muted-foreground">Gestión de tareas por prioridad</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive">{priorityGroups["I"].length} Prioridad I</Badge>
          <Badge variant="secondary">{priorityGroups["II"].length} Prioridad II</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(priorityGroups).map(([priority, tasks]) => (
          <Card
            key={priority}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handlePriorityClick(priority)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Prioridad {priority}</span>
                <Badge className={getPriorityColor(priority)}>{tasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {priorityGroups[priority].filter((t: any) => t.status === "pending").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-green-600">
                    {priorityGroups[priority].filter((t: any) => t.status === "completed").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tareas.filter((t) => t.priority === "I" && t.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Urgentes pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tareas.filter((t: any) => t.status === "completed").length}
              </div>
              <p className="text-sm text-muted-foreground">Completadas hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tareas.filter((t: any) => t.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Total pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tareas.length > 0 ? Math.round((tareas.filter((t) => t.status === "completed").length / tareas.length) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de completado</p>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}
