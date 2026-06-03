# Usuarios Specification

## Purpose
Permitir a los administradores consultar los usuarios del sistema y ajustar el rol asignado a cada uno.

## Requirements

### Requirement: Consulta de usuarios
El sistema DEBE presentar a los administradores el listado de usuarios con identificador, fecha de creación, correo y rol asignado.

#### Scenario: Administrador consulta los usuarios
- GIVEN un administrador autenticado
- WHEN el administrador consulta el listado de usuarios
- THEN el sistema muestra cada usuario con su identificador, fecha de creación, correo y rol

---

### Requirement: Actualización del rol de un usuario
El sistema DEBE permitir a un administrador cambiar el rol de un usuario por cualquiera de los roles disponibles.

#### Scenario: Cambio de rol exitoso
- GIVEN un administrador selecciona un usuario y elige un rol disponible
- WHEN el administrador actualiza el rol
- THEN el sistema aplica el nuevo rol y confirma la operación
- AND el listado de usuarios refleja el rol actualizado

#### Scenario: Fallo en la actualización del rol
- GIVEN un administrador intenta actualizar el rol de un usuario
- WHEN la operación no puede completarse
- THEN el sistema informa del error y conserva el rol previo

---

### Requirement: Administración de usuarios exclusiva de administradores
El sistema DEBE restringir el acceso a la administración de usuarios exclusivamente al rol ADMIN.

#### Scenario: Acceso denegado a rol USER
- GIVEN un usuario con rol USER
- WHEN el usuario intenta acceder a la administración de usuarios
- THEN el sistema niega el acceso