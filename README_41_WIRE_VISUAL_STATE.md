# Fix 41 — Wire visible después de guardar

- Conserva inmediatamente el edge optimista en el estado visual de React Flow.
- Evita que el efecto de sincronización lo elimine durante el render siguiente.
- Retira el edge pendiente cuando el modelo persistido ya contiene la conexión.
- Limpia también el estado pendiente al desconectar.
- No modifica Backend, tipos, endpoints ni arquitectura del editor.
