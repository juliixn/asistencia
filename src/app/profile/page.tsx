
'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmployee } from '@/lib/api';
import { Loader2, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const { employee, loading, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = React.useState(employee?.name || '');
  const [email, setEmail] = React.useState(employee?.email || '');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  React.useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
    }
  }, [employee]);

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: async (updatedData) => {
        toast({
            title: "Perfil Actualizado",
            description: "Tu información ha sido actualizada correctamente.",
        });
        // Re-login with new data to update the auth context state
        if (employee) {
           await login(updatedData.role, updatedData.name, updatedData.password || employee.password || '', [updatedData]);
        }
        setPassword('');
        setConfirmPassword('');
        queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
        toast({
            variant: 'destructive',
            title: "Error al actualizar",
            description: `Hubo un problema al guardar tus cambios: ${error.message}`,
        });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (password && password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: "Las contraseñas no coinciden",
        description: "Por favor, verifica la nueva contraseña.",
      });
      return;
    }

    const updatedData: Partial<typeof employee> & { id: string } = {
        id: employee.id,
        name,
    };

    if (password) {
        updatedData.password = password;
    }

    updateMutation.mutate(updatedData);
  };
  
  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Mi Perfil</h1>
      </header>
      <main className="flex-1 p-2 md:p-6 overflow-auto">
        <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg border-t-4 border-primary">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <UserCircle className="w-12 h-12 text-muted-foreground" />
                <div>
                    <CardTitle>Configuración de la Cuenta</CardTitle>
                    <CardDescription>
                        Aquí puedes editar tu información personal.
                    </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" value={email} disabled />
                     <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Rol de Usuario</Label>
                    <Input id="role" value={employee?.role} disabled />
                </div>
                <div className="space-y-4 pt-4 border-t">
                    <p className="text-sm font-medium text-foreground">Cambiar Contraseña</p>
                    <div className="space-y-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="animate-spin mr-2" />}
                    Guardar Cambios
                </Button>
            </CardFooter>
          </form>
        </Card>
        </div>
      </main>
    </div>
  );
}
