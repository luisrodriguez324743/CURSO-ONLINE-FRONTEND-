# Curso Online Frontend

Frontend administrativo desarrollado con Angular 22 para gestionar pagos,
facturas y certificados del sistema de cursos online.

## Ejecutar en local

Desde esta carpeta instala las dependencias y levanta el servidor Angular:

```powershell
npm install
npm start
```

Luego abre:

```text
http://localhost:4200/
```

## Backend utilizado

El frontend consume los servicios de la API REST del backend, ejecutado localmente en la siguiente dirección:

URL del backend:

```text
http://127.0.0.1:8000
```

Documentación interactiva de la API (Swagger):

```text
http://127.0.0.1:8000/docs
```
Iniciar el backend

Desde la raíz del proyecto backend, abre una terminal y ejecuta:

python -m src.main

El backend debe estar ejecutándose antes de usar el frontend.

## Video del punto 6

Video de demostración - Punto 6

Se adjunta el video de demostración del funcionamiento de la aplicación, en el que se evidencia la ejecución local del frontend y el backend, la navegación entre los módulos y las solicitudes HTTP realizadas, incluyendo las operaciones GET, POST, PUT y DELETE desde el panel Network del navegador.

[Ver presentación en video del proyecto]

(https://drive.google.com/file/d/1CWxqlt0WjvPTP1YuoiQUMmZdg8G-56W1/view)

## Compilar

```powershell
npm run build
```
