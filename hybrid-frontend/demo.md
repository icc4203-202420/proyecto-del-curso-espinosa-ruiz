# Correr la aplicación

## Backend

Posicionarse sobre la carpeta backend y correr el comando:
```shell
rails s -b 0.0.0.0 -p 3001
```

## Frontend

- Tener descargado expo en el celular.
- Ir al archivo components/config.js y cambiar la variable BaseIP de la siguiente manera:
```js
const config = {
    BaseIP: 'http://{TU_IP}:3001/api/v1',
  };
```
Quedando de la siguente manera:
```js
const config = {
    BaseIP: 'http://192.168.1.92:3001/api/v1',
  };
```
Luego posicionarse sobre la carpeta hybrid-frontend y correr el comando
```shell
npx expo start -c
```
Apareciendo el codigo QR para escanearlo con la camara del celular y correr nuestra aplicación en la aplicacion de expo en el celular.