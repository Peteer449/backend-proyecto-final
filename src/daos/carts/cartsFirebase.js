import { ContenedorFirebase } from "../../managers/ContenedorFirebase.js";

class CartsDaoFirebase extends ContenedorFirebase{
    constructor(options,tableName){
        super(options,tableName);
    }
};

export {CartsDaoFirebase};