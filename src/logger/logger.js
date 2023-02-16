import log4js from "log4js";
import { envConfig } from "../envConfig.js";

log4js.configure({
    appenders:{
        //definimos las salidas
        consola:{type:"console"},
        warns:{type:"file",filename:"./src/logs/warns.log"},
        errores:{type:"file",filename:"./src/logs/errores.log"},
        //definir una salida con un nivel
        consolaInfo:{type:'logLevelFilter',appender:'consola', level:'info'},
        consolaDebug:{type:'logLevelFilter',appender:'consola', level:'debug'},
        archivoWarns:{type:"logLevelFilter",appender:"warns",level:"warn"},
        archivoErrores:{type:'logLevelFilter', appender:'errores', level:'error'}
    },
    categories:{
        default:{appenders:['consolaInfo'], level:'all'},
        prod:{appenders:['archivoWarns','archivoErrores','consolaInfo'],level:'all'}
    }
});

let logger = null;
if(envConfig.NODE_ENV === "production"){
    logger = log4js.getLogger('prod');//categoria prod
} else{
    logger = log4js.getLogger();//catagoria default
};

export {logger};