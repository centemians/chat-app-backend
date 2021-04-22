import { Resolver, Mutation, Arg, Query } from "type-graphql";
import { Room, RoomModel } from "../entities/Room";

@Resolver()
export class RoomResolver {
  //Query for getting all the Rooms.
  @Query(() => [Room])
  async getAllRooms() {
    const rooms = await RoomModel.find({});
    return rooms;
  }

  // Query for creating a room
  @Mutation(() => Room)
  async createRoom(@Arg("room_name") room_name: string): Promise<Room> {
    const room = await RoomModel.create({
      room_name,
      created_by: "Abhishek",
    });

    return room;
  }
}
