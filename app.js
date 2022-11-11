const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));


mongoose.connect(process.env.MY_LINK);

const listSchema = mongoose.Schema({
    name : String,
});

const todoSchema = mongoose.Schema({
    name : String,
    todos : [listSchema],
});

const Todo = mongoose.model("todo", todoSchema);

app.post("/home", (req, res) => {
    res.redirect("/");
})

app.get("/", (req, res) => {
   res.render("home");
});

app.post("/", (req, res) => {
    let typeOfTodo = req.body.type;
   if(typeOfTodo === "personal"){
    res.redirect("/personal");
   }
   else{
    res.redirect("/work");
   }
});

app.get("/:type", (req, res) => {
    const titleName = req.params.type;
    Todo.findOne({name : titleName}, (err, foundList) => {
        if(err){
            console.log(err);
        }
        else{
            if(foundList){
            res.render("list", {listTitle : titleName, listItems : foundList?.todos});
            }
            else{
            res.render("list", {listTitle : titleName, listItems : []});
            }
        }
    })
});

app.post("/:type", (req, res) => {
    const todo = req.body.personalTodo;
    const todoType = req.body.listName;
    const todoDoc = {
        name : todo,
    }

    Todo.findOne({name : todoType}, (err, foundList) => {
        if(err){
            console.log(err);
        }else{
           if(!foundList){
            const list = new Todo({
                name : todoType,
                todos : [todoDoc],
               });
               list.save();
               res.redirect("/" + todoType);
           }
           else{
            foundList.todos.push(todoDoc);
            foundList.save();
            res.redirect("/" + todoType);
           }
        }
    });
});

app.post("/delete/:type", (req, res) => {
    const listName = req.params.type;
    const delItemid = req.body.delItemid;
    
    Todo.findOneAndUpdate({name : listName}, {$pull : {todos : {_id : delItemid}}}, (err, foundList) => {
        if(err){
            console.log(err);
        }else{
            res.redirect("/" + listName);
        }
    })
});

const port = process.env.PORT;

app.listen(port || 3000, () => {
    console.log("Port started at 3000");
});