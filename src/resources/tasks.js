const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

// GET all tasks
router.get('/api/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id });

        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET unique task
router.get('/api/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('No task found');
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST create task
router.post('/api/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// PATCH update unique task
router.patch('/api/tasks/:id', auth, async (req, res) => {
    const incomingBodyFields = Object.keys(req.body);
    const bodyFieldsAllowed = ['description', 'completed'];
    const isIncomingBodyValid = incomingBodyFields.every(field => bodyFieldsAllowed.includes(field));

    if (!isIncomingBodyValid) {
        return res.status(404).send('Wrong request body fields');
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('Task not found');
        }

        incomingBodyFields.forEach(field => task[field] = req.body[field]);
        await task.save();

        res.status(201).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// DELETE unique task
router.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send('Task not found');
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
