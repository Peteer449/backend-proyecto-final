const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const app = express()
const handlebars = require("express-handlebars")



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json())
app.engine("handlebars",handlebars.engine())
app.set("views",path.join(__dirname,"views"))
app.set("view engine","handlebars")
app.use(express.static("./views"))


//Port of the server
const PORT = process.env.PORT || 8080

//Import classes
const ProductsClass = require("./ProductsClass")
const productClass = new ProductsClass()
const CartClass = require("./CartClass")
const cartClass = new CartClass()

//Server listener
const server = app.listen(PORT,()=>console.log(`Server listening on port ${PORT}`))

//Routers
const routerProducts = express.Router()
const routerCart = express.Router()

//Index of the page
app.get('/', (req, res) => {
  res.render("home")
});

//Delete a product by id
routerProducts.delete("/:id",async(req,res)=>{
  const id = req.params.id
  await productClass.deleteById(parseInt(id))
  const allProducts = await productClass.getAll()
  res.json(allProducts)
})

//Update a product by id
routerProducts.put("/:id",async(req,res)=>{
  const id =  req.params.id
  const product = await productClass.getById(parseInt(id))
  product.actualizado = "Actualizado"
  const allProducts = await productClass.getAll()
  res.json(allProducts)
})

//Add a new item in routerProducts
routerProducts.post("/", (req,res)=>{
  const title = req.body.title
  const description = req.body.description
  const price = req.body.price
  const stock = req.body.stock
  const image = req.body.image
  const code = req.body.code
  console.log(JSON.stringify(req.body),title,description,price,stock,code,image)
  productClass.save({title,description,time:new Date().toLocaleTimeString(),price,stock,code,image})
  const allProducts = productClass.getAll()
  if(allProducts.length){
    res.render("products",{allProducts})
  }else{
    res.render("productsEmpty")
  }
})

//Get one item from the routerProducts
routerProducts.get("/:id",async(req,res)=>{
  const id = req.params.id
  const product = await productClass.getById(parseInt(id))
  if(!product){
    res.json({error:'producto no encontrado'})
  }
  res.json(product)
})

//Get all the products from the router class
routerProducts.get("/",async(req,res)=>{
  const allProducts = await productClass.getAll()
  if(allProducts.length){
    res.render("products",{allProducts})
  }else{
    res.render("productsEmpty")
  }
})


routerCart.post("/",async(req,res)=>{
  let id = await cartClass.createCart()
  res.json(id)
})

routerCart.delete("/:id",async(req,res)=>{
  await cartClass.deleteCart(req.params.id)
})

routerCart.get("/:id/productos",async(req,res)=>{
  res.json(await cartClass.getAllProducts())
})

routerCart.post("/:id/productos",async(req,res)=>{
  let id = req.body.id
  await cartClass.saveProduct(id)
  res.json(await cartClass.getAllProducts())
})

routerCart.delete("/:id/productos/:id_prod",async(req,res)=>{
  let id_prod = req.params.id_prod
  await cartClass.deleteById(id_prod)
  res.json(await cartClass.getAllProducts())
})


//Define the path of the router
app.use("/api/productos", routerProducts)
app.use("/api/carrito",routerCart)