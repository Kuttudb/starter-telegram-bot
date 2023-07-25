import express from "express";
import { Telegraf } from "node-telegram-bot-api";
import axios from "axios";

const app = express();
const botToken = "YOUR_TELEGRAM_BOT_TOKEN";
const channelId = "YOUR_PRIVATE_CHANNEL_ID";
const groupId = "YOUR_GROUP_ID";

const bot = new Telegraf(botToken);

bot.onText(/\/search (.+)/, async (msg, match) => {
  const searchTerm = match[1];
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getChatHistory?chat_id=${channelId}`
    );

    const messages = response.data.result.messages;

    const files = messages.filter((message: any) => {
      return (
        message.text &&
        message.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        message.document
      );
    });

    if (files.length > 0) {
      files.forEach((file: any) => {
        bot.forwardMessage(groupId, channelId, file.message_id);
      });
      bot.telegram.sendMessage(groupId, "Here are the files you requested!");
    } else {
      bot.telegram.sendMessage(groupId, "No files found matching your search.");
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
});

bot.launch();

app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});
