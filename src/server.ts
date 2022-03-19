import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import {createConnection} from "typeorm";
import helmet from "helmet";
import bodyParser from "body-parser";
import routes from "./routes";

const main = async () => {

    //db connection
    try {
        await createConnection({
            "type": "mariadb",
            "host": "localhost",
            "port": 3306,
            "username": "socialnetwork",
            "password": "socialnetwork",
            "database": "socialnetwork",
            "synchronize": true,
            "logging": true,
            "entities": [
                "src/entity/*.ts"
            ]
        });
        console.log("Database connection status: \x1b[32mSUCCESSFUL\x1b[0m");
    } catch (e) {
        console.log("Database connection status: \x1b[35mUNSUCCESSFUL\x1b[0m")
    }

    const server = express();
    const port = 8080;

    //middlewares
    server.use(helmet());
    server.use(cors({
        origin: ['http://localhost:4200']
    }))
    server.use(bodyParser.json());

    //routes
    server.use("/api", routes);

    //listen
    server.listen(port, () => {
        console.log(`App running on port: \x1b[32m${port}\x1b[0m`);
    });
}

main()
