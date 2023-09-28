import { CreateItemRequest } from "../requests/CreateItemRequest";
import * as uuid from "uuid";
import { BookAccess } from "../dataAccess/inventoryDB";
import { AttachmentUtils } from "../helpers/attachmentUtils";
import { UpdateItemRequest } from "../requests/UpdateItemRequest";

const attachmentUtils = new AttachmentUtils();
const bookAccess = new BookAccess();

export const getItemsForUser = async (userId: string) => {
  return bookAccess.getBooks(userId);
};

export const createItem = async (userId: string, item: CreateItemRequest) => {
  const bookId = uuid.v4();
  const attachmentUrl = attachmentUtils.getAttachmentUrl(bookId);
  return bookAccess.createBook({
    userId,
    bookId,
    createdAt: new Date().toISOString(),
    attachmentUrl,
    ...item,
  });
};

export const updateItem = async (
  userId: string,
  itemId: string,
  item: UpdateItemRequest
) => {
  return bookAccess.updateBook(userId, itemId, item);
};

export const deleteItem = async (userId: string, bookId: string) => {
  return bookAccess.deleteBook(userId, bookId);
};
