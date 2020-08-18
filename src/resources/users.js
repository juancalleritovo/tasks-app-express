const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

// POST create user
router.post('/api/users', async (req, res) => {
    const newUser = new User(req.body);

    try {
        await newUser.save();
        const token = await newUser.createAuthToken();

        res.status(201).send({ newUser, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// POST login user
router.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.checkCredentials(req.body.email, req.body.password);
        const token = await user.createAuthToken();

        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send('Invalid credentials');
    }
});

//POST log out user
router.post('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.status(200).send(`User logged out: ${req.user.email}`);
    } catch (error) {
        res.status(500).send(error);
    }
})

// POST log out all users
router.post('/api/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();

        res.send(`User logged out in all devices: ${req.user.email}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH update user
router.patch('/api/users/me', auth, async (req, res) => {
    const incomingBodyFields = Object.keys(req.body);
    const bodyFieldsAllowed = ['name', 'email', 'password', 'age'];
    const isIncomingBodyValid = incomingBodyFields.every(field => bodyFieldsAllowed.includes(field));

    if (!isIncomingBodyValid) {
        return res.status(404).send('Wrong request body fields');
    }

    try {
        incomingBodyFields.forEach(field => req.user[field] = req.body[field]);
        await req.user.save();

        res.status(201).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// DELETE user
router.delete('/api/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();

        res.status(200).send(`Deleted user: ${req.user.email}`);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

// GET user
router.get('/api/users/me', auth, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET all users
// This endpoint is being left here due to testing reasons
// just to see my saved users faster than going to Robo3T
router.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
