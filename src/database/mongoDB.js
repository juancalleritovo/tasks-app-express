const mongoose = require('mongoose');

const connectMongoDB = () => {
    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        });

        console.log('-> Connection MongoDB SUCCESS!');
    } catch (error) {
        console.log('-> Connection MongoDB FAILED!');
    }
};

module.exports = connectMongoDB;
