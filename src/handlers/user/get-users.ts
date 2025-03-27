import { User } from "../../models";

export async function getUsersHandler() {
  const users = await User.find({ del: { $ne: true } });    
  return users;
}
