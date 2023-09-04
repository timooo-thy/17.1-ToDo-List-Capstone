import express from 'express';

const app = express();
const port = 3000;
const todolist = [];
const worklist = [];

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    
    res.render('index.ejs', { currentDateTime: formattedDateTime });
});

app.get('/daily', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    
    res.render('index.ejs', { todolist: todolist, currentDateTime: formattedDateTime });
});

app.get('/work', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    
    res.render('work.ejs', { todolist: worklist, currentDateTime: formattedDateTime });
});

app.post('/daily/submit', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);

    try {
        const todo = req.body.todo;
        todolist.push(todo);
        res.render('index.ejs', { todolist: todolist, currentDateTime: formattedDateTime });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

app.post('/work/submit', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);

    try {
        const todo = req.body.todo;
        worklist.push(todo);
        res.render('work.ejs', { todolist: worklist, currentDateTime: formattedDateTime });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});