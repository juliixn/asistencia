'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { add, format, getDate, getDaysInMonth, startOfMonth, sub } from 'date-fns';
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
  Asistencia: 'bg-green-200 text-green-800',
  Retardo: 'bg-yellow-200 text-yellow-800',
  Falta: 'bg-red-200 text-red-800',
  Descanso: 'bg-blue-200 text-blue-800',
  Incapacidad: 'bg-purple-200 text-purple-800',
  Vacaciones: 'bg-indigo-200 text-indigo-800',
  Enfermedad: 'bg-pink-200 text-pink-800',
  'Permiso C/S': 'bg-cyan-200 text-cyan-800',
  'Permiso S/S': 'bg-gray-200 text-gray-800',
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

  const { toast } = useToast();

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b">
            <h1 className="text-2xl font-headline font-bold">Registro de Asistencia</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Select value={period} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-[180px]">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-15">Días 1-15</SelectItem>
                      <SelectItem value="16-end">Días 16 al final</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Nómina
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Empleado</TableHead>
                        {daysInPeriod.map((day) => (
                          <TableHead key={day} className="text-center w-28">
                            {day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {initialEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="sticky left-0 bg-card z-10 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/20 text-primary rounded-full p-2">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{employee.name}</p>
                                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                                </div>
                            </div>
                          </TableCell>
                          {daysInPeriod.map((day) => {
                            const dayRecord = getRecordForCell(employee.id, day, 'day');
                            const nightRecord = getRecordForCell(employee.id, day, 'night');
                            return (
                                <TableCell key={day} className="p-1 text-center border-l">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleCellClick(employee, day, 'day')} className={`w-full text-xs p-1 rounded-md transition-colors hover:bg-primary/10 ${dayRecord ? STATUS_COLORS[dayRecord.status] : ''}`}>
                                            {dayRecord?.status.charAt(0) || 'D'}
                                        </button>
                                        <button onClick={() => handleCellClick(employee, day, 'night')} className={`w-full text-xs p-1 rounded-md transition-colors hover:bg-primary/10 ${nightRecord ? STATUS_COLORS[nightRecord.status] : ''}`}>
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
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">
              Actualizar Asistencia - {cell.employee.name}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Día {cell.day}, Turno de {cell.shift === 'day' ? 'Día (08-20h)' : 'Noche (20-08h)'}
            </div>
          </DialogHeader>
          <div className="py-4 grid gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)} className="grid grid-cols-3 gap-2">
                {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                  <div key={opt}>
                    <RadioGroupItem value={opt} id={opt} className="sr-only" />
                    <Label htmlFor={opt} className={`flex items-center justify-center p-2 rounded-md border-2 cursor-pointer ${status === opt ? 'border-primary' : 'border-transparent'} ${STATUS_COLORS[opt]}`}>
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
                <label className="flex w-full items-center gap-2 cursor-pointer rounded-md border border-dashed p-4 text-center text-muted-foreground hover:border-primary">
                    <Upload className="h-5 w-5" />
                    <span>{photo ? photo.name : "Subir imagen de WhatsApp"}</span>
                    <Input id="photo" type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
             <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea id="notes" placeholder="Anotar detalles como turnos dobles, adelantos, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!status || (needsLocation && !locationId)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
