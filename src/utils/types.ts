export const SALT_ROUNDS = 10;
export const STATUS_ENUM = ["PENDING", "APPROVED", "REJECTED"];
export const ROLES_ENUM = ["USER", "STUDENT", "ADMIN", "SUPER_ADMIN"];

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
  profilePic?: string;
  role: string;
  status: string;
  lastActivityDate: Date;
  refreshToken: string;
  del: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EditedUserType {
  fullName: string;
  email: string;
  universityID?: string;
  universityCard?: string;
  profilePic?: string;
}

export interface BookType {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  videoUrl: string;
  summary: string;
  del: boolean;
  deletedBy?: string;
}

export interface BookFieldsType {
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  availableCopies?: number;
  videoUrl: string;
  summary: string;
}

export const BORROW_STATUS_ENUM = ["BORROWED", "RETURNED", "OVERDUE"];
export interface BorrowRecordType {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: string;
  del: boolean;
  emailStatus: {
    borrowedSent: { type: Boolean };
    dueReminderSent: { type: Boolean };
    overdueNotices: { type: Number };
    lastOverdueNotice: { type: Date };
  };
}

// types.ts
export type BorrowBookSuccessResponse = {
  success: true;
  data: {
    id: string;
    bookId: string;
    userId: string;
    borrowDate: Date;
    dueDate: string;
    status: string;
    copiesBorrowed: number; // Helpful for client
  };
};

export type BorrowBookErrorResponse = {
  success: false;
  message: string;
};

export type BorrowBookResponse = BorrowBookSuccessResponse | BorrowBookErrorResponse;

export interface SearchBook {
  query?: string;
  genre?: string;
  minRating?: number;
  maxRating?: number;
  availableOnly?: boolean | string; // supports boolean or "true" from query params
  page?: number;
  pageSize?: number;
}

export interface SearchCriteria {
  del: { $ne: boolean };
  $or: ({ title: { $regex: string; $options: string } } | { author: { $regex: string; $options: string } })[];
  genre?: string;
  rating?: {
    $gte?: number;
    $lte?: number;
  };
  availableCopies?: { $gt: number };
}

export const DEFAULT_PAGE_SIZE = 10;

export interface AdminSearch {
  query?: string;
  status?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminSearchCriteria {
  del: { $ne: boolean };
  $or: ({ title: { $regex: string; $options: string } } | { author: { $regex: string; $options: string } })[];
}

export interface AdminUserSearchCriteria {
  del: { $ne: boolean };
  $or: ({ fullName: { $regex: string; $options: string } } | { email: { $regex: string; $options: string } } | { universityID: { $regex: string; $options: string } })[];
  status?: string;
  role?: string;
}
