import fs from 'fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = '4cba39b0806e0def0a7248ec75550485e93b5fb00dcd83f132693c1e8f9c3b3f';
const SALT_ROUNDS = 12;


export const getAllMessages = async (req, res) => {
  const autHeader = req.headers.authorization;
  if(!autHeader || !autHeader.startsWith('Bearer ')){
    res.json(400).json({error: 'Login Error!'});
  }
  const token = autHeader.substring(7);
  try{
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err){
        res.status(401).json({error:'Invalid Token'});
        return
      }
    const userId = decoded.id;
    const users = readUsers();
    const user = users.find(user => user.id === userId);
      if(!user){
        return res.status(401).json({error: 'Unauthorized!'});
      }
    const messages = readMessages();
    const userMessages = messages.filter(message => (userId === message.receiverID || userId === message.senderID));
    res.status(200).json(userMessages);
    });
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'});
  }
}

export const sendMessage = async (req, res) => {
  const { receiverID, message} = req.body;
  const autHeader = req.headers.authorization;
  if(!autHeader || !autHeader.startsWith('Bearer ')){
    res.json(400).json({error: 'Login Error!'});
  }
  const token = autHeader.substring(7);
  try{
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err){
        res.status(401).json({error:'Invalid Token'});
        return
      }
    const userId = decoded.id;
    const users = readUsers();
    const user = users.find(user => user.id === userId);
      if(!user){
        return res.status(401).json({error: 'Unauthorized!'});
      }
    const validationError = validateInput(userId, receiverID, message, users);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
    const newMessage = {
      id: generateMessageId(),
      senderID: userId,
      receiverID,
      message
    }
    const messages = readMessages();
    messages.push(newMessage);
    writeMessages(messages);
    res.status(200).json(newMessage);
    });
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'});
  }
}

export const updateMessage = async (req, res) => {
  const messageId = req.params.id;
  if(!messageId) {
    return res.status(400).json({error: 'Message Id is required'});
  }
  const message = req.body.message;
  if(!message || message.length < 1){
    return res.status(400).json({error: 'Please provide an appropriate message'});
  }
  const autHeader = req.headers.authorization;
  if(!autHeader || !autHeader.startsWith('Bearer ')){
    res.json(400).json({error: 'Login Error!'});
  }
  const token = autHeader.substring(7);
  try{
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err){
        res.status(401).json({error:'Invalid Token'});
        return
      }
    const userId = decoded.id;
    const users = readUsers();
    const user = users.find(user => user.id === userId);
      if(!user){
        return res.status(401).json({error: 'Unauthorized!'});
      }
    const messages = readMessages();
    const messageToUpdate = messages.find(message => message.id === messageId);
    if(!messageToUpdate){
      return res.status(404).json({error: 'There is no message with this id.'});
    }
    if(messageToUpdate.senderID !== userId){
      return res.status(401).json({error: 'Unauthorized!'});
    }
    messageToUpdate.message = message;
    const index = messages.findIndex(message => message.id === messageId);
    messages[index] = messageToUpdate;
    writeMessages(messages);
    res.status(200).json(messageToUpdate);
    });
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'});
  }
}

export const deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  if(!messageId) {
    return res.status(400).json({error: 'Message Id is required'});
  }
  const autHeader = req.headers.authorization;
  if(!autHeader || !autHeader.startsWith('Bearer ')){
    res.json(400).json({error: 'Login Error!'});
  }
  const token = autHeader.substring(7);
  try{
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err){
        res.status(401).json({error:'Invalid Token'});
        return
      }
    const userId = decoded.id;
    const users = readUsers();
    const user = users.find(user => user.id === userId);
      if(!user){
        return res.status(401).json({error: 'Unauthorized!'});
      }
    const messages = readMessages();
    const messageToDelete = messages.find(message => message.id === messageId);
    if(!messageToDelete){
      return res.status(404).json({error: 'There is no message with this id.'});
    }
    if(messageToDelete.senderID !== userId){
      return res.status(401).json({error: 'Unauthorized!'});
    }
    
    const updatedMessages = messages.filter(message => message.id !== messageId);
    writeMessages(updatedMessages);
    res.status(204).end();
    });
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'});
  }
}

const readUsers = () => {
  try{
    const usersData = fs.readFileSync('users.json', 'utf8');
    return JSON.parse(usersData);

  } catch(err){
    console.log("Can't read users");
    return [];
  }
}

const readMessages = () => {
  try{
    const messagesData = fs.readFileSync('messages.json', 'utf8');
    return JSON.parse(messagesData);

  } catch(err){
    console.log("Can't read messages");
    return [];
  }
}

const writeMessages = (messages) => {
  fs.writeFileSync('messages.json', JSON.stringify(messages), 'utf8');
}

const generateMessageId = () => {
  return Math.floor(Math.random() * 1000000000).toString();
}

function validateInput( senderID, receiverID, message, users ) {
  if (!receiverID || !message) {
      return "Receiver ID and Message are required";
  }
  if (message.length < 1) {
      return "Message can not be empty";
  }
  if (senderID === receiverID) {
      return "Sender and receiver can not be the same user";
  }
  const user = users.find(user => user.id === receiverID);
    if (!user) {
      return "There is no such user with that receiver ID";
    }
  return null;
}