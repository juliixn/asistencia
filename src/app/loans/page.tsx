'use client';

import * as React from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { initialEmployees } from '@/lib/data';
import type { Employee, LoanRequest, LoanStatus } from '@/lib/types';
import { PlusCircle, FilePen, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


// Mock data for loans
const initialLoans: LoanRequest[] = [
  {
    id: 'loan1',
    employeeId: '1',
    requestDate: '2024-07-15',
    amount: 1000,
    term: 'quincenal',
    installments: 2,
    reason: 'Emergencia familiar',
    status: 'Aprobado',
    approvedBy: '5',
    approvalDate: '2024-07-16',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA... '
  },
  {
    id: 'loan2',
    employeeId: '2',
    requestDate: '2024-07-20',
    amount: 500,
    term: 'única',
    installments: 1,
    reason: 'Adelanto de nómina',
    status: 'Pendiente',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA... '
  },
  {
    id: 'loan3',
    employeeId: '3',
    requestDate: '2024-07-21',
    amount: 2500,
    term: 'quincenal',
    installments: 4,
    reason: 'Compra de vehículo',
    status: 'Rechazado',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA... '
  },
];

const statusConfig: Record<LoanStatus, { label: string; icon: React.ElementType; className: string }> = {
  Pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  Aprobado: { label: 'Aprobado', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  Rechazado: { label: 'Rechazado', icon: XCircle, className: 'bg-red-100 text-red-800' },
  Pagado: { label: 'Pagado', icon: CheckCircle, className: 'bg-blue-100 text-blue-800' },
};


export default function LoansPage() {
  const [loans, setLoans] = React.useState<LoanRequest[]>(initialLoans);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false);

  const { toast } = useToast();

  const handleCreateRequest = (newRequest: Omit<LoanRequest, 'id'>) => {
    const requestWithId: LoanRequest = {
        ...newRequest,
        id: `loan${Date.now()}`
    }
    setLoans(prev => [requestWithId, ...prev]);
    toast({
        title: "Solicitud Creada",
        description: `La solicitud de préstamo para ${initialEmployees.find(e => e.id === newRequest.employeeId)?.name} ha sido creada.`,
    })
    setIsRequestDialogOpen(false);
  }

  // NOTE: This is a placeholder for actual role-based access control
  const currentUserRole: Employee['role'] = 'Dirección';
  const canCreateRequest = ['Supervisor', 'Coordinador', 'Dirección'].includes(currentUserRole);
  const canApproveRequest = currentUserRole === 'Dirección';


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full bg-gray-50/50">
          <header className="p-4 border-b bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-headline font-bold text-gray-800">Gestión de Préstamos</h1>
              {canCreateRequest && (
                <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2" />
                      Nueva Solicitud
                    </Button>
                  </DialogTrigger>
                  <RequestLoanDialog onSave={handleCreateRequest} />
                </Dialog>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Card className="shadow-lg border-t-4 border-primary">
              <CardHeader>
                <CardTitle>Solicitudes de Préstamos y Adelantos</CardTitle>
                <CardDescription>
                  Aquí puedes ver el historial de préstamos y aprobar o rechazar las solicitudes pendientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Plazo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loans.map(loan => {
                            const employee = initialEmployees.find(e => e.id === loan.employeeId);
                            const StatusIcon = statusConfig[loan.status].icon;
                            return (
                                <TableRow key={loan.id}>
                                    <TableCell className="font-medium">{employee?.name || 'Desconocido'}</TableCell>
                                    <TableCell>{loan.requestDate}</TableCell>
                                    <TableCell>${loan.amount.toFixed(2)}</TableCell>
                                    <TableCell>{loan.installments} {loan.term === 'única' ? 'pago' : 'pagos'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`gap-1.5 ${statusConfig[loan.status].className}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusConfig[loan.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


function RequestLoanDialog({ onSave }: { onSave: (data: Omit<LoanRequest, 'id'>) => void}) {
  const [employeeId, setEmployeeId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<number>(0);
  const [term, setTerm] = React.useState<'unica' | 'quincenal'>('unica');
  const [installments, setInstallments] = React.useState<number>(1);
  const [reason, setReason] = React.useState('');
  const [signature, setSignature] = React.useState(''); // Placeholder for signature pad

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || amount <= 0 || !reason) {
        // Basic validation
        return;
    }
    
    onSave({
        employeeId,
        amount,
        term: term === 'unica' ? 'única' : 'quincenal',
        installments,
        reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
        signature: 'signature_data_url_placeholder', // Replace with actual signature data
    })
  }

  const selectedEmployee = initialEmployees.find(e => e.id === employeeId);
  const maxLoanAmount = selectedEmployee ? (selectedEmployee.shiftRate * 15) / 3 : 0;

  return (
    <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="font-headline">Nueva Solicitud de Préstamo</DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="employee">Empleado</Label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                        <SelectTrigger id="employee">
                            <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialEmployees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="amount">Monto a Solicitar</Label>
                    <Input id="amount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} max={maxLoanAmount} />
                    {selectedEmployee && <p className="text-xs text-muted-foreground">Máximo permitido para este empleado: ${maxLoanAmount.toFixed(2)}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label>Plazo de Pago</Label>
                    <RadioGroup value={term} onValueChange={(v) => {
                        setTerm(v as 'unica' | 'quincenal');
                        if (v === 'unica') setInstallments(1);
                    }} className="flex gap-4">
                        <div>
                            <RadioGroupItem value="unica" id="unica" />
                            <Label htmlFor="unica" className="ml-2">Una sola exhibición</Label>
                        </div>
                         <div>
                            <RadioGroupItem value="quincenal" id="quincenal" />
                            <Label htmlFor="quincenal" className="ml-2">Pagos Quincenales</Label>
                        </div>
                    </RadioGroup>
                 </div>
                {term === 'quincenal' && (
                    <div className="space-y-2">
                        <Label htmlFor="installments">Número de Pagos</Label>
                        <Input id="installments" type="number" min="2" value={installments} onChange={e => setInstallments(parseInt(e.target.value, 10))} />
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de la Solicitud</Label>
                    <Textarea id="reason" placeholder="Describe brevemente el motivo..." value={reason} onChange={e => setReason(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>Firma del Solicitante</Label>
                    <div className="w-full h-32 rounded-md border border-dashed flex items-center justify-center bg-gray-50">
                        <FilePen className="text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Área para firmar</span>
                    </div>
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Enviar Solicitud</Button>
            </DialogFooter>
        </form>
    </DialogContent>
  )
}

    