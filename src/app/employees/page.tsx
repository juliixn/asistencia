'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
import { Badge } from '@/components/ui/badge';
import { initialEmployees } from '@/lib/data';
import type { Employee } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeesPage() {
    const { toast } = useToast();

    const handleDelete = (employeeName: string) => {
        toast({
            title: "Función no implementada",
            description: `La eliminación de ${employeeName} estará disponible pronto.`
        });
    }
  
    const handleEdit = (employeeName: string) => {
        toast({
            title: "Función no implementada",
            description: `La edición de ${employeeName} estará disponible pronto.`
        });
    }
  
    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex flex-col h-full bg-gray-50/50">
                <header className="p-4 border-b bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Empleados</h1>
                    <Button>
                        <PlusCircle className="mr-2" />
                        Añadir Empleado
                    </Button>
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
                        <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="px-4 py-3">Nombre</TableHead>
                                <TableHead className="px-4 py-3">Rol</TableHead>
                                <TableHead className="px-4 py-3 hidden sm:table-cell">Tarifa por Turno</TableHead>
                                <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium px-4">{employee.name}</TableCell>
                                        <TableCell className="px-4">
                                            <Badge variant="secondary">{employee.role}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell px-4">${employee.shiftRate.toFixed(2)}</TableCell>
                                        <TableCell className="text-right px-4">
                                            <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(employee.name)}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(employee.name)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
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
        </SidebarProvider>
    );
}
