import express from "express";
import {fileURLToPath} from 'url';
import path from "path"
import cookieParser from "cookie-parser";
import session from "express-session";
import handlebars from "express-handlebars"
import passport from "passport";
import MongoStore from "connect-mongo"; 
import flash from "connect-flash"
import { logger } from "./logger/logger.js"
import { UserModel } from "./models/modelsMongo.js";
import { envConfig } from "./envConfig.js";
import mongoose from "mongoose";
import parseArgs from "minimist"
import {Server} from "socket.io"
import { normalize, schema } from "normalizr";
import { ContenedorDaoMessage } from "./daos/index.js";
import {router} from "./routes/index.js"



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

app.use("" , router)

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
