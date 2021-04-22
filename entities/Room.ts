import { ObjectType, Field, ID } from "type-graphql";
import {
  prop,
  modelOptions,
  buildSchema,
  addModelToTypegoose,
  mongoose,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@ObjectType()
@modelOptions({ options: { allowMixed: 0 } })
export class Room extends TimeStamps {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: false })
  @prop({ required: true })
  room_name: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false })
  created_by: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false })
  updated_by: string;
}

const RoomSchema = buildSchema(Room, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

export const RoomModel = addModelToTypegoose(
  mongoose.model("Room", RoomSchema),
  Room
);
