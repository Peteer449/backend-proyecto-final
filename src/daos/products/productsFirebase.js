import { ContenedorFirebase } from "../../managers/ContenedorFirebase.js";

class ProductsDaoFirebase extends ContenedorFirebase{
    constructor(options,tableName){
        super(options,tableName);
    }
};

export {ProductsDaoFirebase};