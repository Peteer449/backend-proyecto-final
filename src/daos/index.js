import { options } from "../config/databaseConfig.js";

let ContenedorDaoProductos;
let ContenedorDaoCarts;
let ContenedorDaoMessage;
let ContenedorDaoOrders

let databaseType = "firebase";

switch(databaseType){
    case "filesystem":
        const {ProductsDAOArchivos} = await import("./products/productsArchivo.js");
        const {CartsDAOArchivos} = await import("./carts/cartsArchivos.js");
        ContenedorDaoProductos = new ProductsDAOArchivos(options.fileSystem.pathProducts);
        ContenedorDaoCarts = new CartsDAOArchivos(options.fileSystem.pathCarts);
    break;

    case "sql":
        const {ProductsDaoSQL} = await import("./products/productsSQL.js");
        const {CartsDaoSQL} = await import("./carts/cartsSQL.js");
        ContenedorDaoProductos = new ProductsDaoSQL(options.sqliteDB,"productos");
        ContenedorDaoCarts = new CartsDaoSQL(options.sqliteDB,"carritos");
    break;

    case "mongo":
        const {ProductsDaoMongo} = await import("./products/productsMongo.js")
        const {CartsDaoMongo} = await import("./carts/cartsMongo.js")
        ContenedorDaoProductos = new ProductsDaoMongo(options.mongoDB,"productos")
        ContenedorDaoCarts = new CartsDaoMongo(options.mongoDB,"carritos")
    break;

    case "firebase":
        const {ProductsDaoFirebase} = await import("./products/productsFirebase.js")
        const {CartsDaoFirebase} = await import("./carts/cartsFirebase.js")
        const {OrdersDaoFirebase} = await import("./orders/ordersFirebase.js")
        ContenedorDaoProductos = new ProductsDaoFirebase(options.firebase,"productos")
        ContenedorDaoCarts = new CartsDaoFirebase(options.firebase,"carritos")
        ContenedorDaoMessage = new CartsDaoFirebase(options.firebase,"mensajes")
        ContenedorDaoOrders = new OrdersDaoFirebase(options.firebase,"ordenes")
    break;
};

export {ContenedorDaoProductos,ContenedorDaoCarts,ContenedorDaoMessage,ContenedorDaoOrders};