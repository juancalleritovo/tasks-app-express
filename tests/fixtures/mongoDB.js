const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const initializeDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(USER_ONE).save();
    await new User(USER_TWO).save();
    await new Task(FIRST_TASK_USER_TWO).save();
    await new Task(SECOND_TASK_USER_TWO).save();
};

const USER_ONE_ID = new mongoose.Types.ObjectId();
const USER_ONE = {
    _id: USER_ONE_ID,
    name: 'Mike Nell',
    email: 'mike.nell@test.com',
    password: 'test123',
    tokens: [{
        token: jwt.sign({ _id: USER_ONE_ID }, process.env.JWT_SECRET)
    }]
};

const USER_TWO_ID = new mongoose.Types.ObjectId();
const USER_TWO = {
    _id: USER_TWO_ID,
    name: 'Sean Connor',
    email: 'sean.connor@test.com',
    password: 'test123',
    tokens: [{
        token: jwt.sign({ _id: USER_TWO_ID }, process.env.JWT_SECRET)
    }]
};

const FIRST_TASK_USER_TWO = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: true,
    owner: USER_TWO_ID
};

const SECOND_TASK_USER_TWO = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: false,
    owner: USER_TWO_ID
};

module.exports = {
    initializeDatabase,
    USER_ONE,
    USER_TWO,
    FIRST_TASK_USER_TWO,
    SECOND_TASK_USER_TWO
};
