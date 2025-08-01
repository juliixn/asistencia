
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
import { CalendarDays, FileDown, Briefcase, Users, FileText, CheckCircle, Calculator, AlertTriangle, Lock } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { Employee, PayrollPeriod, PayrollDetail, LoanRequest, AttendanceRecord } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { initialData } from '@/lib/data';


declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// --- MOCK API FUNCTIONS ---
async function fetchEmployees(): Promise<Employee[]> {
  const data = localStorage.getItem('employees');
  return data ? JSON.parse(data) : initialData.employees;
}
async function fetchLoanRequests(): Promise<LoanRequest[]> {
  const data = localStorage.getItem('loanRequests');
  return data ? JSON.parse(data) : initialData.loanRequests;
}
async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
    const data = localStorage.getItem('attendanceRecords');
    return data ? JSON.parse(data) : initialData.attendanceRecords;
}

export default function PayrollPage() {
  const { toast } = useToast();
  const { employee: currentUser } = useAuth();
  const [currentDate] = React.useState(new Date());
  const [period, setPeriod] = React.useState<PayrollPeriod>('1-15');
  const [payrollData, setPayrollData] = React.useState<PayrollDetail[]>([]);
  const [isCalculating, setIsCalculating] = React.useState(false);
  
  const [summary, setSummary] = React.useState({
    totalNetPay: 0,
    totalEmployees: 0,
    totalDeductions: 0,
    totalPenalties: 0,
    totalBonuses: 0,
  });

  const canAccessPayroll = currentUser?.role && ['Coordinador de Seguridad', 'Director de Seguridad'].includes(currentUser.role);

  const startDay = period === '1-15' ? 1 : 16;
  const endDay = period === '1-15' ? 15 : getDaysInMonth(currentDate);
  const startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), startDay), 'yyyy-MM-dd');
  const endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), endDay), 'yyyy-MM-dd');

  const { data: employees } = useQuery({
      queryKey: ['employees'],
      queryFn: fetchEmployees,
      enabled: canAccessPayroll,
  });
  const { data: allAttendance } = useQuery({
      queryKey: ['attendance'],
      queryFn: fetchAttendanceRecords,
      enabled: canAccessPayroll,
  });
  const { data: loanData } = useQuery({
      queryKey: ['loans', 'Aprobado'],
      queryFn: async () => {
          const allLoans = await fetchLoanRequests();
          return allLoans.filter(l => l.status === 'Aprobado');
      },
      enabled: canAccessPayroll,
  });
  
  const attendanceData = React.useMemo(() => {
    if (!allAttendance) return [];
    return allAttendance.filter(a => a.date >= startDate && a.date <= endDate);
  }, [allAttendance, startDate, endDate]);

  const handleCalculatePayroll = () => {
    setIsCalculating(true);
    toast({
        title: "Calculando Nómina...",
        description: "Por favor espera mientras procesamos los datos.",
    });

    if (!employees || !attendanceData || !loanData) {
        toast({
            variant: "destructive",
            title: "Datos incompletos",
            description: "No se pudieron cargar todos los datos necesarios para el cálculo.",
        });
        setIsCalculating(false);
        return;
    }

    setTimeout(() => {
        const calculatedPayroll = employees.map(employee => {
            const employeeAttendance = attendanceData.filter(a => a.employeeId === employee.id);
            
            const shiftsWorked = employeeAttendance.filter(a => a.status === 'Asistencia').length;
            const lateArrivals = employeeAttendance.filter(a => a.status === 'Retardo').length;
            
            const basePay = shiftsWorked * employee.shiftRate;

            const activeLoan = loanData.find(l => l.employeeId === employee.id);
            let loanDeductions = 0;
            if (activeLoan && activeLoan.term === 'quincenal' && activeLoan.installments > 0) {
                 loanDeductions = activeLoan.amount / activeLoan.installments;
            } else if (activeLoan && activeLoan.term === 'única') {
                 loanDeductions = activeLoan.amount;
            }

            const penalties = lateArrivals >= 3 ? employee.shiftRate * 0.5 : 0;
            const bonuses = 0; // Placeholder for future bonus logic
            const netPay = basePay - loanDeductions - penalties + bonuses;

            return {
                employeeId: employee.id,
                employeeName: employee.name,
                shiftsWorked,
                lateArrivals,
                basePay,
                loanDeductions,
                penalties,
                bonuses,
                netPay,
            };
        });

        setPayrollData(calculatedPayroll);
        
        const newSummary = calculatedPayroll.reduce((acc, item) => {
            acc.totalNetPay += item.netPay;
            acc.totalDeductions += item.loanDeductions;
            acc.totalPenalties += item.penalties;
            acc.totalBonuses += item.bonuses;
            return acc;
        }, { totalNetPay: 0, totalDeductions: 0, totalPenalties: 0, totalBonuses: 0 });

        setSummary({
            ...newSummary,
            totalEmployees: calculatedPayroll.filter(p => p.netPay > 0).length,
        });
        
        setIsCalculating(false);
         toast({
            title: "Cálculo Completado",
            description: "La pre-nómina ha sido generada.",
        });
    }, 500);
  }

  const handleExportGeneralPDF = () => {
    if (payrollData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay datos para exportar',
        description: 'Por favor, calcula la nómina antes de exportar.',
      });
      return;
    }

    const doc = new jsPDF();
    const periodText = `Periodo: ${period === '1-15' ? '1-15' : `16-${getDaysInMonth(currentDate)}`} de ${format(currentDate, 'MMMM yyyy', { locale: es })}`;
    
    doc.text('Reporte General de Nómina', 14, 16);
    doc.setFontSize(12);
    doc.text(periodText, 14, 22);

    const tableColumn = ["Empleado", "Turnos", "Retardos", "Sueldo Bruto", "Préstamos", "Penalización", "Bonos", "Pago Neto"];
    const tableRows: (string | number)[][] = [];

    payrollData.forEach(item => {
      const payrollItemData = [
        item.employeeName,
        item.shiftsWorked,
        item.lateArrivals,
        `$${item.basePay.toFixed(2)}`,
        `-$${item.loanDeductions.toFixed(2)}`,
        `-$${item.penalties.toFixed(2)}`,
        `+$${item.bonuses.toFixed(2)}`,
        `$${item.netPay.toFixed(2)}`,
      ];
      tableRows.push(payrollItemData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
       headStyles: {
        fillColor: [22, 163, 74] 
      },
      foot: [
          [{ content: `Total a Pagar: $${summary.totalNetPay.toFixed(2)}`, colSpan: 8, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } }]
      ],
      footStyles: {
          fillColor: [244, 244, 245]
      }
    });

    doc.save(`nomina_general_${format(currentDate, 'yyyy-MM-dd')}.pdf`);
    
    toast({
        title: 'Exportación Exitosa',
        description: 'El reporte de nómina ha sido generado en PDF.',
    });
  }

  if (!canAccessPayroll) {
    return (
        <div className="flex flex-col h-full bg-gray-50/50 items-center justify-center p-6">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full mb-4">
                        <Lock className="w-12 h-12" />
                    </div>
                    <CardTitle>Acceso Denegado</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        No tienes los permisos necesarios para acceder a esta sección. Por favor, contacta a un administrador.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
        <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Cálculo de Nómina</h1>
             <div className="flex items-center gap-2">
                 <Button disabled size="sm">
                    <CheckCircle className="mr-0 md:mr-2" />
                    <span className="hidden md:inline">Cerrar Periodo</span>
                </Button>
                <Button variant="outline" onClick={handleExportGeneralPDF} disabled={payrollData.length === 0} size="sm">
                    <FileDown className="mr-0 md:mr-2" />
                    <span className="hidden md:inline">Exportar Reporte</span>
                </Button>
             </div>
            </div>
        </header>
        <main className="flex-1 p-2 md:p-6 overflow-auto">
             <Card className="shadow-lg border-t-4 border-primary mb-6">
                <CardHeader>
                    <CardTitle className="font-headline">
                        Calculadora de Nómina
                    </CardTitle>
                    <CardDescription>
                        Selecciona el periodo para calcular y visualizar la nómina de los empleados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <Select value={period} onValueChange={(v) => setPeriod(v as PayrollPeriod)}>
                            <SelectTrigger className="bg-white">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Seleccionar periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-15">Periodo: 1-15 {format(currentDate, 'MMMM yyyy', { locale: es })}</SelectItem>
                                <SelectItem value="16-end">Periodo: 16-fin {format(currentDate, 'MMMM yyyy', { locale: es })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full md:w-auto" onClick={handleCalculatePayroll} disabled={isCalculating}>
                        <Calculator className="mr-2" />
                        {isCalculating ? 'Calculando...' : 'Calcular Nómina'}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                 <Card className="col-span-2 md:col-span-3 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-xl md:text-2xl font-bold">$ {summary.totalNetPay.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Nómina neta del periodo</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-xl md:text-2xl font-bold">+{summary.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">Activos en nómina</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Préstamos</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-xl md:text-2xl font-bold">$ {summary.totalDeductions.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Descuentos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Multas</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-xl md:text-2xl font-bold">$ {summary.totalPenalties.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Por retardos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bonos</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-xl md:text-2xl font-bold">$ {summary.totalBonuses.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Pagos extra</p>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pre-nómina del Periodo: {period === '1-15' ? '1-15' : `16-${getDaysInMonth(currentDate)}`} de {format(currentDate, 'MMMM', { locale: es })}</CardTitle>
                        <CardDescription>
                            Aquí se muestra el desglose de la nómina por empleado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {payrollData.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="px-2 sm:px-4">Empleado</TableHead>
                                            <TableHead className="text-center px-2 sm:px-4">Turnos</TableHead>
                                            <TableHead className="text-center px-2 sm:px-4">Retardos</TableHead>
                                            <TableHead className="text-right px-2 sm:px-4">Bruto</TableHead>
                                            <TableHead className="text-right px-2 sm:px-4">Préstamo</TableHead>
                                            <TableHead className="text-right px-2 sm:px-4">Multa</TableHead>
                                            <TableHead className="text-right px-2 sm:px-4">Bonos</TableHead>
                                            <TableHead className="text-right font-bold px-2 sm:px-4">Neto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payrollData.map(item => (
                                            <TableRow key={item.employeeId}>
                                                <TableCell className="font-medium px-2 sm:px-4 py-3">{item.employeeName}</TableCell>
                                                <TableCell className="text-center px-2 sm:px-4 py-3">{item.shiftsWorked}</TableCell>
                                                <TableCell className="text-center px-2 sm:px-4 py-3">{item.lateArrivals}</TableCell>
                                                <TableCell className="text-right px-2 sm:px-4 py-3">${item.basePay.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-destructive px-2 sm:px-4 py-3">-${item.loanDeductions.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-destructive px-2 sm:px-4 py-3">-${item.penalties.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-green-600 px-2 sm:px-4 py-3">+${item.bonuses.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold px-2 sm:px-4 py-3">${item.netPay.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                       ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <p>{isCalculating ? 'Procesando datos...' : 'Presiona "Calcular Nómina" para ver los resultados.'}</p>
                            </div>
                       )}
                    </CardContent>
                </Card>
             </div>
        </main>
    </div>
  );
}

    