import { ONE_MONTH_IN_MS, THREE_DAYS_IN_MS } from "../../constants";
import { User } from "../../models";

export async function getUserStateHandler(email: string) {
  const user = await User.findOne({ email, del: { $ne: true } });
  if (!user) throw new Error("User not found");

  const lastActivityDate = user.lastActivityDate;
  const today = new Date();
  const timeDiff = today.getTime() - new Date(lastActivityDate).getTime();

  type UserState = "active" | "non-active" | "inactive";

  let state: UserState = "active";
  if (timeDiff > ONE_MONTH_IN_MS) {
    state = "inactive";
  } else if (timeDiff > THREE_DAYS_IN_MS) {
    state = "non-active";
  }

  return state;
}
