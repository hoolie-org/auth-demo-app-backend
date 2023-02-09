import axios from "axios";
import {ObjectId, OptionalId} from "mongodb";
import {MiddlewareHandler, Response} from "yet-another-http/dist";
import config from "../config";
import {$db} from "../helpers/makeDb";
import io from "../helpers/makeSocketIo";
import UserModel from "../models/User";

const handler: MiddlewareHandler = async(request) => {

  // Get request data
  const {socketId, userId} = request.fields;
  if(typeof socketId !== "string" || typeof userId !== "string" || !ObjectId.isValid(userId)) {
    return new Response(400, "Wrong data");
  }

  // Fetch user info from Hoolie Auth
  let userInfo: UserModel;
  try {
    userInfo = (await axios.get<UserModel>(`${config.HOOLIE_AUTH_ENDPOINT}/getUser`, {
      params: {
        userId: userId
      }
    })).data;
  }
  catch {
    return new Response(404, "Can't find user");
  }

  const userInfoWithoutId: OptionalId<UserModel> = userInfo;
  delete userInfoWithoutId._id;

  // Save user info to DB
  const dbResult = await $db.users.findOneAndUpdate({
    telegramId: userInfo.telegramId
  }, {
    $set: {
      ...userInfoWithoutId
    }
  }, {upsert: true, returnDocument: "after"});

  // Send socket data to client
  io.to(socketId).emit("authentication", dbResult.value?._id);

  // Send OK
  return new Response(200, "OK");
};

export default handler;
