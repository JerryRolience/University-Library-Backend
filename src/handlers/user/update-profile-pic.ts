import { User } from "../../models";
import { EditUserProfileSchema } from "../../validations/edit-user.schema";

export async function updateUserProfilePicHandler(
  userId: string,
  profilePic: string
) {
  // Validate input
  const validatedData = EditUserProfileSchema.parse(profilePic);

  // Check if user already exists
  const existingUser = await User.findOne({
    id: userId,
    del: { $ne: true },
  });
  if (!existingUser) {
    throw new Error("User not found");
  }

  const updateData = {
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
    profilePic: updatedUser.profilePic,
    status: updatedUser.status,
    role: updatedUser.role,
  };
}
