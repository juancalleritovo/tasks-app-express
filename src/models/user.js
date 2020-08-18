const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    tokens: [{
        token: {
            type: String
        }
    }]
});

// Check if it is a valid username and password
userSchema.statics.checkCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error();
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new Error();
    }

    return user;
};

// Create auth token for a valid login
userSchema.methods.createAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '10 hour'
    });

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
};

// Delete unnecessary fields from responses
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

// Middleware to hash password before save()
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Middleware to remove tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
