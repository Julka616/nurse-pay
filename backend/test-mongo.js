const { MongoClient, ServerApiVersion } = require("mongodb");


const uri =
"mongodb+srv://ctrlz0562_db_user:TWOJE_HASLO@nurse-pay-db.syiimyj.mongodb.net/?appName=nurse-pay-db";


const client = new MongoClient(uri, {
    serverApi:{
        version: ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true
    }
});


async function run(){

    try{

        await client.connect();

        await client.db("admin")
        .command({ping:1});


        console.log(
            "MongoDB działa ✅"
        );


    }catch(err){

        console.log(
            "Błąd:",
            err.message
        );

    }
    finally{

        await client.close();

    }

}


run();