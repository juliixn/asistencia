
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { WorkLocation } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkLocations, createWorkLocation, updateWorkLocation, deleteWorkLocation } from '@/lib/api';


export default function ServicesPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const { data: services, isLoading } = useQuery({
        queryKey: ['workLocations'],
        queryFn: fetchWorkLocations,
    });

    const createMutation = useMutation({
        mutationFn: createWorkLocation,
        onSuccess: (data) => {
            toast({
                title: "Servicio Añadido",
                description: `Se ha añadido "${data.name}" a la lista de servicios.`,
            });
            queryClient.invalidateQueries({ queryKey: ['workLocations'] });
            setIsAddDialogOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: updateWorkLocation,
        onSuccess: (data) => {
            toast({
                title: "Servicio Actualizado",
                description: `Se ha actualizado la información de "${data.name}".`,
            });
            queryClient.invalidateQueries({ queryKey: ['workLocations'] });
            setEditingService(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWorkLocation,
        onSuccess: (data) => {
            const serviceName = services?.find(s => s.id === data.id)?.name || 'El servicio';
            toast({
                title: "Servicio Eliminado",
                description: `Se ha eliminado "${serviceName}" de la lista de servicios.`
            });
            queryClient.invalidateQueries({ queryKey: ['workLocations'] });
        }
    });
    
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [editingService, setEditingService] = React.useState<WorkLocation | null>(null);
    const { employee: currentUser } = useAuth();

    const canManageServices = currentUser?.role && ['Coordinador de Seguridad', 'Director de Seguridad'].includes(currentUser.role);
    
    const handleDelete = (serviceId: string) => {
        deleteMutation.mutate(serviceId);
    }
  
    const handleEdit = (service: WorkLocation) => {
        setEditingService(service);
    }
    
    const handleUpdateService = (updatedServiceData: Omit<WorkLocation, 'id'>) => {
        if (!editingService) return;
        updateMutation.mutate({ ...updatedServiceData, id: editingService.id });
    }

    const handleAddService = (newServiceData: Omit<WorkLocation, 'id'>) => {
        createMutation.mutate(newServiceData);
    }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
        <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Servicios</h1>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canManageServices}>
                    <PlusCircle className="mr-2" />
                    Añadir Servicio
                </Button>
              </DialogTrigger>
              <ServiceDialog onSave={handleAddService} onClose={() => setIsAddDialogOpen(false)} />
            </Dialog>
            </div>
        </header>
        <main className="flex-1 p-2 md:p-6 overflow-auto">
            <Card className="shadow-lg border-t-4 border-primary">
                <CardHeader>
                    <CardTitle>Listado de Centros de Trabajo</CardTitle>
                    <CardDescription>
                    Aquí puedes ver y gestionar los lugares donde se presta servicio.
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
                            <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="px-4 py-3 w-[80%]">Nombre del Servicio</TableHead>
                                <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services?.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-medium px-4">{location.name}</TableCell>
                                        <TableCell className="text-right px-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={!canManageServices}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                     <DropdownMenuItem onClick={() => handleEdit(location)}>
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
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente el servicio.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(location.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
         <Dialog open={!!editingService} onOpenChange={(isOpen) => !isOpen && setEditingService(null)}>
            {editingService && <ServiceDialog
                service={editingService}
                onSave={(data) => handleUpdateService(data)}
                onClose={() => setEditingService(null)}
            />}
        </Dialog>
    </div>
  );
}


function ServiceDialog({
  onSave,
  service,
  onClose,
}: { 
  onSave: (data: Omit<WorkLocation, 'id'>) => void;
  service?: WorkLocation;
  onClose?: () => void;
}) {
  const [name, setName] = React.useState(service?.name || '');
  const { toast } = useToast();

  const isEditing = !!service;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
        toast({
            variant: "destructive",
            title: "Campo Requerido",
            description: "Por favor, introduce el nombre del servicio.",
        });
        return;
    }
    onSave({ name });
  }

  return (
    <DialogContent className="w-[95%] sm:max-w-lg rounded-lg">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="font-headline text-lg sm:text-xl">
                    {isEditing ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Servicio</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Corporativo Sigma" />
                </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Servicio'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
  )
}
