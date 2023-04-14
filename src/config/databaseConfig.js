import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const options = {
    sqliteDB:{
        client:"sqlite3",
        connection:{
            filename:path.join(__dirname , "../DB/ecommerce.sqlite")
        },
        useNullAsDefault:true
    },
    mongoDB:{
        client:"mongo",
        connection:{
            url: "mongodb://127.0.0.1:27017/ecommerce"
        },
        useNullAsDefault:true
    },
    firebase:{
        client:"firestore",
        connection:{
            url:"https://ecommerce-673af.firebase.io"
        }
    }
    
}