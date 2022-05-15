import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import {createConnection, getRepository} from "typeorm";
import helmet from "helmet";
import bodyParser from "body-parser";
import routes from "./routes";
import {Chat} from "./entity/chat";

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

  const upload = require('express-fileupload');
  const http = require('http');
  const app = express();
  const server = http.createServer(app);
  const port = 8080;
  const io = require('socket.io')(server, { cors: {
    origins: ['http://localhost:4200']
  }});

  //middlewares
  app.use(helmet());
  app.use(cors({
    origin: ['http://localhost:4200']
  }))
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(upload());

  //routes
  app.use("/api", routes);

  //chat
  io.sockets.on('connection', (socket: any) => {
    socket.on('join', (data: any) => {
      socket.join(+data);
      socket.broadcast.to(+data).emit('user joined');
    });
    socket.on('message', (data: any) => {
      io.sockets.in(+data.room).emit('new message', {user: data.user, message: data.message, room: data.room});
    });
    socket.on('typing', (data: any) => {
      io.sockets.in(+data.room).emit('typing', data);
    })
  });

  //listen
  server.listen(port, () => {
    console.log(`App running on port: \x1b[32m${port}\x1b[0m`);
  });
}

main()
