import express from "express";
import { ContenedorDaoProductos } from "../../daos/index.js";
const productosApi = ContenedorDaoProductos;

// products router
const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
    if(req.session.user){
    const allProducts = await productosApi.getAll()
    res.render("products",{allProducts})
    }else{
        res.render("login")
    }
})

productsRouter.get('/:id', async (req, res) => {
    const productId = req.params.id;
    const allProducts = await productosApi.getById(productId);
    res.json(allProducts)
})

productsRouter.post('/', async (req, res) => {
    await productosApi.save(req.body);
    const allProducts = await productosApi.getAll()
    res.render("products",{allProducts})
})

productsRouter.put('/:id', async (req, res) => {
    const productId = req.params.id;
    let updated = true
    const response = await productosApi.updateById(updated,productId);
    res.json(response);
})

productsRouter.delete('/:id', async (req, res) => {
    const productId = req.params.id;
    await productosApi.deleteById(productId);
    const allProducts = await productosApi.getAll()
    res.json(allProducts)
})

export {productsRouter}