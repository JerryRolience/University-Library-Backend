import { User } from "../../models";
import { ROLES_ENUM } from "../../utils";

export async function updateUserRoleHandler({
  adminId,
  email,
  role,
}: {
  adminId: string;
  email: string;
  role: string;
}) {
  if (!email || !role) {
    throw new Error("Email and role are required");
  }

  // Validate the new role
  if (!Object.values(ROLES_ENUM).includes(role)) {
    throw new Error("Invalid role specified");
  }

  const [admin, user] = await Promise.all([
    User.findOne({ id: adminId, del: false }).exec(),
    User.findOne({ email: email, del: false }).exec(),
  ]);

  // Permission checks
  if (!admin || admin.role !== "SUPER_ADMIN") {
    throw new Error("You do not have permission to update user roles");
  }

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== "APPROVED") {
    throw new Error("User account is not approved");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error("Cannot update the role of a super admin");
  }

  // Check if role is actually changing
  if (user.role === role) {
    throw new Error("User already has this role");
  }

  // Update the user's role
  user.role = role;
  await user.save();

  console.log(`Admin ${adminId} updated user ${user.fullName} role to ${role}`);
  return user;
}
