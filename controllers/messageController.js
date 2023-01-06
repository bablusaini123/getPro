const asyncHandler = require("express-async-handler");
const Message = require("../model/messageModel");
const User = require("../model/user");
const Chat = require("../model/chatModel");
const path = require("path");
const multer = require("multer");

const Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    let a = file.originalname;
    let extname = path.extname(a);
    console.log("====",extname)
    // if (extname === ".jpg" || extname === ".png") {
    //   callback(null, "./public/image");
    // } else if (extname === ".pdf") {
    //   callback(null, "./public/upload-pdf");
    // }
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + Date.now() + file.originalname);
  },
});

 const chatImgUpload = multer({
  storage: Storage,
});
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const sendMessage = asyncHandler(async (req, res) => {
  console.log("fileeeee",req.files)
  const { content, chatId , type} = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    type:type
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "username email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email", 
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage ,chatImgUpload};