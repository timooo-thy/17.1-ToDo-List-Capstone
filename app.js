import express from 'express';
import mongoose from 'mongoose';
import TodoModel from './models/Todo.js';
import UserModel from './models/User.js';
import { config } from 'dotenv';
import bcrypt from "bcrypt";
import { generateToken } from './middleware/jwtHelper.js';
import session from 'express-session';

const app = express();
config();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    }
    // User is not authenticated, redirect them to the login page
    res.redirect('/login?error=You must be logged in to view this page.');
}

// Home endpoint
app.get('/', (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    const todo = [{
        name: "Welcome to ToDo Tracker!",
    },
    {
        name: "Login or Register to get started!",
    }
    ];
    res.render('index.ejs', { todolist:todo, currentDateTime: formattedDateTime, error: req.query.logout});
});

// Register endpoint
app.get('/register', (req, res) => {
    res.render("register.ejs", { error: req.query.error });
});

// Login endpoint
app.get("/login", (req, res) => {
    res.render("login.ejs", { error: req.query.error });
});

// Register endpoint
app.post("/register", async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: req.body.email});
        if (existingUser) {
            return res.redirect("/register?error=Email already exist.");
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new UserModel({
            email: req.body.email,
            password: hashedPassword,
        });

        const createdUser = await newUser.save();
        req.session.userId = createdUser._id;
        res.redirect("/daily");
    } catch (error) {
        return res.redirect("/register?error=Error registering.");
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.redirect("/login?error=Invalid email or password.");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.redirect("/login?error=Invalid email or password.");
        }

        req.session.userId = user._id;

        const token = generateToken(user._id.toString());
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/daily");
    } catch (error) {
        return res.redirect("/login?error=Error logging in.");
    }
});

// Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        return res.redirect("/?logout=Logout Successfully.")
    });
});

// List endpoint
app.get('/:list', isAuthenticated, async (req, res) => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    if(req.params.list === "daily") {
        try{
            const todos = await TodoModel.find({ type: "daily", user: req.session.userId });
            res.render('daily.ejs', { todolist: todos, currentDateTime: formattedDateTime, error: req.query.error });
        } catch (error) {
            res.redirect('/daily?error=An error occurred getting your daily list.');
        }
    } else if(req.params.list === "work") {
        try{
            const todos = await TodoModel.find({ type: "work", user: req.session.userId });
            res.render('work.ejs', { todolist: todos, currentDateTime: formattedDateTime, error: req.query.error });
        } catch (error) {
            res.redirect('/work?error=An error occurred getting your work list.');
        }
    }
});

// List submit endpoint
app.post('/:list/submit', isAuthenticated, (req, res) => {
    if(req.params.list === "daily") {
        try {
            const todo = new TodoModel({
                name: req.body.todo,
                type: "daily",
                user: req.session.userId  // Set the user field to the logged-in user's ID
            });
            todo.save();
            res.redirect('/daily');
        } catch (error) {
            res.redirect('/daily?error=An error occurred while adding the task.');
        }
    } else if(req.params.list === "work") {
        try {
            const todo = new TodoModel({
                name: req.body.todo,
                type: "work",
                user: req.session.userId  // Set the user field to the logged-in user's ID
            });
            todo.save();
            res.redirect('/work');
        } catch (error) {
            res.redirect('/work?error=An error occurred while adding the task.');
        }
    }
});

// List delete endpoint
app.post('/:list/delete', isAuthenticated, async (req, res) => {
    if(req.params.list === "daily") {
        try{
            const response = await TodoModel.deleteOne({ _id: req.body.checkbox });
            res.redirect('/daily');
        } catch (error) {
            res.redirect('/daily?error=An error occurred while adding the task.');
        }
    } else if(req.params.list === "work") {
        try{
            const response = await TodoModel.deleteOne({ _id: req.body.checkbox });
            res.redirect('/work');
        } catch (error) {
            res.redirect('/work?error=An error occurred while adding the task.');
        }
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