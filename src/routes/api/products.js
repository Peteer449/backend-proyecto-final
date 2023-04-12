import express from "express";
import { checkAdminRole } from "../../middlewares/checkRole.js";
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

productsRouter.post('/', checkAdminRole, async (req, res) => {
    const response = await productosApi.save(req.body);
    res.json(response)
})

productsRouter.put('/:id', checkAdminRole, async (req, res) => {
    const productId = req.params.id;
    const response = await productosApi.updateById(productId);
    res.json(response);
})

productsRouter.delete('/:id', checkAdminRole, async (req, res) => {
    const productId = req.params.id;
    await productosApi.deleteById(productId);
    const allProducts = await productosApi.getAll()
    res.render("products",{allProducts})
})

export {productsRouter}