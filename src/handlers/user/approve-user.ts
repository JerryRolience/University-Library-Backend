import { User } from "../../models";
import { withLock } from "../../lib/withLock";

export async function approveUserAccountHandler({
  adminId,
  email,
}: {
  adminId: string;
  email: string;
}) {
  if (!email) throw new Error("Email is required");

  return withLock(email, async () => {
    const [user, admin] = await Promise.all([
      User.findOne({ email, del: false }),
      User.findOne({ id: adminId, del: false }).lean(),
    ]);

    if (!user) throw new Error("User not found");
    if (user.status === "REJECTED")
      throw new Error("Cannot approve a rejected account");
    if (user.status === "APPROVED")
      throw new Error("User account is already approved");

    if (!admin) throw new Error("Admin not found");
    if (!["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      throw new Error("Only admins or super admins can approve users");
    }

    user.status = "APPROVED";
    await user.save();

    return "User approved successfully";
  });
}
