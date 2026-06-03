# Auth Specification

## Purpose
Gestionar la identidad de los usuarios, el ciclo de vida de la sesión y el acceso diferenciado por rol a las capacidades del sistema.

## Requirements

### Requirement: Punto de entrada público
El sistema DEBE ofrecer a un visitante no autenticado una página de inicio con la opción de iniciar sesión.

#### Scenario: Visitante llega a la página de inicio
- GIVEN un visitante no autenticado
- WHEN el visitante abre la aplicación
- THEN el sistema presenta la página de inicio con la opción de iniciar sesión

---

### Requirement: Autenticación por credenciales
El sistema DEBE autenticar a los usuarios que presenten credenciales válidas y crear una sesión activa.

#### Scenario: Acceso exitoso
- GIVEN un usuario registrado presenta credenciales válidas
- WHEN el usuario inicia sesión
- THEN el sistema crea una sesión autenticada y le concede acceso al área de trabajo

#### Scenario: Credenciales rechazadas
- GIVEN un usuario presenta credenciales incorrectas
- WHEN el usuario intenta iniciar sesión
- THEN el sistema niega el acceso e informa del error de autenticación

---

### Requirement: Protección de capacidades internas
El sistema DEBE impedir el acceso a cualquier capacidad interna a quien no haya iniciado sesión.

#### Scenario: Acceso no autenticado bloqueado
- GIVEN un visitante no ha iniciado sesión
- WHEN el visitante intenta acceder a una capacidad interna
- THEN el sistema redirige al inicio de sesión

---

### Requirement: Identidad del usuario en sesión
El sistema DEBE mantener visible la identidad (nombre y foto) del usuario autenticado mientras dure su sesión.

#### Scenario: El usuario reconoce con qué identidad actúa
- GIVEN un usuario autenticado
- WHEN el usuario navega por el sistema
- THEN el sistema presenta de forma persistente el nombre y la foto del usuario en sesión