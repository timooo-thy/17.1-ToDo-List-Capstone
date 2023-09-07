import mongoose from "mongoose";

const Schema = mongoose.Schema;

const todoSchema = new mongoose.Schema({
    name: String,
    type: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Associate each todo with a user
});

const TodoModel = mongoose.model("Todo", todoSchema);

export default TodoModel;