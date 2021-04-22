import { ObjectType, Field, ID } from "type-graphql";
import {
  prop,
  modelOptions,
  buildSchema,
  addModelToTypegoose,
  mongoose,
  ReturnModelType,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@ObjectType()
@modelOptions({ options: { allowMixed: 0 } })
export class User extends TimeStamps {
  @Field(() => ID)
  id: string;

  @Field({ nullable: false })
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;

  @prop({ default: 0 })
  token_version: number;
}

const UserSchema = buildSchema(User, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

export const UserModel = addModelToTypegoose(
  mongoose.model("User", UserSchema),
  User
);
