export const SALT_ROUNDS = 10;
export const STATUS_ENUM = ["PENDING", "APPORVED", "REJECTED"];
export const ROLES_ENUM = ["USER", "STUDENT", "ADMIN"];

export interface CreateUserFields {
  fullName: string;
  email: string;
  password: string;
  universityId: string;
  universityCard: string;
  role: string;
}

export interface UserType {
  id: string;
  fullName: string;
  email: string;
  password: string;
  universityID: string;
  universityCard: string;
  role: string;
  status: string;
  lastActivityDate: Date;
  refreshToken: string;
  del: boolean;
}
