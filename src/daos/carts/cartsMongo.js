import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class CartsDaoMongo extends ContenedorMongo{
    constructor(options,tableName){
        super(options,tableName);
    }
};

export {CartsDaoMongo};