const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
        .then(() => {
            console.log("Connected to mongodb");
        })
        .catch(error => {
            console.log('Error in connecting to mongodb', error);
        });

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

app.set('view engine', 'ejs');

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json())

// Method override middleware
app.use(methodOverride('_method'));

// index route
app.get('/', (request, response) => {
    const context = {
        pageTitle: 'Home'
    };

    response.render('index', context);
});

// about route
app.get('/about', (request, response, next) => {
    const context = {
        pageTitle: 'About'
    };

    response.render('about', context);
});

// Idea index page
app.get('/ideas', (request, response, next) => {

    Idea.find({})
        .sort({ date: 'desc' })
        .then(ideas => {
            const context = {
                pageTitle: 'Ideas',
                ideas: ideas
            };
        
            response.render('ideas/ideas', context);
        })
        .catch(error => {
            console.log('Error in fetching tasks: ', error);
        });
});

// add idea form
app.get('/ideas/add', (request, response, next) => {
    const context = {
        pageTitle: 'Add Tasks',
        errorsList: []
    };

    response.render('ideas/add', context);
});

// edit idea form
app.get('/ideas/edit/:id', (request, response, next) => {
    Idea.findOne({
        _id: request.params.id
    })
        .then(idea => {
            const context = {
                pageTitle: 'Edit Task',
                idea: idea
            };
        
            response.render('ideas/edit', context);
        })
    
});

// Process form
app.post('/ideas', (request, response, next) => {

    let errorsList = [];

    if(!request.body.title) {
        errorsList.push({ text: 'Please add a title' });
    }
    if(!request.body.details) {
        errorsList.push({ text: 'Please add something' });
    }
    console.log('Errors List: ', errorsList);
    console.log('Task details: ', request.body);

    if(errorsList.length > 0) {
        const context = {
            errorsList: errorsList, 
            title: request.body.title, 
            details: request.body.details, 
            pageTitle: 'Ideas'
        }
        response.render('ideas/add', context);
    }
    else {
        const newUser = {
            title: request.body.title,
            details: request.body.details
        };

        new Idea(newUser)
                .save()
                .then(idea => {
                    
        
            response.redirect('/ideas');
        })
                
                .catch(error => {
                    console.log('Error in saving task: ', error);
                });
            }
        });

// Edit form
app.put('/ideas/:id', (request, response, next) => {
    Idea.findOne({
        _id: request.params.id
    })
        .then(idea => {
            idea.title = request.body.title;
            idea.details = request.body.details;
            idea.save()
                .then(updatedIdea => {
                    
                    response.redirect('/ideas');
                });
        })
    });

// Delete task
app.delete('/ideas/:id', (request, response, next) => {
    Idea.deleteOne({
        _id: request.params.id
    })
    .then(() => {
        response.redirect('back');
    })
});

const port = 9000;

app.listen(port, () => {
    // using `` for template strings
    console.log(`Server started on port ${port}`);
});