import { ContenedorFirebase } from "../../managers/ContenedorFirebase.js";

class OrdersDaoFirebase extends ContenedorFirebase{
    constructor(options,tableName){
        super(options,tableName);
    }
};

export {OrdersDaoFirebase};