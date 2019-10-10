const express = require('express');
const mongoose = require('mongoose');
const sessions = require('client-sessions');
const bcrypt = require('bcryptjs');
const app = express();

//Create a model
let User = mongoose.model("User", new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
}));

//Connect to the Database
mongoose.connect("mongodb+srv://yassin:<password>@cluster0-kcr1d.mongodb.net/test?retryWrites=true&w=majority",
{useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true});


app.set("view engine", "pug");

app.use(express.urlencoded({extended: false}));

app.use(sessions({
    cookieName: "session",
    secret: "yassinhorus",
    duration: 30 * 60 * 1000
}));

app.post('/register', (req, res) => {
    let hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;
    let user = new User(req.body);
     
    user.save( err => {
        if(err){
            let error = "Something bad happened! Please try again.";

            if(err.code === 11000){
                error = 'That email is already taken, please try another.';
            }
            return res.render("register",{error: error});
        }
        
        res.redirect("/dashboard");        
    });    
});

app.post("/login", (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if(err || !user || !bcrypt.compareSync(req.body.password, user.password)){
            return res.render("login", {error: "Incorrect email / password."});
        }
        req.session.userId = user._id;
        
        res.redirect("/dashboard");
    });
});



app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res, next) => {
    if(!(req.session && req.session.userId)){
       return res.redirect("/login"); 
    }

    User.findById(req.session.userId, (err, user) => {
        if(err){
            return next(err);
        }
         
        if(!user){
            return res.redirect('/login');
        }

        res.render("dashboard");
    });
    
});

app.listen(3000, console.log("Server lestening on port 3000"));