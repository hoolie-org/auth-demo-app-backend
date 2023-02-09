import {ObjectId} from "mongodb";
import {MiddlewareHandler, Response} from "yet-another-http/dist";
import {$db} from "../helpers/makeDb";

const handler: MiddlewareHandler = async(request) => {

  // Get userId from request
  const {userId} = request.queryParams;
  if(typeof userId !== "string" || !ObjectId.isValid(userId)) {
    return new Response(404, "No such user found");
  }

  // Fetch user info from DB
  const $userId = new ObjectId(userId);
  const user = await $db.users.findOne({_id: $userId});
  if(!user) {
    return new Response(404, "User not found");
  }

  // Send user info
  return new Response(200, user as object);
};

export default handler;
