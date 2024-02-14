import express from "express";
import {
  getAllMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messagesController.js";
const messagesRouter = express.Router();

messagesRouter.get("/", getAllMessages);
messagesRouter.post("/", sendMessage);
messagesRouter.put("/:id", updateMessage);
messagesRouter.delete("/:id", deleteMessage);

export default messagesRouter;
