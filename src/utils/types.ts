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

export type BorrowBookResponse =
  | BorrowBookSuccessResponse
  | BorrowBookErrorResponse;
