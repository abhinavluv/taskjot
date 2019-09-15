const mongoose = require('mongoose');
const schema = mongoose.Schema;

// Create a schema
const IdeaSchema = new schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('ideas', IdeaSchema);