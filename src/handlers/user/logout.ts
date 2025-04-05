import { User } from "../../models";

export async function logoutHandler(userId: string) {
  await User.updateOne(
    { id: userId, del: { $ne: true } },
    { $unset: { refreshToken: 1 } }
  );
}
