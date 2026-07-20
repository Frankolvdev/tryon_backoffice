# 06C · Proveedores OAuth restantes

Este incremento añade formularios especializados dentro de **Integraciones** para:

- GitHub OAuth
- Facebook OAuth
- Apple OAuth

## Contrato utilizado

Se conserva el contrato real del backend:

- `api_key`: Client ID, App ID o Services ID.
- `api_secret`: Client Secret, App Secret o Client Secret firmado.
- `config.redirect_uri`: URI de callback.
- `is_enabled`: publicación del proveedor.
- `status`: `enabled` o `disabled` según el interruptor.

Los campos secretos vacíos conservan la credencial ya almacenada.

## Importante

Este paquete permite administrar y publicar la configuración de los cuatro proveedores desde el BackOffice. La ejecución completa del flujo OAuth depende también de que el backend tenga implementado y registrado el cliente de intercambio de código del proveedor correspondiente. En el backend revisado, Google ya tiene cliente registrado; GitHub, Facebook y Apple todavía requieren sus clientes de proveedor para completar el callback real.
