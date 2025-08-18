# Guía de Prompts para Construir "Guardian Payroll" con IA

Este documento contiene una serie de prompts detallados y específicos diseñados para guiar a un asistente de IA en la construcción de la aplicación "Guardian Payroll". Los prompts están organizados de forma lógica, desde la configuración inicial hasta la implementación de cada característica.

## 1. Configuración Inicial del Proyecto

**Prompt 1: Inicialización del Proyecto y Estilo Básico**

> "Inicializa una nueva aplicación Next.js (con App Router) y TypeScript. La aplicación se llamará 'Guardian Payroll'. Configura Tailwind CSS y ShadCN para los componentes de UI. Quiero que implementes el siguiente esquema de colores en `src/app/globals.css`:
> 
> - **Color primario:** Azul saturado (`#4285F4`)
> - **Color de fondo:** Gris azulado claro (`#E8F0FE`)
> - **Color de acento:** Púrpura (`#A280FF`)
> 
> También, define las siguientes fuentes de Google Fonts en el layout principal (`src/app/layout.tsx`):
> - **Encabezados:** 'Space Grotesk'
> - **Cuerpo del texto:** 'Inter'
> 
> Finalmente, crea la estructura de la aplicación con una barra de navegación lateral (`Sidebar`) para escritorio y una barra de navegación inferior (`BottomNavbar`) para móviles. El contenido principal debe mostrarse en el centro."

## 2. Estructura de Datos y API del Backend

**Prompt 2: Definición de Tipos y API del Servidor**

> "Necesito definir la estructura de datos principal de la aplicación en un archivo `src/lib/types.ts`. Crea las siguientes interfaces TypeScript: `Employee`, `WorkLocation`, `LoanRequest` y `AttendanceRecord`.
> 
> Luego, crea un archivo `src/lib/api.ts` que contenga funciones del lado del servidor (usando `'use server'`) para interactuar con una base de datos Firestore. Implementa funciones CRUD (Crear, Leer, Actualizar, Eliminar) para cada uno de los tipos de datos definidos. La conexión a Firebase debe usar las credenciales de servicio del entorno, sin incrustar claves en el código."

**Prompt 3: Sistema de Autenticación Basado en Roles**

> "Implementa un sistema de autenticación simple en `src/context/AuthContext.tsx`. El `login` no usará Firebase Auth, sino que verificará un email y contraseña contra la lista de empleados en Firestore. Solo los usuarios que no tengan el rol de 'Guardia' podrán iniciar sesión. La información del empleado autenticado debe guardarse en el estado del contexto y en `sessionStorage` para mantener la sesión. La aplicación debe proteger las rutas, mostrando una página de `login` si no hay un usuario autenticado."

## 3. Módulos y Funcionalidades Principales

**Prompt 4: Módulo de Gestión de Empleados**

> "Crea una página en `/employees` para gestionar al personal. La página debe mostrar una tabla con todos los empleados, obteniendo los datos desde la función `fetchEmployees` de la API. Debe incluir:
> 
> 1.  Un botón 'Añadir Empleado' que abra un diálogo modal.
> 2.  El diálogo debe contener un formulario para crear o editar un empleado (nombre, rol, tarifa por turno).
> 3.  Cada fila de la tabla debe tener un menú desplegable con opciones para 'Editar' y 'Eliminar', que utilicen las funciones correspondientes de la API."

**Prompt 5: Módulo de Gestión de Servicios (Centros de Trabajo)**

> "Crea una página en `/services` similar a la de empleados. Debe mostrar una tabla con los centros de trabajo (`WorkLocation`). Implementa la funcionalidad completa para añadir, editar y eliminar servicios usando un diálogo modal y las funciones de la API correspondientes."

**Prompt 6: Módulo de Gestión de Préstamos con Firma Digital e IA**

> "Crea una página en `/loans` para gestionar solicitudes de préstamos. La tabla principal mostrará las solicitudes existentes y su estado ('Pendiente', 'Aprobado', 'Rechazado').
> 
> La funcionalidad clave es un diálogo para 'Nueva Solicitud' que incluya:
> 1.  Un formulario para seleccionar un empleado, el monto, el plazo y el motivo.
> 2.  Un lienzo de firma (`react-signature-canvas`) para que el solicitante firme.
> 3.  **Integración de IA:** Al enviar el formulario, la imagen de la firma (como data URI) debe enviarse a un flow de Genkit (`analyzeSignature`) que determine si la firma es legible o es un garabato. Si la firma no es legible, la solicitud debe ser rechazada en el cliente con una notificación. Si es válida, se guarda la solicitud."

**Prompt 7: Dashboard Principal de Asistencia**

> "Desarrolla la página principal (`/`) como un dashboard de asistencia. La interfaz debe permitir seleccionar el mes y el periodo de pago (1-15 o 16-fin).
> 
> La característica central es una tabla de asistencia:
> 1.  Las filas representarán a cada empleado.
> 2.  Las columnas representarán los días del periodo seleccionado.
> 3.  Cada celda se dividirá en dos para representar el turno de día y de noche.
> 4.  Al hacer clic en una celda, se abrirá un diálogo modal para registrar o actualizar la asistencia (`Asistencia`, `Falta`, `Retardo`, etc.), el centro de trabajo y notas. Para los retardos, debe permitir adjuntar una foto como evidencia.
> 5.  Los estados de asistencia deben tener un código de color para una fácil visualización."

**Prompt 8: Módulo de Cálculo de Nómina**

> "Crea la página en `/payroll`. Esta página debe tener un botón para 'Calcular Nómina' para un mes y periodo seleccionado.
> 
> Al hacer clic:
> 1.  El sistema debe procesar todos los registros de asistencia del periodo.
> 2.  Calculará el sueldo bruto basado en los turnos trabajados.
> 3.  Aplicará deducciones por préstamos.
> 4.  Aplicará penalizaciones por retardos (ej. si hay 3 o más retardos).
> 5.  Mostrará una tabla con el desglose de la pre-nómina para cada empleado (sueldo bruto, deducciones, bonos, pago neto).
> 6.  Debe haber una opción para exportar este reporte general a un PDF."
