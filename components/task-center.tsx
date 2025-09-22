"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, User, Phone, Calendar, CheckCircle2, ArrowLeft } from "lucide-react"

const tasksData = [
  {
    id: 1,
    title: "Llamar a María González",
    description: "Seguimiento post-visita, confirmar inscripción",
    priority: "I",
    leadName: "María González",
    segment: "C1",
    dueDate: "2024-01-16",
    status: "pending",
    type: "call",
  },
  {
    id: 2,
    title: "Agendar visita Carlos Ruiz",
    description: "Coordinar horario para visita al local",
    priority: "I",
    leadName: "Carlos Ruiz",
    segment: "C2",
    dueDate: "2024-01-16",
    status: "pending",
    type: "schedule",
  },
  {
    id: 3,
    title: "Enviar información Ana López",
    description: "Enviar detalles de horarios y precios",
    priority: "II",
    leadName: "Ana López",
    segment: "C1",
    dueDate: "2024-01-17",
    status: "pending",
    type: "follow-up",
  },
  {
    id: 4,
    title: "Seguimiento Pedro Martín",
    description: "Verificar interés después de 1 semana",
    priority: "III",
    leadName: "Pedro Martín",
    segment: "C3",
    dueDate: "2024-01-18",
    status: "pending",
    type: "follow-up",
  },
  {
    id: 5,
    title: "Confirmar clase de prueba",
    description: "Recordar cita de mañana a las 10:00 AM",
    priority: "I",
    leadName: "Lucía Fernández",
    segment: "C1",
    dueDate: "2024-01-16",
    status: "completed",
    type: "reminder",
  },
  {
    id: 6,
    title: "Contactar Roberto Silva",
    description: "Primera llamada de contacto",
    priority: "II",
    leadName: "Roberto Silva",
    segment: "C2",
    dueDate: "2024-01-17",
    status: "pending",
    type: "call",
  },
  {
    id: 7,
    title: "Preparar clase de prueba Carmen",
    description: "Coordinar instructor y horario",
    priority: "II",
    leadName: "Carmen Torres",
    segment: "C1",
    dueDate: "2024-01-17",
    status: "pending",
    type: "schedule",
  },
  {
    id: 8,
    title: "Seguimiento final Diego",
    description: "Última oportunidad de contacto",
    priority: "IV",
    leadName: "Diego Morales",
    segment: "C3",
    dueDate: "2024-01-19",
    status: "pending",
    type: "follow-up",
  },
]

export function TaskCenter() {
  const [tasks, setTasks] = useState(tasksData)
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)

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

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: task.status === "pending" ? "completed" : "pending" } : task,
      ),
    )
  }

  const priorityGroups = {
    I: tasks.filter((task) => task.priority === "I"),
    II: tasks.filter((task) => task.priority === "II"),
    III: tasks.filter((task) => task.priority === "III"),
    IV: tasks.filter((task) => task.priority === "IV"),
  }

  const handlePriorityClick = (priority: string) => {
    setSelectedPriority(priority)
  }

  const handleBackToOverview = () => {
    setSelectedPriority(null)
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
                  <TableHead>Tarea</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityTasks.map((task) => (
                  <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => toggleTaskStatus(task.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className={`flex items-center gap-2 ${task.status === "completed" ? "line-through" : ""}`}>
                        {getTypeIcon(task.type)}
                        {task.title}
                      </div>
                    </TableCell>
                    <TableCell>{task.leadName}</TableCell>
                    <TableCell>
                      <Badge className={getSegmentColor(task.segment)}>{task.segment}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{task.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
                    {tasks.filter((t) => t.status === "pending").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-green-600">
                    {tasks.filter((t) => t.status === "completed").length}
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
                {tasks.filter((t) => t.priority === "I" && t.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Urgentes pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <p className="text-sm text-muted-foreground">Completadas hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Total pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de completado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
