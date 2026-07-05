# ReturnIQ — Portal Vendedor

---

## Docker 

Solo necesitan tener Docker Desktop instalado.

```powershell
docker compose up --build
```

Esperar a que aparezca `Backend en http://localhost:3002` en los logs y abrir:

Portal Comprador
```
http://localhost:5173/buyer
```

Portal Vendedor
```
http://localhost:5173/seller/login
```

Para detener:

```powershell
docker compose down
```

Para reiniciar desde cero (borra datos):

```powershell
docker compose down -v
docker compose up --build
```


## Credenciales de demo

| Campo    | Valor                   |
|----------|-------------------------|
| Email    | vendedor@returniq.com   |
| Password | demo1234                |
| Comprador| ORD-2025-00001          |
| Comprador| ORD-2025-00002          |

