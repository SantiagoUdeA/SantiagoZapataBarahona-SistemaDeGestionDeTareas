# Tareas Specification

## Purpose
Crear, asignar, completar y dar seguimiento a las tareas de un proyecto, y exponer la evolución de su progreso en el tiempo.

## Requirements

### Requirement: Consulta de tareas por proyecto
El sistema DEBE mostrar las tareas de un proyecto seleccionado, indicando identificador, fecha de creación, responsable asignado y estado.

#### Scenario: Usuario consulta las tareas de un proyecto
- GIVEN un usuario autenticado tiene un proyecto seleccionado
- WHEN el usuario consulta sus tareas
- THEN el sistema lista cada tarea con su identificador, fecha de creación, responsable asignado y estado

---

### Requirement: Creación y asignación de una tarea
El sistema DEBE permitir crear una tarea dentro del proyecto seleccionado y asignarla a un usuario responsable, dejándola en estado pendiente.

#### Scenario: Creación y asignación exitosa de una tarea
- GIVEN un usuario autenticado describe una tarea dentro de un proyecto y elige al responsable
- WHEN el usuario registra la tarea
- THEN el sistema crea la tarea asignada al responsable elegido, en estado pendiente, y confirma la operación
- AND la lista de tareas del proyecto incluye la nueva tarea

#### Scenario: Fallo en la creación de una tarea
- GIVEN un usuario autenticado intenta registrar una tarea
- WHEN la operación no puede completarse
- THEN el sistema informa del error y no altera las tareas del proyecto

---

### Requirement: Gestión de tareas disponible para ambos roles
El sistema DEBE permitir tanto a usuarios USER como ADMIN consultar, crear y completar tareas.

#### Scenario: Usuario con rol USER crea una tarea
- GIVEN un usuario con rol USER tiene un proyecto seleccionado
- WHEN el usuario registra una tarea
- THEN el sistema acepta la operación

---

### Requirement: Avance del estado de una tarea
El sistema DEBE permitir avanzar una tarea por los estados pendiente, en progreso y completada, conservando el último estado registrado.

#### Scenario: Una tarea se marca como completada
- GIVEN una tarea en estado pendiente o en progreso
- WHEN el responsable de la tarea la marca como completada
- THEN el sistema registra la tarea como completada

---

### Requirement: Progreso del proyecto según tareas completadas
El sistema DEBE calcular el progreso de un proyecto como la proporción de sus tareas que están completadas.

#### Scenario: Progreso parcial de un proyecto
- GIVEN un proyecto con 4 tareas, de las cuales 1 está completada
- WHEN el usuario consulta el progreso del proyecto
- THEN el sistema reporta un progreso del 25 por ciento

#### Scenario: Proyecto sin tareas
- GIVEN un proyecto sin tareas registradas
- WHEN el usuario consulta el progreso del proyecto
- THEN el sistema reporta un progreso del 0 por ciento

---

### Requirement: Evolución del progreso en el tiempo
El sistema DEBE presentar la evolución del progreso del proyecto seleccionado a lo largo del tiempo.

#### Scenario: Visualización de la evolución del progreso
- GIVEN un usuario autenticado tiene seleccionado un proyecto con tareas completadas en distintos días
- WHEN el usuario consulta la evolución del progreso
- THEN el sistema presenta el avance acumulado del proyecto por día