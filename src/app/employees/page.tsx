
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Employee, EmployeeRole } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ListEmployees, CreateEmployees, UpdateEmployees, DeleteEmployees } from '@firebasegen/default-connector';

export default function EmployeesPage() {
    const { toast } = useToast();
    const { data: employees, isLoading } = ListEmployees();
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
    const { employee: currentUser } = useAuth();
    
    const { mutate: createEmployee } = CreateEmployees();
    const { mutate: updateEmployee } = UpdateEmployees();
    const { mutate: deleteEmployee } = DeleteEmployees();

    const canManageEmployees = currentUser?.role && ['Coordinador', 'Dirección'].includes(currentUser.role);

    const handleDelete = (employeeId: string) => {
        const employeeName = employees?.find(e => e.id === employeeId)?.name;
        deleteEmployee([{ id: employeeId }]);
        toast({
            title: "Empleado Eliminado",
            description: `Se ha eliminado a ${employeeName} de la lista de personal.`
        });
    }
  
    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
    }
    
    const handleUpdateEmployee = (employeeData: Partial<Employee>) => {
        if (!editingEmployee) return;

        updateEmployee([{ ...employeeData, id: editingEmployee.id }]);
        toast({
            title: "Empleado Actualizado",
            description: `Se ha actualizado la información de ${employeeData.name}.`,
        });
        setEditingEmployee(null);
    }

    const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
        createEmployee([{
            ...newEmployeeData,
            id: `emp-${Date.now()}`,
        }]);
        toast({
            title: "Empleado Añadido",
            description: `Se ha añadido a ${newEmployeeData.name} a la lista de personal.`,
        });
        setIsAddDialogOpen(false);
    }
  
    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Empleados</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!canManageEmployees}>
                        <PlusCircle className="mr-2" />
                        Añadir Empleado
                    </Button>
                  </DialogTrigger>
                  <EmployeeDialog onSave={handleAddEmployee} onClose={() => setIsAddDialogOpen(false)} />
                </Dialog>
                </div>
            </header>
            <main className="flex-1 p-2 md:p-6 overflow-auto">
                <Card className="shadow-lg border-t-4 border-primary">
                <CardHeader>
                    <CardTitle>Listado de Personal</CardTitle>
                    <CardDescription>
                        Aquí puedes ver y gestionar la información de todos los empleados.
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
                            <TableHead className="px-4 py-3 w-[40%]">Nombre</TableHead>
                            <TableHead className="px-4 py-3">Rol</TableHead>
                            <TableHead className="px-4 py-3 hidden sm:table-cell">Tarifa por Turno</TableHead>
                            <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees?.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium px-4">{employee.name}</TableCell>
                                    <TableCell className="px-4">
                                        <Badge variant="secondary">{employee.role}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell px-4">${employee.shiftRate.toFixed(2)}</TableCell>
                                    <TableCell className="text-right px-4">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={!canManageEmployees}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Editar
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminará permanentemente al empleado
                                                            de la lista.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(employee.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                            Confirmar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                    )}
                </CardContent>
                </Card>
            </main>
            <Dialog open={!!editingEmployee} onOpenChange={(isOpen) => !isOpen && setEditingEmployee(null)}>
                {editingEmployee && <EmployeeDialog
                    employee={editingEmployee}
                    onSave={(data) => handleUpdateEmployee(data)}
                    onClose={() => setEditingEmployee(null)}
                />}
            </Dialog>
        </div>
    );
}


function EmployeeDialog({
  onSave,
  employee,
  onClose,
}: { 
  onSave: (data: Omit<Employee, 'id'>) => void;
  employee?: Employee;
  onClose?: () => void;
}) {
  const [name, setName] = React.useState(employee?.name || '');
  const [role, setRole] = React.useState<EmployeeRole | ''>(employee?.role || '');
  const [shiftRate, setShiftRate] = React.useState<number>(employee?.shiftRate || 0);
  const [email, setEmail] = React.useState(employee?.email || '');
  const { toast } = useToast();

  const isEditing = !!employee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || shiftRate <= 0 || !email) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        return;
    }
    // Type assertion is safe because we checked for `role` not being `''`
    onSave({ name, role: role as EmployeeRole, shiftRate, email });
  }

  return (
    <DialogContent className="w-[95%] sm:max-w-lg rounded-lg">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="font-headline text-lg sm:text-xl">
                    {isEditing ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Guardia">Guardia</SelectItem>
                                <SelectItem value="Supervisor">Supervisor</SelectItem>
                                <SelectItem value="Coordinador">Coordinador</SelectItem>
                                <SelectItem value="Dirección">Dirección</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shiftRate">Tarifa por Turno</Label>
                        <Input id="shiftRate" type="number" value={shiftRate === 0 ? '' : shiftRate} onChange={e => setShiftRate(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com" />
                </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Empleado'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
  )
}
