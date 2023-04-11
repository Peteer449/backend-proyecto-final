import express from "express";
import {fileURLToPath} from 'url';
import path from "path"
import { cartsRouter } from "./routes/carritos.js";
import { productsRouter } from "./routes/products.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import handlebars from "express-handlebars"
import passport from "passport";
import MongoStore from "connect-mongo"; 
import { Strategy as LocalStrategy} from "passport-local";
import bcrypt from "bcrypt"
import flash from "connect-flash"
import { logger } from "./logger/logger.js"
import { transporter,adminEmail } from "./messages/email.js"
import { UserModel } from "./models/modelsMongo.js";
import { envConfig } from "./envConfig.js";
import mongoose from "mongoose";
import os from "os"
import cluster from "cluster";
import parseArgs from "minimist"
import {Server} from "socket.io"
import { normalize, schema } from "normalizr";
import { ContenedorDaoMessage } from "./daos/index.js";



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname+"/public"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars",handlebars.engine())
app.set("views",path.join(__dirname,"views"))
app.set("view engine","handlebars")
mongoose.set('strictQuery', true);
app.use(cookieParser())
app.use(flash())



/*

-------COOKIES AND MONGODB-------

*/
const advancedOptions = {useNewUrlParser:true,useUnifiedTopology:true}
app.use(session({
  store: MongoStore.create({
    mongoUrl:envConfig.BASE_DE_DATOS_SESSIONSDB,
    mongoOptions:advancedOptions,
    ttl:60
  }),
  secret:"clave",
  resave:false,
  saveUninitialized:false
}))
mongoose.connect(envConfig.BASE_DE_DATOS_CODERDB,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
},(error=>{
  if(error)logger.error("Conexion fallida")
  logger.info("conectado correctamente")
}))

/*

-------PASSPORT CONFIG-------

*/

app.use(passport.initialize())
app.use(passport.session())
app.use('/api/productos', productsRouter);
app.use('/api/carritos', cartsRouter);

passport.serializeUser((user,done)=>{
  return done(null,user.id)
})
passport.deserializeUser((id,done)=>{
  UserModel.findById(id,(error,userFound)=>{
    return done(error,userFound)
  })
})

//Port of the server
const optionsMinimist = {default:{p:8080, modo:"fork"},alias:{p:"port"}}
const argumentsMinimist = parseArgs(process.argv.slice(2),optionsMinimist)
const PORT = argumentsMinimist.port
const MODO = argumentsMinimist.modo

//Server listener
const server= app.listen(PORT,()=>logger.info(`Server listening on port ${PORT} on process ${process.pid}`))



/*

-------ROUTES-------

*/

app.get('/', (req, res) => {
    if(req.session.user){
      res.render("home")
    }
    else{
      res.redirect("/login")
    }
    logger.info("Ruta: "+req.url+"  Metodo: GET")
})


app.get("/profile",(req,res)=>{
  let {name,age,phone,image,adress,mail} = req.session.user

  res.render("profile",{name,age,phone,image,adress,mail})
})


/* 

-------LOGIN LOGOUT-------

*/
//Create websocket server
const io = new Server(server)



const authorSchema = new schema.Entity("authors",{},{idAttribute:"email"})//id:con el valor del campo email.
const messageSchema = new schema.Entity("messages",
    {
        author:authorSchema,
    }
)
const chatSchema = new schema.Entity("chats", {
  messages: [messageSchema]
})
const normalizarData = (data)=>{
  const dataNormalizada = normalize({id:"chatHistory", messages:data}, chatSchema)
  return dataNormalizada;
}
const normalizarMensajes = async()=>{
  const messages = await ContenedorDaoMessage.getAll()
  const normalizedMessages = normalizarData(messages)
  return normalizedMessages
}

io.on("connection",async (socket)=>{
  socket.emit("allMessages",await normalizarMensajes())
  socket.on("chatInput",async data=>{
    await ContenedorDaoMessage.saveMessage(data)
    io.sockets.emit("allMessages",await normalizarMensajes())
  })
})
app.get("/login",(req,res)=>{
  if(req.session.username){
    return res.send("Ya estas logueado")
  }
  else{
    res.render("login",{error:req.flash('error')[0]})
  }
})

app.get("/logout",(req,res)=>{
  const user = req.session.user
  req.session.destroy(error=>{
    if(!error)return res.render("logout",{user:user.name})
    res.send(`Error: ${error}`).status(500)
  })
})

passport.use("loginStrategy",new LocalStrategy(
  {
    usernameField:"mail"
  },
  (username,password,done)=>{
    UserModel.findOne({mail:username},(err,userFound)=>{
      if(err) return done(err)
      if(!userFound)return done(null,false,{message:"No se encontro el usuario"})
      if(userFound){
        bcrypt.compare(password, userFound.password, function(err, result) {
          if(result){
            return done(null,userFound)
          }
          return done(null,false,{message:"Contraseña incorrecta"})
      });
      }
    })
  }
))

app.post("/login",passport.authenticate("loginStrategy",{
  failureRedirect:"/login",
  failureMessage:true,
  failureFlash: true
}), async (req,res)=>{
  req.session.user = req.user
  res.cookie('email',req.user.mail)
  res.cookie('name',req.user.name)
  res.redirect("/")
})


/*

-------SIGNUP-------

*/


app.get("/signup",(req,res)=>{
  res.render("signup",{error:req.flash('error')[0]})
})

passport.use("signupStrategy",new LocalStrategy(
  {
    passReqToCallback:true,
    usernameField:"mail",
  },
  (req,username,password,done)=>{
    UserModel.findOne({mail:username},(err,userFound)=>{
      if(err) return done(err)
      if(userFound)return done(null,false,{message:"El usuario ya existe"})
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          const newUser = {
            name:req.body.name,
            adress:req.body.adress,
            age:req.body.age,
            phone:req.body.phone,
            image:req.body.image,
            mail:username,
            password:hash
          }
          UserModel.create(newUser,(error,userCreated)=>{
            if(err)return done(error,null,{message:"Error al crear el usuario"})
            return done(null,userCreated)
          })
        })
      })
    })
  }
))

app.post("/signup", passport.authenticate("signupStrategy",{
  failureRedirect:"/signup",
  failureMessage:true,
  failureFlash:true
}),async (req,res)=>{
  let {name,age,phone,image,adress,mail} = req.body
  try {
    await transporter.sendMail({
      from:"server app Node",
      to:adminEmail,
      subject:"Nuevo registro",
      html:`<div class="d-flex justify-content-evenly">
      <div>
        <h2>Informacion de la cuenta</h2>
        <hr/>
        <h3>Nombre: ${name}</h3>
        <h3>Calle: ${adress}</h3>
        <h3>Edad: ${age}</h3>
        <h3>Telefono: ${phone}</h3>
        <h3>Avatar: <img src="${image}" height="50"/> </h3>
        <h3>Mail: ${mail}</h3>
      </div>
    </div>`
    })
    res.redirect("/login")
  } catch (error) {
    res.send(error)
  }
})