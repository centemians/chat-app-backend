import { compare, hash } from "bcryptjs";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { createAccessToken, createRefreshToken } from "../Auth/auth";
import { isAuth } from "../Auth/isAuth";
import { User, UserModel } from "../entities/User";
import { MyContext } from "../MyContext";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users() {
    const allUsers = await UserModel.find({});
    return allUsers;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() ctx) {
    return `your user id is: ${ctx.payload.userId}`;
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async getLoggedInUser(@Ctx() ctx): Promise<User> {
    const userId = ctx.payload.userId;
    const user = await UserModel.findById(userId);

    return user;
  }

  @Mutation(() => Boolean)
  async registerUser(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const hashedPassword = await hash(password, 12);
      await UserModel.create({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error("Could not find user!");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("bad password");
    }

    //login successful
    ctx.res.cookie("jid", createRefreshToken(user), {
      httpOnly: true,
    });

    return {
      accessToken: createAccessToken(user),
    };
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("user_id") user_id: string) {
    const user = await UserModel.findById(user_id);
    await UserModel.findByIdAndUpdate(user_id, {
      token_version: user.token_version + 1,
    });

    return true;
  }
}
