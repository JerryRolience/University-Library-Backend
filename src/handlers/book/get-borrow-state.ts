import { isBefore } from "date-fns";
import { BorrowRecords } from "../../models";

type BorrowStatus = "BORROWED" | "RETURNED" | "OVERDUE" | "NOT_FOUND";

export async function getBorrowStatusHandler(
  borrowId: string
): Promise<BorrowStatus> {
  const record = await BorrowRecords.findOne(
    { id: borrowId, del: { $ne: true } },
    { status: 1, dueDate: 1 } // Only fetch needed fields
  ).lean();

  if (!record) {
    return "NOT_FOUND";
  }

  if (record.status === "RETURNED") {
    return "RETURNED";
  }

  // Add 1 hour buffer to avoid edge cases at exact due time
  const now = new Date();
  const dueDateWithBuffer = new Date(record.dueDate);
  dueDateWithBuffer.setHours(dueDateWithBuffer.getHours() + 1);

  return isBefore(now, dueDateWithBuffer) ? "BORROWED" : "OVERDUE";
}
