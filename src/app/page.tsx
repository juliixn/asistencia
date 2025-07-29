
'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { initialEmployees, initialWorkLocations } from '@/lib/data';
import type {
  Employee,
  AttendanceRecord,
  AttendanceStatus,
  PayrollPeriod,
  LoanRequest,
} from '@/lib/types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Upload,
  User,
  FileDown,
  DollarSign,
  UserCheck,
  FileText,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { add, format, getDate, getDaysInMonth, startOfMonth, sub, isAfter, getMonth, getYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
  'Asistencia',
  'Retardo',
  'Falta',
  'Descanso',
  'Incapacidad',
  'Vacaciones',
  'Enfermedad',
  'Permiso C/S',
  'Permiso S/S',
];

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  Asistencia: 'bg-green-200 text-green-800 border border-green-300',
  Retardo: 'bg-yellow-200 text-yellow-800 border border-yellow-300',
  Falta: 'bg-red-200 text-red-800 border border-red-300',
  Descanso: 'bg-blue-200 text-blue-800 border border-blue-300',
  Incapacidad: 'bg-purple-200 text-purple-800 border border-purple-300',
  Vacaciones: 'bg-indigo-200 text-indigo-800 border border-indigo-300',
  Enfermedad: 'bg-pink-200 text-pink-800 border border-pink-300',
  'Permiso C/S': 'bg-cyan-200 text-cyan-800 border border-cyan-300',
  'Permiso S/S': 'bg-gray-200 text-gray-800 border border-gray-300',
};

const PIE_CHART_COLORS: Record<string, string> = {
  Asistencia: "hsl(var(--chart-1))",
  Falta: "hsl(var(--chart-2))",
  Retardo: "hsl(var(--chart-3))",
  Descanso: "hsl(var(--chart-4))",
  Otros: "hsl(var(--chart-5))",
}


export default function GuardianPayrollPage() {
  const { user, employee, loading } = useAuth();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [period, setPeriod] = React.useState<PayrollPeriod>('1-15');
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceRecord>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<{
    employee: Employee;
    day: number;
    shift: 'day' | 'night';
  } | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  // States for dashboard data
  const [dashboardStats, setDashboardStats] = React.useState({
    totalAttendance: 0,
    estimatedPayroll: 0,
    absencesAndLates: 0,
    activeLoans: 0,
    activeLoansAmount: 0,
    barChartData: [],
    pieChartData: [],
  });

  const { toast } = useToast();

  const calculateDashboardStats = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const attendanceData: Record<string, AttendanceRecord> = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    const loanData: LoanRequest[] = JSON.parse(localStorage.getItem('loanData') || '[]');
    const now = new Date();
    
    // --- Cards Stats ---
    const currentMonthRecords = Object.values(attendanceData).filter(r => {
        const recordDate = parseISO(r.date);
        return getYear(recordDate) === getYear(now) && getMonth(recordDate) === getMonth(now);
    });

    const totalAttendance = currentMonthRecords.filter(r => r.status === 'Asistencia').length;
    const absencesAndLates = currentMonthRecords.filter(r => r.status === 'Falta' || r.status === 'Retardo').length;

    const estimatedPayroll = currentMonthRecords
        .filter(r => r.status === 'Asistencia')
        .reduce((acc, r) => {
            const employee = initialEmployees.find(e => e.id === r.employeeId);
            return acc + (employee?.shiftRate || 0);
        }, 0);
    
    const activeLoans = loanData.filter(l => l.status === 'Aprobado');
    const activeLoansAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);

    // --- Pie Chart Stats ---
    const periodStartDay = period === '1-15' ? 1 : 16;
    const daysInMonth = getDaysInMonth(currentDate);
    const periodEndDay = period === '1-15' ? 15 : daysInMonth;

    const periodRecords = Object.values(attendanceData).filter(r => {
        const recordDate = parseISO(r.date);
        const recordDay = getDate(recordDate);
        return getYear(recordDate) === getYear(currentDate) && getMonth(recordDate) === getMonth(currentDate) && recordDay >= periodStartDay && recordDay <= periodEndDay;
    });

    const pieChartDataRaw = periodRecords.reduce((acc, record) => {
        const status = record.status;
        if (['Asistencia', 'Falta', 'Retardo', 'Descanso'].includes(status)) {
            acc[status] = (acc[status] || 0) + 1;
        } else {
            acc['Otros'] = (acc['Otros'] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(pieChartDataRaw).map(([name, value]) => ({
      name,
      value,
      fill: PIE_CHART_COLORS[name] || PIE_CHART_COLORS['Otros'],
    }));

    // --- Bar Chart Stats ---
    const sixMonthsAgo = sub(startOfMonth(now), { months: 5 });
    const monthLabels = Array.from({ length: 6 }, (_, i) => format(add(sixMonthsAgo, { months: i }), 'MMMM', { locale: es }));
    
    const barChartData = monthLabels.map((monthLabel, i) => {
      const targetMonth = add(sixMonthsAgo, { months: i });
      const monthRecords = Object.values(attendanceData).filter(r => {
        const recordDate = parseISO(r.date);
        return getYear(recordDate) === getYear(targetMonth) && getMonth(recordDate) === getMonth(targetMonth);
      });
      
      return {
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        Asistencias: monthRecords.filter(r => r.status === 'Asistencia').length,
        Faltas: monthRecords.filter(r => r.status === 'Falta').length,
      };
    });

    setDashboardStats({
      totalAttendance,
      estimatedPayroll,
      absencesAndLates,
      activeLoans: activeLoans.length,
      activeLoansAmount: activeLoansAmount,
      barChartData: barChartData as [],
      pieChartData: pieChartData as [],
    });

  }, [currentDate, period]);


  React.useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        const storedAttendance = localStorage.getItem('attendanceData');
        if (storedAttendance) {
            setAttendance(JSON.parse(storedAttendance));
        }
    }
  }, []);

  React.useEffect(() => {
    if (isClient) {
      localStorage.setItem('attendanceData', JSON.stringify(attendance));
      calculateDashboardStats();
    }
  }, [attendance, isClient, calculateDashboardStats]);


  const handlePeriodChange = (value: string) => {
    setPeriod(value as PayrollPeriod);
  };

  const changeMonth = (amount: number) => {
    setCurrentDate((prev) => (amount > 0 ? add(prev, { months: 1 }) : sub(prev, { months: 1 })));
  };

  const daysInPeriod = React.useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    if (period === '1-15') {
      return Array.from({ length: 15 }, (_, i) => i + 1);
    }
    return Array.from({ length: daysInMonth - 15 }, (_, i) => i + 16);
  }, [currentDate, period]);

  const handleCellClick = (employee: Employee, day: number, shift: 'day' | 'night') => {
    setSelectedCell({ employee, day, shift });
    setDialogOpen(true);
  };

  const handleUpdateAttendance = (formData: Omit<AttendanceRecord, 'employeeId' | 'date' | 'shift'>) => {
    if (!selectedCell) return;
    const { employee, day, shift } = selectedCell;
    const date = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), 'yyyy-MM-dd');
    const key = `${employee.id}-${date}-${shift}`;
    setAttendance((prev) => ({ ...prev, [key]: { ...formData, employeeId: employee.id, date, shift } }));
    toast({ title: 'Asistencia Actualizada', description: `Se guardó el registro para ${employee.name}.` });
    setDialogOpen(false);
    setSelectedCell(null);
  };
  
  const getRecordForCell = (employeeId: string, day: number, shift: 'day' | 'night') => {
     const date = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), 'yyyy-MM-dd');
     const key = `${employeeId}-${date}-${shift}`;
     return attendance[key];
  }
  
  const handleExportIndividualPDF = (employeeId: string) => {
    const employee = initialEmployees.find(e => e.id === employeeId);
    if (!employee) return;

    toast({
        title: 'Exportando PDF...',
        description: `Generando la nómina para ${employee.name}.`
    });

    const attendanceData: Record<string, AttendanceRecord> = JSON.parse(localStorage.getItem('attendanceData') || '{}');
    const loanData: LoanRequest[] = JSON.parse(localStorage.getItem('loanData') || '[]');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = period === '1-15' ? 1 : 16;
    const endDay = period === '1-15' ? 15 : daysInMonth;

    let shiftsWorked = 0;
    let lateArrivals = 0;
    let absences = 0;

    for (let day = startDay; day <= endDay; day++) {
        const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
        const dayKey = `${employee.id}-${dateStr}-day`;
        const nightKey = `${employee.id}-${dateStr}-night`;

        if (attendanceData[dayKey]?.status === 'Asistencia') shiftsWorked++;
        if (attendanceData[nightKey]?.status === 'Asistencia') shiftsWorked++;
        if (attendanceData[dayKey]?.status === 'Retardo') lateArrivals++;
        if (attendanceData[nightKey]?.status === 'Retardo') lateArrivals++;
        if (attendanceData[dayKey]?.status === 'Falta') absences++;
        if (attendanceData[nightKey]?.status === 'Falta') absences++;
    }

    const basePay = shiftsWorked * employee.shiftRate;

    const activeLoan = loanData.find(l => l.employeeId === employee.id && l.status === 'Aprobado');
    let loanDeductions = 0;
    if (activeLoan && activeLoan.term === 'quincenal' && activeLoan.installments > 0) {
        loanDeductions = activeLoan.amount / activeLoan.installments;
    } else if (activeLoan && activeLoan.term === 'única') {
        loanDeductions = activeLoan.amount;
    }

    const bonuses = 0; // Placeholder
    const otherDeductions = 0; // Placeholder
    const netPay = basePay + bonuses - loanDeductions - otherDeductions;
    
    const doc = new jsPDF();
    const periodText = `Periodo: ${startDay}-${endDay} de ${format(currentDate, 'MMMM yyyy', { locale: es })}`;
    
    // Header
    doc.setFontSize(18);
    doc.text('Recibo de Nómina', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Guardian Payroll', 105, 28, { align: 'center' });

    // Employee Info
    doc.setFontSize(14);
    doc.text('Información del Empleado', 14, 45);
    doc.autoTable({
        startY: 50,
        body: [
            ['Nombre', employee.name],
            ['Puesto', employee.role],
            ['Periodo de Pago', periodText],
        ],
        theme: 'plain',
        styles: { fontSize: 10 },
    });

    // Payroll Details
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(14);
    doc.text('Desglose de Pago', 14, finalY + 15);

    const perceptions = [
        ['Sueldo por Turnos Trabajados', `${shiftsWorked} turnos`, `$${basePay.toFixed(2)}`],
        ['Bonos Adicionales', '', `$${bonuses.toFixed(2)}`],
    ];
    
    const deductions = [
        ['Adelantos / Préstamos', '', `-$${loanDeductions.toFixed(2)}`],
        ['Otras Deducciones', '', `-$${otherDeductions.toFixed(2)}`],
    ];

    doc.autoTable({
        startY: finalY + 20,
        head: [['PERCEPCIONES', 'Detalle', 'Monto']],
        body: perceptions,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    });

    const secondTableY = (doc as any).lastAutoTable.finalY;
    doc.autoTable({
        startY: secondTableY + 5,
        head: [['DEDUCCIONES', 'Detalle', 'Monto']],
        body: deductions,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
    });

    // Totals
    const thirdTableY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGO NETO:', 140, thirdTableY + 15, { align: 'right' });
    doc.text(`$${netPay.toFixed(2)}`, 200, thirdTableY + 15, { align: 'right' });

    // Summary
    const summaryY = thirdTableY + 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Resumen de Asistencia del Periodo:', 14, summaryY);
    doc.autoTable({
        startY: summaryY + 5,
        body: [
            ['Turnos con Asistencia', shiftsWorked],
            ['Retardos Registrados', lateArrivals],
            ['Faltas Registradas', absences],
        ],
        theme: 'grid',
    });

    doc.save(`recibo_nomina_${employee.name.replace(/ /g, '_')}_${periodText.replace(/ /g, '_')}.pdf`);
  }
  
  const barChartConfig = {
    Asistencias: { label: "Asistencias", color: "hsl(var(--chart-1))" },
    Faltas: { label: "Faltas", color: "hsl(var(--chart-2))" },
  }

  const pieChartConfig = {
    value: { label: "Turnos" },
    Asistencia: { label: "Asistencias", color: "hsl(var(--chart-1))" },
    Falta: { label: "Faltas", color: "hsl(var(--chart-2))" },
    Retardo: { label: "Retardos", color: "hsl(var(--chart-3))" },
    Descanso: { label: "Descansos", color: "hsl(var(--chart-4))" },
    Otros: { label: "Otros", color: "hsl(var(--chart-5))" },
  }

  const canEditAttendance = employee?.role && ['Supervisor', 'Coordinador', 'Dirección'].includes(employee.role);
  const canExportPayroll = employee?.role && ['Coordinador', 'Dirección'].includes(employee.role);


  if (loading || !user) {
    return (
        <div className="flex flex-col h-screen bg-gray-50/50 p-6">
            <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10 rounded-lg mb-6">
                <Skeleton className="h-8 w-1/2" />
            </header>
            <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-7 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5 mb-6">
                <Card className="lg:col-span-3 h-80">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-full w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 h-80">
                     <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-full w-full" />
                    </CardContent>
                </Card>
             </div>

            <Card className="shadow-lg border-t-4 border-primary">
                <CardHeader>
                     <Skeleton className="h-8 w-1/3" />
                     <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>

        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Dashboard de Asistencia</h1>
        </div>
      </header>
      <main className="flex-1 p-2 md:p-6 overflow-auto">
        <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia del Mes (Turnos)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalAttendance}</div>
              <p className="text-xs text-muted-foreground">Total de turnos con asistencia</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nómina Estimada (Mes)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.estimatedPayroll.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimación basada en asistencias</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faltas y Retardos (Mes)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.absencesAndLates}</div>
              <p className="text-xs text-muted-foreground">Total de incidencias negativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeLoans}</div>
               <p className="text-xs text-muted-foreground">Total de ${dashboardStats.activeLoansAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5 mb-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Rendimiento de Asistencia (Últimos 6 meses)</CardTitle>
                </CardHeader>
                <CardContent className="w-full pl-2">
                    <ChartContainer config={barChartConfig} className="h-64 w-full">
                        <BarChart accessibilityLayer data={dashboardStats.barChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="Asistencias" fill="var(--color-Asistencias)" radius={4} />
                            <Bar dataKey="Faltas" fill="var(--color-Faltas)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Desglose de Asistencia (Periodo Actual)</CardTitle>
                </CardHeader>
                <CardContent className="w-full flex justify-center">
                     <ChartContainer config={pieChartConfig} className="h-64 w-full">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                         <Pie
                          data={dashboardStats.pieChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                           {dashboardStats.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend
                          content={<ChartLegendContent nameKey="name" />}
                          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                      </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        
        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col">
              <CardTitle className="font-headline text-lg md:text-xl">
                Registro de Asistencia: {isClient ? format(currentDate, 'MMMM yyyy', { locale: es }) : ''}
              </CardTitle>
              <CardDescription className="text-sm">
                Selecciona un empleado y día para registrar la asistencia.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-15">Días 1-15</SelectItem>
                  <SelectItem value="16-end">Días 16 al final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <div className="overflow-x-auto rounded-lg border">
              <Table className="min-w-full whitespace-nowrap">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="sticky left-0 bg-gray-50 z-10 w-[200px] md:w-[250px] font-semibold px-2 py-3 sm:px-4">Empleado</TableHead>
                    {daysInPeriod.map((day) => (
                      <TableHead key={day} className="text-center w-20 md:w-24 font-semibold px-1 py-3">
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialEmployees.map((employeeRow) => (
                    <TableRow key={employeeRow.id} className="hover:bg-primary/5">
                      <TableCell className="sticky left-0 bg-white hover:bg-primary/5 z-10 font-medium px-2 py-3 sm:px-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-primary/10 text-primary rounded-full p-2">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{employeeRow.name}</p>
                                    <p className="text-xs text-muted-foreground">{employeeRow.role}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExportIndividualPDF(employeeRow.id)} disabled={!canExportPayroll}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Exportar Nómina Individual</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </TableCell>
                      {daysInPeriod.map((day) => {
                        const dayRecord = getRecordForCell(employeeRow.id, day, 'day');
                        const nightRecord = getRecordForCell(employeeRow.id, day, 'night');
                        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isFuture = isAfter(cellDate, new Date());
                        
                        return (
                            <TableCell key={day} className="p-1 text-center border-l transition-colors duration-200 ease-in-out">
                                <div className="flex flex-col gap-1">
                                    <button 
                                      onClick={() => canEditAttendance && !isFuture && handleCellClick(employeeRow, day, 'day')} 
                                      className={`w-full text-xs font-bold p-1 rounded-md transition-all duration-200 ease-in-out transform ${canEditAttendance ? 'hover:scale-105' : ''} ${dayRecord ? STATUS_COLORS[dayRecord.status] : 'bg-gray-100 text-gray-400'} ${isFuture || !canEditAttendance ? 'cursor-not-allowed opacity-60' : 'hover:bg-primary/10'}`}
                                      disabled={isFuture || !canEditAttendance}
                                    >
                                        {dayRecord?.status.charAt(0) || 'D'}
                                    </button>
                                    <button 
                                      onClick={() => canEditAttendance && !isFuture && handleCellClick(employeeRow, day, 'night')} 
                                      className={`w-full text-xs font-bold p-1 rounded-md transition-all duration-200 ease-in-out transform ${canEditAttendance ? 'hover:scale-105' : ''} ${nightRecord ? STATUS_COLORS[nightRecord.status] : 'bg-gray-100 text-gray-400'} ${isFuture || !canEditAttendance ? 'cursor-not-allowed opacity-60' : 'hover:bg-primary/10'}`}
                                      disabled={isFuture || !canEditAttendance}
                                    >
                                        {nightRecord?.status.charAt(0) || 'N'}
                                    </button>
                                </div>
                            </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      {selectedCell && (
        <UpdateAttendanceDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          cell={selectedCell}
          onUpdate={handleUpdateAttendance}
          currentRecord={getRecordForCell(selectedCell.employee.id, selectedCell.day, selectedCell.shift)}
        />
      )}
    </div>
  );
}

function UpdateAttendanceDialog({
  isOpen,
  onClose,
  cell,
  onUpdate,
  currentRecord,
}: {
  isOpen: boolean;
  onClose: () => void;
  cell: { employee: Employee; day: number; shift: 'day' | 'night' };
  onUpdate: (data: Omit<AttendanceRecord, 'employeeId' | 'date' | 'shift'>) => void;
  currentRecord?: AttendanceRecord;
}) {
  const [status, setStatus] = React.useState<AttendanceStatus | undefined>(currentRecord?.status);
  const [locationId, setLocationId] = React.useState<string | undefined>(currentRecord?.locationId);
  const [notes, setNotes] = React.useState<string>(currentRecord?.notes || '');
  const [photo, setPhoto] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (isOpen) {
        setStatus(currentRecord?.status);
        setLocationId(currentRecord?.locationId);
        setNotes(currentRecord?.notes || '');
        setPhoto(null);
    }
  }, [isOpen, currentRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    const photoEvidence = photo ? URL.createObjectURL(photo) : currentRecord?.photoEvidence;

    onUpdate({
      status,
      locationId,
      notes,
      photoEvidence,
    });
  };

  const needsLocation = status === 'Asistencia' || status === 'Retardo';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:max-w-md rounded-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline text-lg sm:text-xl">
              Actualizar Asistencia - {cell.employee.name}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Día {cell.day}, Turno de {cell.shift === 'day' ? 'Día (08-20h)' : 'Noche (20-08h)'}
            </div>
          </DialogHeader>
          <div className="py-4 grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Estado</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                  <div key={opt}>
                    <RadioGroupItem value={opt} id={opt} className="sr-only" />
                    <Label htmlFor={opt} className={`flex items-center text-xs sm:text-sm justify-center p-2 rounded-md border-2 cursor-pointer transition-all duration-200 ${status === opt ? 'border-primary ring-2 ring-primary/50' : 'border-gray-200'} ${STATUS_COLORS[opt]}`}>
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {needsLocation && (
              <div className="space-y-2">
                <Label htmlFor="location">Servicio / Centro de Trabajo</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialWorkLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {status === 'Retardo' && (
              <div className="space-y-2">
                <Label htmlFor="photo">Evidencia Fotográfica (Retardo)</Label>
                <label className="flex w-full items-center gap-2 cursor-pointer rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Upload className="h-5 w-5" />
                    <span className="truncate">{photo ? photo.name : "Subir imagen de WhatsApp"}</span>
                    <Input id="photo" type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
             <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea id="notes" placeholder="Anotar detalles como turnos dobles, adelantos, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
             </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!status || (needsLocation && !locationId)} className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
