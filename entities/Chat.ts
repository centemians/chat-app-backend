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
export class Chat extends TimeStamps {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  @prop()
  message: string;

  @Field(() => String, { nullable: false })
  @prop({ required: true })
  room_id: string;

  @Field(() => String, { nullable: false })
  @prop({ required: true })
  created_by: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false })
  updated_by: string;
}

const ChatSchema = buildSchema(Chat, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

export const ChatModel = addModelToTypegoose(
  mongoose.model("Chat", ChatSchema),
  Chat
);
