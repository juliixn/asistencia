
'use client';

import * as React from 'react';
import SignatureCanvas from 'react-signature-canvas';
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Employee, LoanRequest, LoanStatus } from '@/lib/types';
import { PlusCircle, Eraser, MoreHorizontal, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Eye, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { analyzeSignature } from '@/ai/flows/analyze-signature';
import { ListLoanRequests, ListEmployees, CreateLoanRequests, UpdateLoanRequests } from '@/dataconnect/hooks';


const statusConfig: Record<LoanStatus, { label: string; icon: React.ElementType; className: string }> = {
  Pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  Aprobado: { label: 'Aprobado', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  Rechazado: { label: 'Rechazado', icon: XCircle, className: 'bg-red-100 text-red-800' },
  Pagado: { label: 'Pagado', icon: CheckCircle, className: 'bg-blue-100 text-blue-800' },
};


export default function LoansPage() {
  const { data: loans, isLoading: loansLoading } = ListLoanRequests();
  const { data: employees, isLoading: employeesLoading } = ListEmployees();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { employee: currentUser } = useAuth();

  const { mutate: createLoanRequest } = CreateLoanRequests();
  const { mutate: updateLoanRequest } = UpdateLoanRequests();

  const handleCreateRequest = (newRequest: Omit<LoanRequest, 'id'>) => {
    createLoanRequest([{
        ...newRequest,
        id: `loan${Date.now()}`,
    }]);
    toast({
        title: "Solicitud Creada",
        description: `La solicitud de préstamo para ${employees?.find(e => e.id === newRequest.employeeId)?.name} ha sido creada.`,
    })
    setIsRequestDialogOpen(false);
  }

  const handleUpdateLoanStatus = (loanId: string, newStatus: 'Aprobado' | 'Rechazado') => {
      if (!currentUser) return;

      const loan = loans?.find(l => l.id === loanId);
      if (!loan) return;

      const employee = employees?.find(e => e.id === loan.employeeId);
      updateLoanRequest([{
        id: loanId,
        status: newStatus,
        approvedById: currentUser.id,
        approvalDate: new Date().toISOString().split('T')[0],
      }]);
      
      toast({
        title: `Préstamo ${newStatus}`,
        description: `La solicitud de ${employee?.name} ha sido actualizada.`,
      });
  };

  const canCreateRequest = currentUser?.role && ['Supervisor', 'Coordinador', 'Dirección'].includes(currentUser.role);
  const canApproveRequest = currentUser?.role === 'Dirección';

  const isLoading = loansLoading || employeesLoading;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Préstamos</h1>
          {canCreateRequest && (
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  <span className="hidden md:inline">Nueva Solicitud</span>
                  <span className="md:hidden">Añadir</span>
                </Button>
              </DialogTrigger>
              <RequestLoanDialog onSave={handleCreateRequest} onClose={() => setIsRequestDialogOpen(false)} employees={employees || []} />
            </Dialog>
          )}
        </div>
      </header>
      <main className="flex-1 p-2 md:p-6 overflow-auto">
        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader>
            <CardTitle>Solicitudes de Préstamos y Adelantos</CardTitle>
            <CardDescription>
              Aquí puedes ver el historial de préstamos y aprobar o rechazar las solicitudes pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
             <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-4 py-3">Empleado</TableHead>
                    <TableHead className="px-4 py-3 hidden sm:table-cell">Fecha Solicitud</TableHead>
                    <TableHead className="px-4 py-3">Monto</TableHead>
                    <TableHead className="px-4 py-3 hidden md:table-cell">Plazo</TableHead>
                    <TableHead className="px-4 py-3">Estado</TableHead>
                    <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {loans?.map(loan => {
                        const employee = employees?.find(e => e.id === loan.employeeId);
                        const StatusIcon = statusConfig[loan.status].icon;
                        const isPending = loan.status === 'Pendiente';

                        return (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium px-4">{employee?.name || 'Desconocido'}</TableCell>
                                <TableCell className="hidden sm:table-cell px-4">{loan.requestDate}</TableCell>
                                <TableCell className="px-4">${loan.amount.toFixed(2)}</TableCell>
                                <TableCell className="hidden md:table-cell px-4">{loan.installments} {loan.term === 'única' ? 'pago' : 'pagos'}</TableCell>
                                <TableCell className="px-4">
                                    <Badge variant="outline" className={`gap-1.5 whitespace-nowrap ${statusConfig[loan.status].className}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {statusConfig[loan.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-4">
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                              <Eye className="mr-2 h-4 w-4"/>
                                              Ver Detalles
                                          </DropdownMenuItem>
                                          {canApproveRequest && isPending && (
                                            <>
                                              <DropdownMenuSeparator />
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <DropdownMenuItem className="text-green-600 focus:text-green-700" onSelect={(e) => e.preventDefault()}>
                                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                                    Aprobar
                                                  </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Confirmar Aprobación?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      Esta acción aprobará el préstamo de ${loan.amount.toFixed(2)} para {employee?.name}. Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleUpdateLoanStatus(loan.id, 'Aprobado')}>
                                                      Confirmar
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <ThumbsDown className="mr-2 h-4 w-4" />
                                                    Rechazar
                                                  </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Confirmar Rechazo?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      Esta acción rechazará el préstamo de ${loan.amount.toFixed(2)} para {employee?.name}. Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleUpdateLoanStatus(loan.id, 'Rechazado')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                      Rechazar Préstamo
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            </>
                                          )}
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


function RequestLoanDialog({ onSave, onClose, employees }: { onSave: (data: Omit<LoanRequest, 'id' | 'status'>) => void; onClose: () => void; employees: Employee[] }) {
  const [employeeId, setEmployeeId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<number>(0);
  const [term, setTerm] = React.useState<'unica' | 'quincenal'>('unica');
  const [installments, setInstallments] = React.useState<number>(1);
  const [reason, setReason] = React.useState('');
  const signatureRef = React.useRef<SignatureCanvas>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { toast } = useToast();
  
  const clearSignature = () => {
    signatureRef.current?.clear();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const selectedEmployee = employees.find(e => e.id === employeeId);
    const maxLoanAmount = selectedEmployee ? (selectedEmployee.shiftRate * 15) / 3 : 0;

    if (!employeeId || amount <= 0 || !reason) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        setIsProcessing(false);
        return;
    }
    if (amount > maxLoanAmount) {
       toast({
            variant: "destructive",
            title: "Monto Excedido",
            description: `El monto solicitado excede el máximo de $${maxLoanAmount.toFixed(2)} permitido para este empleado.`,
        });
        setIsProcessing(false);
        return;
    }

    if (signatureRef.current?.isEmpty()) {
       toast({
            variant: "destructive",
            title: "Firma Requerida",
            description: "Por favor, proporciona la firma del solicitante.",
        });
        setIsProcessing(false);
        return;
    }

    try {
        const signatureDataUrl = signatureRef.current.toDataURL();
        const analysis = await analyzeSignature({ signatureDataUri: signatureDataUrl });

        if (!analysis.isLegible) {
             toast({
                variant: "destructive",
                title: "Firma Inválida",
                description: `Análisis de IA: "${analysis.reason}". Por favor, proporciona una firma clara.`,
            });
            setIsProcessing(false);
            return;
        }

        toast({
            title: "Firma Verificada por IA",
            description: "La firma parece ser válida. Procesando solicitud...",
        });
    
        onSave({
            employeeId,
            amount,
            term: term === 'unica' ? 'única' : 'quincenal',
            installments,
            reason,
            requestDate: new Date().toISOString().split('T')[0],
            signature: signatureDataUrl,
        });

    } catch(error) {
        console.error("Error analyzing signature:", error);
        toast({
            variant: "destructive",
            title: "Error de Análisis",
            description: "No se pudo analizar la firma. Inténtalo de nuevo.",
        });
    } finally {
        setIsProcessing(false);
    }
  }

  const selectedEmployee = employees.find(e => e.id === employeeId);
  const maxLoanAmount = selectedEmployee ? (selectedEmployee.shiftRate * 15) / 3 : 0;

  return (
    <DialogContent className="w-[95%] sm:max-w-lg rounded-lg">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="font-headline text-lg sm:text-xl">Nueva Solicitud de Préstamo</DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="employee">Empleado</Label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                        <SelectTrigger id="employee">
                            <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="amount">Monto a Solicitar</Label>
                    <Input id="amount" type="number" value={amount === 0 ? '' : amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} max={maxLoanAmount} placeholder="0.00" />
                    {selectedEmployee && <p className="text-xs text-muted-foreground">Máximo permitido para este empleado: ${maxLoanAmount.toFixed(2)}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label>Plazo de Pago</Label>
                    <RadioGroup value={term} onValueChange={(v) => {
                        const newTerm = v as 'unica' | 'quincenal';
                        setTerm(newTerm);
                        if (newTerm === 'unica') setInstallments(1);
                        else if (installments < 2) setInstallments(2);
                    }} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unica" id="unica" />
                            <Label htmlFor="unica" className="font-normal">Una sola exhibición</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="quincenal" id="quincenal" />
                            <Label htmlFor="quincenal" className="font-normal">Pagos Quincenales</Label>
                        </div>
                    </RadioGroup>
                 </div>
                {term === 'quincenal' && (
                    <div className="space-y-2">
                        <Label htmlFor="installments">Número de Pagos</Label>
                        <Input id="installments" type="number" min="2" value={installments} onChange={e => setInstallments(parseInt(e.target.value, 10) || 2)} />
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de la Solicitud</Label>
                    <Textarea id="reason" placeholder="Describe brevemente el motivo..." value={reason} onChange={e => setReason(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Firma del Solicitante</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                        <Eraser className="mr-2 h-4 w-4" />
                        Limpiar
                      </Button>
                    </div>
                    <div className="w-full rounded-md border border-input aspect-video bg-white">
                      <SignatureCanvas
                        ref={signatureRef}
                        penColor='black'
                        canvasProps={{ className: 'w-full h-full rounded-md' }}
                      />
                    </div>
                 </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="animate-spin" /> Analizando...</> : "Enviar Solicitud"}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
  )
}
