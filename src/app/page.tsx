'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { initialEmployees, initialWorkLocations } from '@/lib/data';
import type {
  Employee,
  WorkLocation,
  AttendanceRecord,
  AttendanceStatus,
  PayrollPeriod,
} from '@/lib/types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Upload,
  User,
  X,
  FileDown,
  RefreshCw,
  TrendingUp,
  DollarSign,
  UserCheck,
  FileText,
  MoreVertical,
} from 'lucide-react';
import { add, format, getDate, getDaysInMonth, startOfMonth, sub, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function GuardianPayrollPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [period, setPeriod] = React.useState<PayrollPeriod>('1-15');
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceRecord>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<{
    employee: Employee;
    day: number;
    shift: 'day' | 'night';
  } | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    const storedAttendance = localStorage.getItem('attendanceData');
    if (storedAttendance) {
      setAttendance(JSON.parse(storedAttendance));
    }
  }, []);

  React.useEffect(() => {
    if (isClient) {
      localStorage.setItem('attendanceData', JSON.stringify(attendance));
    }
  }, [attendance, isClient]);

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
  
  const handleSync = () => {
    setIsSyncing(true);
    toast({
      title: 'Sincronizando...',
      description: 'Guardando los datos de asistencia en el servidor.'
    });
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: 'Sincronización Completa',
        description: 'Todos los registros han sido guardados.',
      });
    }, 2000);
  };
  
  const handleExportIndividualPDF = (employeeName: string) => {
    toast({
        title: 'Exportando PDF Individual',
        description: `Generando la nómina para ${employeeName}.`
    });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full bg-gray-50/50">
          <header className="p-4 border-b bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Registro de Asistencia</h1>
              <Button onClick={handleSync} disabled={isSyncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}</span>
                 <span className="md:hidden">Sinc.</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-2 md:p-6 overflow-auto">
            <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asistencia Total (Turnos)</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nómina Estimada</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">Periodo actual</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Extra</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+120</div>
                  <p className="text-xs text-muted-foreground">Turnos dobles y tiempo extra</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                   <p className="text-xs text-muted-foreground">Total de $12,500</p>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-lg border-t-4 border-primary">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col">
                  <CardTitle className="font-headline text-lg md:text-xl">
                    {isClient ? format(currentDate, 'MMMM yyyy', { locale: es }) : ''}
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button className="w-full sm:w-auto">
                          <FileDown className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Exportar PDF</span>
                          <span className="sm:hidden">Exportar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Podrá exportar en PDF al presionar el botón a la fecha que se tiene sin importar que no esté completo el periodo quincenal</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
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
                      {initialEmployees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-primary/5">
                          <TableCell className="sticky left-0 bg-white hover:bg-primary/5 z-10 font-medium px-2 py-3 sm:px-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="bg-primary/10 text-primary rounded-full p-2">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{employee.name}</p>
                                        <p className="text-xs text-muted-foreground">{employee.role}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExportIndividualPDF(employee.name)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>Exportar Nómina Individual</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                          </TableCell>
                          {daysInPeriod.map((day) => {
                            const dayRecord = getRecordForCell(employee.id, day, 'day');
                            const nightRecord = getRecordForCell(employee.id, day, 'night');
                            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isFuture = isAfter(cellDate, new Date());
                            
                            return (
                                <TableCell key={day} className="p-1 text-center border-l transition-colors duration-200 ease-in-out">
                                    <div className="flex flex-col gap-1">
                                        <button 
                                          onClick={() => !isFuture && handleCellClick(employee, day, 'day')} 
                                          className={`w-full text-xs font-bold p-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 ${dayRecord ? STATUS_COLORS[dayRecord.status] : 'bg-gray-100 text-gray-400 hover:bg-primary/10'} ${isFuture ? 'cursor-not-allowed opacity-50' : ''}`}
                                          disabled={isFuture}
                                        >
                                            {dayRecord?.status.charAt(0) || 'D'}
                                        </button>
                                        <button 
                                          onClick={() => !isFuture && handleCellClick(employee, day, 'night')} 
                                          className={`w-full text-xs font-bold p-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 ${nightRecord ? STATUS_COLORS[nightRecord.status] : 'bg-gray-100 text-gray-400 hover:bg-primary/10'} ${isFuture ? 'cursor-not-allowed opacity-50' : ''}`}
                                          disabled={isFuture}
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
        </div>
      </SidebarInset>
      {selectedCell && (
        <UpdateAttendanceDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          cell={selectedCell}
          onUpdate={handleUpdateAttendance}
          currentRecord={getRecordForCell(selectedCell.employee.id, selectedCell.day, selectedCell.shift)}
        />
      )}
    </SidebarProvider>
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
