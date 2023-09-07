import express from 'express';
import mongoose from 'mongoose';
import Todo from './Todo.js';
import { config } from 'dotenv';
const app = express();
config();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    const todo = [{
        name: "Welcome to ToDo Tracker!",
    },
    {
        name: "Navigate to the respective list!",
    }
    ];
    res.render('index.ejs', { todolist:todo, currentDateTime: formattedDateTime });
});

app.get('/daily', async (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    try{
        const todos = await Todo.find({ type: "daily" });
        res.render('daily.ejs', { todolist: todos, currentDateTime: formattedDateTime });
    } catch (error) {
        res.status(500).send("An error occurred.");
    }
});

app.get('/work', async (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    try{
        const todos = await Todo.find({ type: "work" });
        res.render('work.ejs', { todolist: todos, currentDateTime: formattedDateTime });
    } catch (error) {
        res.status(500).send("An error occurred.");
    }
});

app.post('/daily/submit', (req, res) => {
    try {
        const todo = new Todo({
            name: req.body.todo,
            type: "daily"
        });
        todo.save();
        res.redirect('/daily');
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

app.post('/work/submit', (req, res) => {
    try {
        const todo = new Todo({
            name: req.body.todo,
            type: "work"
        });
        todo.save();
        res.redirect('/work');
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

app.post('/daily/delete', async (req, res) => {
    try{
        const response = await Todo.deleteOne({ _id: req.body.checkbox });
        res.redirect('/daily');
    } catch (error) {
        res.status(500).send("An error occurred.");
    }
});

app.post('/work/delete', async (req, res) => {
    try{
        const response = await Todo.deleteOne({ _id: req.body.checkbox });
        res.redirect('/work');
    } catch (error) {
        res.status(500).send("An error occurred.");
    }
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log(`Connected to database on port ${port}`);
    app.listen(port);
});