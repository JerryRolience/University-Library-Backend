import { User } from "../../models";
import { withLock } from "../../lib/withLock";

export async function rejectUserAccountHandler({
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
      throw new Error("Account is already rejected");
    if (user.status === "APPROVED")
      throw new Error("Cannot reject an approved account");

    if (!admin) throw new Error("Admin not found");
    if (!["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      throw new Error("Only admins or super admins can reject accounts");
    }

    user.status = "REJECTED";
    await user.save();

    console.log(`User ${email} rejected by admin ${adminId}`);

    return "Account rejected successfully";
  });
}
