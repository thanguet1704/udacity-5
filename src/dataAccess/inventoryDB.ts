import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { createLogger } from "../utils/logger";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Book } from "../models/book";
import { BookUpdate } from "../models/bookUpdate";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("BookAccess");

export class BookAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly booksTable = process.env.BOOKS_TABLE
  ) {}

  async getBooks(userId: string): Promise<Book[]> {
    logger.info("Getting all books");

    const result = await this.docClient
      .query({
        TableName: this.booksTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();
    return result.Items as Book[];
  }

  async createBook(newBook: Book): Promise<Book> {
    try {
      logger.info(`Creating new book: ${newBook.bookId}`);
      await this.docClient
        .put({
          TableName: this.booksTable,
          Item: newBook,
        })
        .promise();
      logger.info(`New book created: ${newBook.bookId}`);

      return newBook;
    } catch (error) {
      logger.error(`Failed to create book: ${newBook.bookId}`);
    }
  }

  async updateBook(
    userId: string,
    bookId: string,
    data: BookUpdate
  ): Promise<void> {
    logger.info(`Updating a book: ${bookId}`);
    await this.docClient
      .update({
        TableName: this.booksTable,
        Key: { userId, bookId },
        ConditionExpression: "attribute_exists(bookId)",
        UpdateExpression: "set #n = :n, author = :author",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: {
          ":n": data.name,
          ":author": data.author,
        },
      })
      .promise();
  }

  async deleteBook(userId: string, bookId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.booksTable,
        Key: { userId, bookId },
      })
      .promise();
  }

  async saveImgUrl(
    userId: string,
    bookId: string,
    bucket: string
  ): Promise<void> {
    try {
      await this.docClient
        .update({
          TableName: this.booksTable,
          Key: { userId, bookId },
          ConditionExpression: "attribute_exists(bookId)",
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": `https://${bucket}.s3.amazonaws.com/${bookId}`,
          },
        })
        .promise();
      logger.info(
        `Updating image url for an book: https://${bucket}.s3.amazonaws.com/${bookId}`
      );
    } catch (error) {
      logger.error(error);
    }
  }
}
