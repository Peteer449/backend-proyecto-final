import express from "express";
import { cartsRouter } from "./routes/carritos.js";
import { productsRouter } from "./routes/products.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/productos', productsRouter);
app.use('/api/carritos', cartsRouter);

const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
server.on('error', error => console.log(`Error in server ${error}`));