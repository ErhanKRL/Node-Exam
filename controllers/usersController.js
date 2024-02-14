import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = '4cba39b0806e0def0a7248ec75550485e93b5fb00dcd83f132693c1e8f9c3b3f';
const SALT_ROUNDS = 12;

export const getUsers = async (req, res) => {
  try {
    const usersData = readUsers();
    const users = usersData.map(({ id, name }) => ({ id, name}));
    res.status(200).json(users);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
}
};

export const addUser = async (req, res) => {
  const { password, name } = req.body;
  const users = readUsers();
  const validationError = validateInput({ password, name, users });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = { id: generateUserId(), name, password: hashedPassword };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ id: newUser.id, name: newUser.name }).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "ID and password fields are required" });
  }
  try {
    const users = readUsers();
    const user = users.find(user => user.name === name);
    if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.status(200).json({ token }).end();
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
}
};

const readUsers = () => {
  try{
    const usersData = fs.readFileSync('users.json', 'utf8');
    return JSON.parse(usersData);

  } catch(err){
    console.log("Can't read users");
    return [];
  }
}

const writeUsers = (users) => {
  fs.writeFileSync('users.json', JSON.stringify(users), 'utf8');
}

const generateUserId = () => {
  return Math.floor(Math.random() * 1000000000).toString();
}

function validateInput({ password, name, users }) {
  if (!password || !name) {
      return "Password and name are required";
  }
  if (name.length < 3) {
      return "Name should be at least 3 characters long";
  }
  if (password.length < 8) {
      return "Password should be at least 8 characters long";
  }
  const user = users.find(user => user.name === name);
    if (user) {
      return "There is already a user with that name";
    }
  return null;
}