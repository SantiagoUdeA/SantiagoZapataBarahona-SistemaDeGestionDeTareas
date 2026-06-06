# Proyectos Specification

## Purpose
Administrar los proyectos bajo los cuales se organizan, asignan y completan las tareas, exponiendo el progreso de cada proyecto.

## Requirements

### Requirement: Consulta del listado de proyectos
El sistema DEBE presentar a todo usuario autenticado el listado de proyectos con su identificador, nombre, progreso actual y el responsable que lo creó.

#### Scenario: Usuario consulta los proyectos
- GIVEN un usuario autenticado, sea con rol USER o ADMIN
- WHEN el usuario consulta el listado de proyectos
- THEN el sistema muestra cada proyecto con su identificador, nombre, progreso actual y responsable de creación

---

### Requirement: Creación de un proyecto
El sistema DEBE permitir crear un proyecto a partir de un nombre, registrando al usuario en sesión como responsable.

#### Scenario: Creación exitosa de un proyecto
- GIVEN un administrador define el nombre de un nuevo proyecto
- WHEN el administrador registra el proyecto
- THEN el sistema crea el proyecto con el responsable de la sesión y confirma la operación
- AND el listado de proyectos incluye el nuevo proyecto

#### Scenario: Fallo en la creación de un proyecto
- GIVEN un administrador intenta registrar un proyecto
- WHEN la operación no puede completarse
- THEN el sistema informa del error y conserva el listado sin cambios

---

### Requirement: Creación restringida a administradores
El sistema DEBE permitir crear proyectos únicamente a usuarios con rol ADMIN.

#### Scenario: Creación de proyecto denegada a rol USER
- GIVEN un usuario con rol USER
- WHEN el usuario intenta crear un proyecto
- THEN el sistema impide la operación