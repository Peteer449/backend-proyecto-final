import express from "express";
import { ContenedorDaoCarts, ContenedorDaoProductos } from "../daos/index.js";
import { transporter,adminEmail } from "../messages/email.js"
import {twilioClient, twilioPhone, adminPhone} from "../messages/wpp.js"

const productosApi = ContenedorDaoProductos;
const carritosApi = ContenedorDaoCarts;

//router carritos
const cartsRouter = express.Router();

cartsRouter.get('/', async (req, res) => {
    const allProducts = await carritosApi.getAll();
    let totalPrice=0
    const allProductsMaped=allProducts.map(e=>e.product.products)
    allProductsMaped[0].map(i=>totalPrice += parseInt(i.price))
    let allProductsMapedArray = allProductsMaped[0]
    console.log(allProductsMapedArray)
    res.render("carrito",{allProductsMapedArray,totalPrice})
})

cartsRouter.post('/', async (req, res) => {
    let {id,title,price,image} = req.body
    let allProducts = await carritosApi.getAll();
    let response
    if(allProducts.length !== 0){
        response = await carritosApi.save({ products: [{id,title,price,image}], timestamp: new Date().toLocaleDateString()},true);
    }else{
        response = await carritosApi.save({ products: [{id,title,price,image}], timestamp: new Date().toLocaleDateString()});
    }
    allProducts = await carritosApi.getAll();
    const allProductsMaped=allProducts.map(e=>e.product.products)
    let totalPrice=0
    allProductsMaped[0].map(i=>totalPrice += parseInt(i.price))
    let allProductsMapedArray = allProductsMaped[0]
    res.render("carrito",{allProductsMapedArray,totalPrice})
})

cartsRouter.post("/comprar", async (req, res) => {
    let {name,phone,mail} = req.session.user
    const allProducts = await carritosApi.getAll();
    try {
        await transporter.sendMail({
            from: "server app Node",
            to: adminEmail,
            subject: "Nueva compra",
            html: `<div class="d-flex justify-content-evenly">
        <h1>Nuevo pedido de: ${name}  (${mail})</h1>
        <h3>${allProducts.map(e=>e.product.products)[0].map(j=>j.title)} <h3> ${allProducts.map(e=>e.product.products)[0].map(j=>j.price)}</h3></h3>
      </div>`
        })
        await twilioClient.messages.create({
            from: twilioPhone,
            to: adminPhone,
            body:`
        Nuevo pedido de: ${name}  (${mail})
        ${allProducts.map(e=>e.product.products)[0].map(j=>j.title)} ${allProducts.map(e=>e.product.products)[0].map(j=>j.price)}
        `
        })
        await twilioClient.messages.create({
            from: twilioPhone,
            to: phone,
            body: `Pedido recibido`
        })
        res.render("compra",{allProducts})
    } catch (error) {
        res.send(error)
    }
})


cartsRouter.delete('/:id', async (req, res) => {
    const cartId = req.params.id;
    res.json(await carritosApi.deleteById(cartId));
})

cartsRouter.get('/:id', async (req, res) => {
    const cartId = req.params.id;
    const response = await carritosApi.getById(cartId);
    res.json(response);
})

cartsRouter.get('/:id/productos', async (req, res) => {
    const cartId = req.params.id;
    const carritoResponse = await carritosApi.getById(cartId);
    if(carritoResponse.error){
        res.json(carritoResponse);
    } else{
        const getData = async()=>{
            const products = await Promise.all(carritoResponse.message.products.map(async(element) => {
                const productResponse = await productosApi.getById(element);
                return productResponse.message
            }));
            res.json({products: products});
        }
        getData();
    }
})

cartsRouter.post('/:id/productos', async (req, res) => {
    const cartId = req.params.id;
    const productId = req.body.id;
    const carritoResponse = await carritosApi.getById(cartId);
    if(carritoResponse.error){
        res.json({message:`El carrito con id: ${cartId} no fue encontrado`});
    } else{
        const productoResponse = await productosApi.getById(productId);
        if(productoResponse.error){
            res.json(productoResponse);
        } else{
            carritoResponse.message.products.push(productoResponse.message.id);
            const response = await carritosApi.updateById(carritoResponse.message, cartId);
            res.json({message:"product added"});
        }
    }
})

cartsRouter.delete('/:id/productos/:idProd', async (req, res) => {
    const cartId = req.params.id;
    const productId = req.params.idProd;
    const carritoResponse = await carritosApi.getById(cartId);
    if(carritoResponse.error){
        res.json({message:`El carrito con id: ${cartId} no fue encontrado`});
    } else{
        const index = carritoResponse.message.products.findIndex(p => p === productId);
        if (index !== -1) {
            carritoResponse.message.products.splice(index, 1);
            await carritosApi.updateById(carritoResponse.message, cartId);
            res.json({message:"product deleted"});
        } else{
            res.json({message:`El producto no se encontro en el carrito: ${productId}`});
        }
    }
})

export {cartsRouter}