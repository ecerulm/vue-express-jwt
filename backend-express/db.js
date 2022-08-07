const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const logger = require('./logger');

//mongoose.connect('mongodb://localhost:27017/test');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, index: {unique: true}},
    password: { type: String, required: true },
    counter: { type: Number, default: 0 }, 
});


userSchema.pre('save', async function() {
    const user = this; // in pre save hook this points to the MongoDB document being saved
    if (!user.isModified('password')) return;

    // generate bcrypt salt
    const encryptedPasword = user.password;
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    // https://github.com/kelektiv/node.bcrypt.js#with-promises
    return bcrypt.compare(candidatePassword, this.password); 
}


module.exports = function() { 
    // multiple connections: https://mongoosejs.com/docs/connections.html#multiple_connections
    logger.info("Get new mongoose connection")
    const conn = mongoose.createConnection("mongodb://localhost:27017/test")
    conn.model('User', userSchema)
    //conn.model('Token', tokenSchema)
    return conn
}