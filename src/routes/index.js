import express from "express";
import { logger } from "../logger/logger.js";
import { productsRouter } from "./api/products.js";
import { cartsRouter } from "./api/carritos.js";
import { signupRouter } from "./api/signup.js";
import { loginRouter } from "./api/login.js";
import os from "os"


const router = express.Router()

router.get('/', (req, res) => {
  if(req.session.user){
    res.render("home")
  }
  else{
    res.redirect("/login")
  }
  logger.info("Ruta: "+req.url+"  Metodo: GET")
})


router.get("/profile",(req,res)=>{
  let {name,age,phone,image,adress,mail} = req.session.user
  res.render("profile",{name,age,phone,image,adress,mail})
})

router.get("/info",(req,res)=>{
  const {argv,platform,versions,pid,execPath,memoryUsage} = process
  res.json(
    {
      plataforma:platform,
      versionNode:versions.node,
      RSS:memoryUsage.rss(),
      pathEjecucion:execPath,
      processID:pid,
      carpetaProyecto:argv[1],
      procesadores:os.cpus().length
    }
  )
})



router.use('/api/productos', productsRouter);
router.use('/api/carritos', cartsRouter);
router.use('/', signupRouter)
router.use('/', loginRouter)

export {router}