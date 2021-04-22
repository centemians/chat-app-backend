import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import { buildSchema } from "type-graphql";
import * as http from "http";
import { ChatResolver } from "./resolvers/ChatResolver";
import { RoomResolver } from "./resolvers/RoomResolver";
import cors from "cors";
import { UserResolver } from "./resolvers/UserResolver";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { UserModel } from "./entities/User";
import { createAccessToken, createRefreshToken } from "./Auth/auth";

const main = async () => {
  // Build Schema for Resolvers, All the resolvers need to be added here
  const schema = await buildSchema({
    resolvers: [ChatResolver, RoomResolver, UserResolver],
    dateScalarMode: "isoDate", // "timestamp" or "isoDate"
    validate: false,
  });

  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
  };

  const app = express();
  const port = process.env.PORT || 9000;

  app.use(cors(corsOptions));
  app.use(cookieParser());

  //Db config
  const connectionUrl =
    "mongodb+srv://upsainian:M0HJvPbwiFFKDeEc@cluster0.dwdqf.mongodb.net/chatDb?retryWrites=true&w=majority";
  mongoose.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", (error) => console.error("error is: ", error));
  db.once("open", (error) => console.error("Connected to Database"));

  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: "/subscription",
    },
    context: async ({ req, connection, res }) => {
      // never throw error in graphql context
      return { req, res };
    },
    formatError: (error) => {
      // TODO :: For local we can pass the stacktrace but not for other envs
      return {
        message: error.message,
        extensions: {
          code: error?.extensions?.code,
        },
        name: error.name,
      };
    },
  });

  server.applyMiddleware({ app, path: "/graphql", cors: false });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  //routes
  app.get("/", (req, res) => res.status(200).send("hello world..."));

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    console.log("token is; ", token);
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.send({ ok: false, accessToken: "" });
    }

    console.log("payload is: ", payload);
    //token is valid and we can send an access token
    const user = await UserModel.findOne({ _id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.token_version !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    res.cookie("jid", createRefreshToken(user), {
      httpOnly: true,
    });

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  //listen
  //app.listen(port, () => console.log(`Listening on port: ${port}`));
  httpServer.listen({ port: port }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  });
};

main();
