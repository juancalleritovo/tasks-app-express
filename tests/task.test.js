const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
    initializeDatabase,
    USER_TWO,
    FIRST_TASK_USER_TWO,
    SECOND_TASK_USER_TWO } = require('./fixtures/mongoDB');

beforeEach(initializeDatabase);

// Get all tasks endpoint
test('It should retrieve all tasks for a logged in user', async () => {
    await request(app)
        .get('/api/tasks')
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .expect(200)
});

test('It should not retrieve all tasks for a logged out user', async () => {
    await request(app)
        .get('/api/tasks')
        .set('Authorization', `BAD_TOKEN`)
        .expect(401)
});

test('It should not retrieve all tasks if no token is provided', async () => {
    await request(app)
        .get('/api/tasks')
        .expect(401)
});

// Get unique task for a user
test('It should retrieve an unique task for a logged in user', async () => {
    const task = await Task.findOne({ _id: FIRST_TASK_USER_TWO, owner: USER_TWO._id });

    const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .expect(200);

    expect(response.body).toHaveProperty('_id', `${FIRST_TASK_USER_TWO._id}`);
    expect(response.body).toHaveProperty('description', 'First task');
    expect(response.body).toHaveProperty('completed', true);
    expect(response.body).toHaveProperty('owner', `${USER_TWO._id}`);
});

test('It should not retrieve a task for a logged in user if not exists', async () => {
    await request(app)
        .get(`/api/tasks/5f35f04823985f29cc8d1400`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .expect(404);
});

// Create task endpoint
test('It should create a task for a logged in user', async () => {
    await request(app)
        .post('/api/tasks')
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            description: 'New task',
            completed: false
        })
        .expect(201);

    const task = await Task.findOne({ description: 'New task', owner: USER_TWO._id });

    expect(task).toBeTruthy();
});

test('It should not create a task for a logged in user with invalid data', async () => {
    await request(app)
        .post('/api/tasks')
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            newmaginaryField: 'New task'
        })
        .expect(400);

    const task = await Task.findOne({ newmaginaryField: 'New task', owner: USER_TWO._id });

    expect(task).toBeFalsy();
});

// Update task endpoint
test('It should update description field for a logged in user with valid task', async () => {
    const task = await Task.findOne({ _id: SECOND_TASK_USER_TWO, owner: USER_TWO._id });

    const response = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            description: 'Learn Node'
        })
        .expect(201);

    const taskUpdated = await Task.findById(SECOND_TASK_USER_TWO._id);

    expect(response.body).toHaveProperty('description', 'Learn Node');
    expect(taskUpdated).toHaveProperty('description', 'Learn Node');
});

test('It should update completed field for a logged in user with valid task', async () => {
    const task = await Task.findOne({ _id: SECOND_TASK_USER_TWO, owner: USER_TWO._id });

    const response = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            completed: false
        })
        .expect(201);

    const taskUpdated = await Task.findById(SECOND_TASK_USER_TWO._id);

    expect(response.body).toHaveProperty('completed', false);
    expect(taskUpdated).toHaveProperty('completed', false);
});

test('It should not update if field is invalid for a logged in user', async () => {
    const task = await Task.findOne({ _id: SECOND_TASK_USER_TWO, owner: USER_TWO._id });

    await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            newImaginaryFieldToUpdate: 'badField'
        })
        .expect(404);
});

test('It should not update anything for a logged in user if task is not found', async () => {
    await request(app)
        .patch('/api/tasks/5f35f04823985f29cc8d1400')
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .send({
            description: 'Learn React'
        })
        .expect(404);
});

// Delete task endpoint
test('It should delete a valid task for a logged in user', async () => {
    const task = await Task.findOne({ _id: SECOND_TASK_USER_TWO, owner: USER_TWO._id });

    await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .expect(200);

    const deletedTask = await Task.findById(SECOND_TASK_USER_TWO._id);

    expect(deletedTask).toBeFalsy();
});

test('It should not delete a task if it is not found', async () => {
    await request(app)
        .delete('/api/tasks/5f35f04823985f29cc8d1400')
        .set('Authorization', `${USER_TWO.tokens[0].token}`)
        .expect(404);

    const falseTask = await Task.findById('5f35f04823985f29cc8d1400');

    expect(falseTask).toBeFalsy();
});
