import * as uuid from "uuid";
import { BookAccess } from "../dataAccess/inventoryDB";
import { AttachmentUtils } from "../helpers/attachmentUtils";
import { CreateBookRequest } from "../requests/AddBookRequest";
import { UpdateBookRequest } from "../requests/UpdateBookRequest";

const attachmentUtils = new AttachmentUtils();
const bookAccess = new BookAccess();

export const getBooksForUser = async (userId: string) => {
  return bookAccess.getBooks(userId);
};

export const createBook = async (userId: string, book: CreateBookRequest) => {
  const bookId = uuid.v4();
  const attachmentUrl = attachmentUtils.getAttachmentUrl(bookId);
  return bookAccess.createBook({
    userId,
    bookId,
    createdAt: new Date().toISOString(),
    attachmentUrl,
    ...book,
  });
};

export const updateBook = async (
  userId: string,
  bookId: string,
  book: UpdateBookRequest
) => {
  return bookAccess.updateBook(userId, bookId, book);
};

export const deleteBook = async (userId: string, bookId: string) => {
  return bookAccess.deleteBook(userId, bookId);
};
