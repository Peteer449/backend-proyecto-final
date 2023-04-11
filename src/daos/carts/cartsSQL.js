import { ContenedorMysql } from "../../managers/ContenedorMysql.js";

class CartsDaoSQL extends ContenedorMysql{
    constructor(options,tableName){
        super(options,tableName);
    }
};


export {CartsDaoSQL};