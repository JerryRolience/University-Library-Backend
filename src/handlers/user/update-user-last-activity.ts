import { User } from "../../models";

export async function updateUserLastActivityHandler(userId: string) {
  const user = await User.findOne({ id: userId, del: { $ne: true } });
  if (!user) throw new Error("User not found");

  // Check if already updated today
  const lastUpdated = user.lastActivityDate;
  const today = new Date();
  const isSameDay =
    lastUpdated &&
    lastUpdated.getDate() === today.getDate() &&
    lastUpdated.getMonth() === today.getMonth() &&
    lastUpdated.getFullYear() === today.getFullYear();

  if (isSameDay) {
    return user; // No update needed
  }

  // Update if not already done today
  user.lastActivityDate = today;
  await user.save();

  return user;
}
