import express from "express";
import { ContenedorDaoCarts,ContenedorDaoOrders } from "../../daos/index.js";
import { transporter,adminEmail } from "../../messages/email.js"
import {twilioClient, twilioPhone, adminPhone} from "../../messages/wpp.js"
import cookieParser from "cookie-parser";

const carritosApi = ContenedorDaoCarts;
const ordenesApi = ContenedorDaoOrders;

//router carritos
const cartsRouter = express.Router();
cartsRouter.use(cookieParser())

cartsRouter.get('/', async (req, res) => {
    if(req.session.user){
        let cookieEmail=req.cookies.email
        let allProducts = await carritosApi.getById(`${cookieEmail}`);
        allProducts = allProducts.products
        let totalPrice=0
        if(allProducts && allProducts.length !==0){
            allProducts.map(i=>totalPrice += i.price)
            let allProductsMapedArray = allProducts
            res.render("carrito",{allProductsMapedArray,totalPrice,cookieEmail})
        }else{
            let canBuy = "disabled"
            res.render("carrito",{totalPrice,canBuy})
        }
    }else{
        res.render("login")
    }
})

cartsRouter.post('/', async (req, res) => {
    let {id,title,price,image} = req.body
    let cookieEmail=req.cookies.email
    let allProducts = await carritosApi.getById(`${cookieEmail}`);
    allProducts = allProducts.products
    let response
    if(allProducts){
        response = await carritosApi.save({id,title,price,image},`${cookieEmail}`, new Date().toLocaleDateString(),true);
    }else{
        response = await carritosApi.save({id,title,price,image},`${cookieEmail}`, new Date().toLocaleDateString(),false);
    }
    allProducts = response.products;
    let totalPrice=0
    allProducts.map(i=>totalPrice += i.price)
    let allProductsMapedArray = allProducts
    res.render("carrito",{allProductsMapedArray,totalPrice,cookieEmail})
})

cartsRouter.post("/comprar", async (req, res) => {
    let {name,phone,mail} = req.session.user
    let cookieEmail=req.cookies.email
    let allProducts = await carritosApi.getById(`${cookieEmail}`);
    allProducts = allProducts.products
    try {
        await transporter.sendMail({
            from: "server app Node",
            to: adminEmail,
            subject: "Nueva compra",
            html: `<div class="d-flex justify-content-evenly">
        <h1>Nuevo pedido de: ${name}  (${mail})</h1>
        <h3>${allProducts.map(j=>`${j.title} ` + `${j.price}`)}</h3>
      </div>`
        })
        await twilioClient.messages.create({
            from: twilioPhone,
            to: adminPhone,
            body:`
        Nuevo pedido de: ${name}  (${mail})
        ${allProducts.map(j=>`${j.title} ` + `${j.price}`)}
        `
        })
        let totalPrice=0
        allProducts.map(i=>totalPrice += i.price)
        await carritosApi.deleteById(`${cookieEmail}`)
        await ordenesApi.saveOrder({allProducts,mail,totalPrice})
        res.render("compra",{allProducts,totalPrice})
    } catch (error) {
        res.send(error)
    }
})


cartsRouter.delete('/:id', async (req, res) => {
    const cartId = req.params.id;
    await carritosApi.deleteById(cartId)
    res.json({mensaje:`Borraste el carrito de ${cartId}`})
})

cartsRouter.get('/:id', async (req, res) => {
    const cartId = req.params.id;
    const response = await carritosApi.getById(cartId);
    res.json(response);
})


cartsRouter.post('/:id/productos/:idProd', async (req, res) => {
    const cartId = req.params.id;
    const productId = req.params.idProd;
    const carritoResponse = await carritosApi.getById(cartId);
    if(carritoResponse.error){
        res.json({message:`El carrito con id: ${cartId} no fue encontrado`});
    } else{
        const index = carritoResponse.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            carritoResponse.products.splice(index, 1);
            await carritosApi.updateById(carritoResponse, cartId);
            res.redirect("/api/carritos");
        } else{
            res.json({message:`El producto no se encontro en el carrito: ${productId}`});
        }
    }
})

export {cartsRouter}