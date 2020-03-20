import {Request, Response} from "express";
import {User} from "../entity/User";
import {redis} from "../redis";
import {EMAIL_CONFIRMED, INVALID_CONFIRMATION} from "../messages";

export const confirmEmail = async (req : Request, res : Response) => {
  const {id} = req.params;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({
      id: userId
    }, {confirmed: true});
    await redis.del(id);

    res.send(EMAIL_CONFIRMED);
  } else {
    res.send(INVALID_CONFIRMATION);
  }
};
