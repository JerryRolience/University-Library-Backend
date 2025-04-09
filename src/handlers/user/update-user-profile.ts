import { User } from "../../models";
import { EditedUserType } from "../../utils";
import { EditUserSchema } from "../../validations/edit-user.schema";

export async function updateUserProfileHandler(
  userId: string,
  userData: EditedUserType
) {
  // Validate input
  const validatedData = EditUserSchema.parse(userData);

  // Check if user already exists
  const existingUser = await User.findOne({
    id: userId,
    del: { $ne: true },
  });
  if (!existingUser) {
    throw new Error("User not found");
  }

  // 3. Check for email uniqueness if email is being updated
  if (validatedData && validatedData.email !== existingUser.email) {
    const emailExists = await User.findOne({
      email: userData.email,
      id: { $ne: userId }, // Exclude current user
      del: { $ne: true },
    });
    if (emailExists) {
      throw new Error("Email already in use by another account");
    }
  }

  // 4. Prepare update data (only update allowed fields)
  const updateData: Partial<EditedUserType> = {
    ...validatedData,
  };

  // 5. Perform the update
  const updatedUser = await User.findOneAndUpdate(
    { _id: existingUser._id },
    { $set: updateData },
    { new: true }
  );
  if (!updatedUser) {
    throw new Error("Failed to update user");
  }

  // 6. Return the updated user
  return {
    name: updatedUser.fullName,
    email: updatedUser.email,
    universityID: updatedUser.universityID,
    universityCard: updatedUser.universityCard,
    status: updatedUser.status,
    role: updatedUser.role,
  };
}
