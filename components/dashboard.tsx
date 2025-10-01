"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Clock, Target, Phone, CalendarIcon, UserCheck, ArrowRight } from "lucide-react"

type FunnelAPI = {
  leadsNuevo: number
  llamadasAgendadas: number
  enrolados: number
  eficienciaBot: number
  eficienciaAsesor: number
}
type SegmentAPIItem = { name: string; count: number; percentage: number }
type SegmentAPIResponse = { total: number; segments: SegmentAPIItem[] }

const conversionData = [
  { name: "Ene", leads: 45, converted: 12 },
  { name: "Feb", leads: 52, converted: 18 },
  { name: "Mar", leads: 38, converted: 15 },
  { name: "Abr", leads: 61, converted: 22 },
  { name: "May", leads: 55, converted: 19 },
  { name: "Jun", leads: 67, converted: 28 },
]

// const segmentData = [
//   { name: "C1", value: 45, color: "#ff0000" },
//   { name: "C2", value: 35, color: "#000000" },
//   { name: "C3", value: 20, color: "#6b7280" },
// ]

const timeData = [
  { name: "Lun", time: 2.5 },
  { name: "Mar", time: 3.2 },
  { name: "Mié", time: 1.8 },
  { name: "Jue", time: 2.9 },
  { name: "Vie", time: 2.1 },
  { name: "Sáb", time: 4.2 },
  { name: "Dom", time: 3.8 },
]

const advisorData = [
  { name: "María González", leads: 45, llamadas: 38, enrolados: 15, conversion: 33.3 },
  { name: "Carlos Ruiz", leads: 52, llamadas: 41, enrolados: 18, conversion: 34.6 },
  { name: "Ana López", leads: 38, llamadas: 32, enrolados: 12, conversion: 31.6 },
  { name: "Luis Torres", leads: 41, llamadas: 35, enrolados: 14, conversion: 34.1 },
]

// const funnelData = [
//   { stage: "Leads", count: 176, percentage: 100 },
//   { stage: "Llamadas Agendadas", count: 146, percentage: 83 },
//   { stage: "Enrolados", count: 59, percentage: 34 },
// ]

export function Dashboard() {
  const [funnel, setFunnel] = useState<FunnelAPI>({
    leadsNuevo: 0,
    llamadasAgendadas: 0,
    enrolados: 0,
    eficienciaBot: 0,
    eficienciaAsesor: 0,
  });

  const [segments, setSegments] = useState<SegmentAPIItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [funnelRes, segRes] = await Promise.all([
          fetch("/api/dashboard/funnel", { cache: "no-store" }),
          fetch("/api/dashboard/segments", { cache: "no-store" }),
        ]);

        const funnelData: FunnelAPI = await funnelRes.json();
        setFunnel(funnelData);

        const segData: SegmentAPIResponse = await segRes.json();
        setSegments(segData.segments ?? []);
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      }
    })();
  }, []);

  const percentLlamadas =
    funnel.leadsNuevo > 0
      ? Math.round((funnel.llamadasAgendadas / funnel.leadsNuevo) * 100)
      : 0;

  const percentEnrolados =
    funnel.leadsNuevo > 0
      ? Math.round((funnel.enrolados / funnel.leadsNuevo) * 100)
      : 0;

  const funnelData = [
    { stage: "Leads", count: funnel.leadsNuevo, percentage: 100 },
    { stage: "Llamadas Agendadas", count: funnel.llamadasAgendadas, percentage: percentLlamadas },
    { stage: "Enrolados", count: funnel.enrolados, percentage: percentEnrolados },
  ];

  // Mapea segmentos a formato para recharts Pie
  const pieData = segments.map(s => ({ name: s.name, value: s.count, percentage: s.percentage }));

  // Paleta básica (puedes cambiarla por tu brand)
  const palette = ["#ef4444", "#0f172a", "#6b7280", "#f97316", "#22c55e", "#3b82f6", "#a855f7"];
  const colorFor = (idx: number) => palette[idx % palette.length];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del CRM</p>
        </div>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          En vivo
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
            <Progress value={33.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">176</div>
            <p className="text-xs text-muted-foreground">+15 nuevos esta semana</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8h</div>
            <p className="text-xs text-muted-foreground">Lead a agendado</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">59/70 inscripciones</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Embudo de Conversión: Lead → Llamada Agendada → Enrolado</CardTitle>
          <p className="text-sm text-muted-foreground">Primera flecha: Bot | Segunda flecha: Asesor</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-8">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-accent-foreground">{stage.count}</span>
                  </div>
                  <h3 className="font-semibold text-sm">{stage.stage}</h3>
                  <p className="text-xs text-muted-foreground">{stage.percentage}%</p>
                </div>
                {index < funnelData.length - 1 && <ArrowRight className="mx-8 h-8 w-8 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Eficiencia del Bot</h4>
              <p className="text-2xl font-bold text-accent">{funnel.eficienciaBot}%</p>
              <p className="text-xs text-muted-foreground">Lead → Llamada Agendada</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Eficiencia del Asesor</h4>
              <p className="text-2xl font-bold text-accent">{funnel.eficienciaAsesor}%</p>
              <p className="text-xs text-muted-foreground">Llamada → Enrolado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisor Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Rendimiento de Asesores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advisorData.map((advisor) => (
              <div key={advisor.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{advisor.name}</h3>
                  <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                    <span>Leads: {advisor.leads}</span>
                    <span>Llamadas: {advisor.llamadas}</span>
                    <span>Enrolados: {advisor.enrolados}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">{advisor.conversion}%</div>
                  <p className="text-xs text-muted-foreground">Conversión</p>
                </div>
                <div className="ml-4">
                  <Progress value={advisor.conversion} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversión de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#6b7280" name="Leads" />
                <Bar dataKey="converted" fill="#ff0000" name="Convertidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
<Card>
          <CardHeader>
            <CardTitle>Segmentación de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorFor(index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, _name: string, props: any) => {
                    const pct = props?.payload?.percentage ?? 0;
                    return [`${value} (${pct}%)`, props.payload.name];}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin datos de segmentación</span>
              ) : (
                pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorFor(idx) }} />
                    <span className="text-sm">
                      {item.name}: {item.percentage}% ({item.value})
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Tiempo de Conversión del Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#ff0000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Próximas Actividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Llamada con María González</p>
                <p className="text-xs text-muted-foreground">Hoy, 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Visita de Carlos Ruiz</p>
                <p className="text-xs text-muted-foreground">Mañana, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Seguimiento Ana López</p>
                <p className="text-xs text-muted-foreground">Mañana, 4:30 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Prioridad I</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Prioridad II</span>
              <Badge variant="secondary">7</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Prioridad III</span>
              <Badge variant="outline">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Prioridad IV</span>
              <Badge variant="outline">8</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
