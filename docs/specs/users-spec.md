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

---

### Requirement: Creación de usuario
El sistema DEBE permitir a los administradores crear nuevos usuarios proporcionando correo, contraseña y rol.

#### Scenario: Creación de usuario exitosa
- GIVEN un administrador autenticado en la administración de usuarios
- WHEN el administrador ingresa un correo único, una contraseña válida y selecciona un rol disponible
- THEN el sistema crea el usuario y lo muestra en el listado con su identificador, fecha de creación, correo y rol asignado

#### Scenario: Correo duplicado
- GIVEN un administrador intenta crear un usuario
- WHEN el correo ingresado ya existe en el sistema
- THEN el sistema informa del conflicto y no crea el usuario

#### Scenario: Datos inválidos
- GIVEN un administrador intenta crear un usuario
- WHEN algún campo requerido está vacío o tiene un formato inválido
- THEN el sistema informa los errores de validación y no crea el usuario

#### Scenario: Fallo en la creación
- GIVEN un administrador intenta crear un usuario con datos válidos
- WHEN la operación no puede completarse por un error del sistema
- THEN el sistema informa del error y no persiste ningún dato

---

### Requirement: Asignación de usuarios a un proyecto
El sistema DEBE permitir a los administradores asociar uno o más usuarios existentes a un proyecto, definiendo así los participantes que pueden operar sobre él.

#### Scenario: Asignación exitosa de un usuario a un proyecto
- GIVEN un administrador selecciona un proyecto existente y elige un usuario disponible
- WHEN el administrador confirma la asignación
- THEN el sistema registra al usuario como participante del proyecto y confirma la operación

#### Scenario: Usuario ya asignado al proyecto
- GIVEN un administrador intenta asignar un usuario a un proyecto
- WHEN el usuario ya es participante de ese proyecto
- THEN el sistema informa del conflicto y no duplica la asignación

#### Scenario: Proyecto o usuario inexistente
- GIVEN un administrador intenta asignar un usuario a un proyecto
- WHEN el proyecto o el usuario no existen en el sistema
- THEN el sistema informa que el recurso no fue encontrado y no realiza cambios

#### Scenario: Fallo en la asignación
- GIVEN un administrador intenta asignar un usuario con datos válidos
- WHEN la operación no puede completarse por un error del sistema
- THEN el sistema informa del error y no persiste ningún cambio

#### Scenario: Asignación restringida a administradores
- GIVEN un usuario con rol USER
- WHEN el usuario intenta asignar participantes a un proyecto
- THEN el sistema impide la operación

--- 