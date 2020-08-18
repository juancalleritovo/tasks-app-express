const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const User = require('../src/models/user');
const { initializeDatabase, USER_ONE } = require('./fixtures/mongodb');

beforeEach(initializeDatabase);

// Create user endpoint
test('It should create a new user', async () => {
    request(app)
        .post('/api/users')
        .send({
            name: 'Juan Tovo',
            email: 'juan.tovo@test.com',
            password: 'test123'
        })
        .expect(201);
});

test('It should not create a new user if email is already registered', async () => {
    await request(app)
        .post('/api/users')
        .send({
            name: 'Juan Tovo',
            email: 'mike.nell@test.com',
            password: 'test123'
        })
        .expect(400);
});

test('It should not create a new user if name is not provided', async () => {
    await request(app)
        .post('/api/users')
        .send({
            name: '',
            email: 'juan.tovo@test.com',
            password: 'test123'
        })
        .expect(400);
});

test('It should not create a new user if email is not provided', async () => {
    await request(app)
        .post('/api/users')
        .send({
            name: 'Juan Tovo',
            email: '',
            password: 'test123'
        })
        .expect(400);
});

test('It should not create a new user if password is not provided', async () => {
    await request(app)
        .post('/api/users')
        .send({
            name: 'Juan Tovo',
            email: 'juan.tovo@test.com',
            password: ''
        })
        .expect(400);
});

test('It should not create a new user if no data is sent', async () => {
    await request(app)
        .post('/api/users')
        .send({})
        .expect(400);
});

// Login user endpoint
test('It should log in a valid user', async () => {
    await request(app)
        .post('/api/users/login')
        .send({
            email: USER_ONE.email,
            password: USER_ONE.password
        })
        .expect(200);
});

test('It should not log in an invalid user', async () => {
    await request(app)
        .post('/api/users/login')
        .send({
            email: 'test@test.com',
            password: 'test123'
        })
        .expect(400);
});

test('It should not log in a valid user with wrong password', async () => {
    await request(app)
        .post('/api/users/login')
        .send({
            email: USER_ONE.email,
            password: 'wrongPassword'
        })
        .expect(400);
});

test('It should not log in if data is missing', async () => {
    await request(app)
        .post('/api/users/login')
        .send({
            email: '',
            password: ''
        })
        .expect(400);
});

// Logout user endpoint
test('It should log out a user', async () => {
    await request(app)
        .post('/api/users/logout')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .expect(200);
});

// Update user info endpoint
test('It should update username correctly', async () => {
    await request(app)
        .patch('/api/users/me')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .send({
            name: 'Todd Yun'
        })
        .expect(201)

    const user = await User.findById(USER_ONE._id);

    expect(user.name).toBe('Todd Yun');
});

test('It should update email correctly', async () => {
    await request(app)
        .patch('/api/users/me')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .send({
            email: 'todd.yun@test.com'
        })
        .expect(201)

    const user = await User.findById(USER_ONE._id);

    expect(user.email).toBe('todd.yun@test.com');
});

test('It should update password correctly', async () => {
    const updatedPassword = 'newPassword123';

    await request(app)
        .patch('/api/users/me')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .send({
            password: updatedPassword
        })
        .expect(201);

    const user = await User.findById(USER_ONE._id);
    const isValidPassword = await bcrypt.compare(updatedPassword, user.password);

    expect(isValidPassword).toBeTruthy();
});

test('It should not update user info with invalid fields', async () => {
    await request(app)
        .patch('/api/users/me')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .send({
            something: 'newSomething'
        })
        .expect(404);
});

// Delete user endpoint
test('It should delete an user', async () => {
    await request(app)
        .delete('/api/users/me')
        .set('Authorization', `${USER_ONE.tokens[0].token}`)
        .expect(200);

    const user = await User.findById(USER_ONE._id);

    expect(user).toBeNull();
});
