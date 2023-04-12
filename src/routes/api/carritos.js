import express from "express";
import { ContenedorDaoCarts, ContenedorDaoProductos } from "../../daos/index.js";
import { transporter,adminEmail } from "../../messages/email.js"
import {twilioClient, twilioPhone, adminPhone} from "../../messages/wpp.js"
import cookieParser from "cookie-parser";

const productosApi = ContenedorDaoProductos;
const carritosApi = ContenedorDaoCarts;

//router carritos
const cartsRouter = express.Router();
cartsRouter.use(cookieParser())

cartsRouter.get('/', async (req, res) => {
    if(req.session.user){
        let cookieEmail=req.cookies.email
        let allProducts = await carritosApi.getById(`${cookieEmail}`);
        allProducts = allProducts.products
        let totalPrice=0
        if(allProducts){
            allProducts.map(i=>totalPrice += i.price)
            let allProductsMapedArray = allProducts
            res.render("carrito",{allProductsMapedArray,totalPrice,undefined,cookieEmail})
        }else{
            let canBuy = "disabled"
            res.render("carrito",{undefined,totalPrice,canBuy})
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
    res.render("carrito",{allProductsMapedArray,totalPrice})
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
        res.render("compra",{allProducts,totalPrice})
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
        console.log(carritoResponse)
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