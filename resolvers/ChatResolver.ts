import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Subscription,
  Root,
} from "type-graphql";
import { withFilter } from "apollo-server-express";
import { Chat, ChatModel } from "../entities/Chat";
import { pubsub } from "../helpers/PubsubHelper";

@Resolver()
export class ChatResolver {
  @Query(() => Boolean)
  async tempQuery() {
    console.log("hello world!");
    return false;
  }

  @Subscription(() => Chat, {
    subscribe: withFilter(
      () => pubsub.asyncIterator("UPDATE_MESSAGE"),
      (payload, variables, _context, _info) => {
        if (variables.room_id === payload.room_id) {
          return true;
        }
        return false;
      }
    ),
  })
  updateMessage(@Arg("room_id") room_id: string, @Root() message: any): Chat {
    console.log("message is: ", message);
    return message;
  }

  @Query(() => [Chat])
  async allChatsOfRoom(@Arg("room_id") room_id: string) {
    const allChats = await ChatModel.find({ room_id });
    return allChats;
  }

  @Mutation(() => Boolean)
  async createMessage(
    @Arg("room_id") room_id: string,
    @Arg("message") message: string,
    @Arg("created_by") created_by: string
  ) {
    const chatMessage = await ChatModel.create({
      message,
      room_id,
      created_by,
    });

    console.log("chat message is: ", chatMessage.toObject());
    pubsub.publish("UPDATE_MESSAGE", chatMessage);

    return true;
  }
}
