import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class ProductsDaoMongo extends ContenedorMongo{
    constructor(options,tableName){
        super(options,tableName);
    }
};

export {ProductsDaoMongo};