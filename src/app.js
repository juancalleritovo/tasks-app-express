const express = require('express');
const connectMongoDB = require('./database/mongoDB');
const usersResources = require('./resources/users');
const tasksResources = require('./resources/tasks');

const app = express();

app.use(express.json());

// Connection MongoDB
connectMongoDB();

// Resources
app.use(usersResources);
app.use(tasksResources);

module.exports = app;
