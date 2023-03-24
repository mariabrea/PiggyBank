//jshint esversion:6
// import mongoose from 'mongoose';

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");


const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const { Schema } = mongoose;

var mongoosePaginate = require('mongoose-paginate');

const userSchema = new Schema({
    email: String,
    password: String,
    googleId: String,
    customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }]
  });
const customerSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    balance: Number,
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
  });
const transactionSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    type: String,
    amount: Number,
    date: Date,
    date_formatted: String,
    concept: String,
    balance: Number
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
transactionSchema.plugin(mongoosePaginate);


const User = mongoose.model("User", userSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);


passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user.id);
    });
  });
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

//Google login
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/customers"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    session.username = profile.displayName;
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] }));

  
app.get("/auth/google/customers", passport.authenticate('google', { failureRedirect: '/login' }),function(req, res) {
  // Successful authentication, redirect to secrets.
    res.redirect("/customer/0/1");
});


app.get("/login", function(req, res){
    console.log("err: "+ req.session.messages)
    res.render("login",{
        error: req.session.messages ? "  - " + req.session.messages : ""
    });
});

app.get("/register", function(req, res){
    res.render("register",{
        error: ""
    });
});

app.post("/register", function(req, res){
    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            
            res.render("register", {
                error: "  - User already exists"
            });
        } else {
            console.log("in authenticate");
            passport.authenticate('local')(req, res, function(){
                session.username=user.username;
                res.redirect("/customer/0/1");
            });
        }
    });
});

app.post("/login", function(req, res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local', { failureRedirect: '/login', failureMessage: true })(req, res, function(){
                session.username=user.username;
                res.redirect("/customer/0/1");
            });
        }
    });
    
});

app.get("/customer/:customerId/:page", function(req, res){
    if (req.isAuthenticated()){
        console.log("auth");
        console.log(req.user);
        console.log(session.username);

        const requestedCustomerId = req.params.customerId;
        const page = req.params.page;
        console.log("Customer requested");
        console.log(requestedCustomerId);
                Customer.find({user:req.user}, function(err, customers){
                    if (err){
                        console.log(err);
                    } else {
                        // There are customers
                        if (customers.length > 0) {
                            console.log(customers);
                            console.log("currentId");
                            console.log(requestedCustomerId);
                            if (requestedCustomerId == "0"){
                                console.log("in if");
                                console.log(customers[0]);
                                console.log(customers[0]._id);
                                // requestedCustomerId = customers[0]._id;
                                console.log("currentId");
                                console.log(requestedCustomerId);
                            }
                            console.log("after if")
                            Transaction.paginate({customer: requestedCustomerId == "0" ? customers[0]._id : requestedCustomerId}, {sort: { date: -1, _id: "asc" }, page: page, limit: 5}, function(err, transactions){
                                res.render("index", {
                                    username: session.username,
                                    customers: customers,
                                    current_id: requestedCustomerId == "0" ? customers[0]._id : requestedCustomerId,
                                    transactions: transactions.docs,
                                    current_page: page,
                                    pages: transactions.pages
                                });
                    
                                console.log(transactions);
                            });
                        } else { //No customers yet
                            res.render("index", {
                                username: session.username,
                                customers: customers,
                                current_id: requestedCustomerId,
                                transactions: [],
                                current_page: 1,
                                pages: 0
                            });
                        }
                    }   
                    
                });
    } else {
        console.log("not auth");
        res.redirect("/");
    }

    

});

app.post("/customer/:customerId/:page", function(req, res){
    console.log("post");
    console.log(req.query);
    if (req.query.action == "createTransaction"){
        const customerId = req.params.customerId;
        const transactionDate = req.body.transactionDate;
        const transactionAmount = req.body.transactionAmount;
        const transactionConcept = req.body.transactionConcept;
        const transactionType = req.body.transactionType;
        console.log(customerId);
        console.log(transactionDate);
        console.log(transactionAmount);
        console.log(transactionConcept);
        console.log(transactionType);
        Customer.findOne({_id: customerId}, function(err, customer){
            console.log(customer);
            if (req.body.transactionType === "IN"){
                var new_balance = customer.balance + Number(req.body.transactionAmount);
            } else {
                var new_balance = customer.balance - Number(req.body.transactionAmount);
            }
            
            const transaction = new Transaction({
                amount: req.body.transactionAmount,
                date: req.body.transactionDate,
                concept: req.body.transactionConcept,
                balance: new_balance,
                type: req.body.transactionType,
                customer: customerId
            });

            transaction.save(function(err){
                if (!err){
                    customer.balance = new_balance;
                    customer.transactions.push(transaction);
                    customer.save(function(err){
                        if (!err){
                            res.redirect("/customer/" + customerId + "/1");
                        }
                    })
                    
                }
            });
        });
    } else if (req.query.action == "createCustomer") {
        const customerName = req.body.customerName; 
        const customerBalance = req.body.customerBalance;
        console.log(customerName);
        console.log(customerBalance);
        
        const customer = new Customer({
                name: customerName,
                balance: customerBalance,
                user: req.user
        });

        customer.save(function(err){
            if (!err){
                User.findById(req.user, function(err, foundUser){
                    if (err){
                        console.log(err);
                    } else {
                        foundUser.customers.push(customer._id);
                        foundUser.save(function(err){
                            if (!err){
                                res.redirect("/customer/" + customer._id + "/1");
                            }
                        });
                    }
                });
            }
                    
        });
    } else if (req.query.action == "deleteCustomer") {
        const customerId = req.body.customerToDelete; 
        console.log(customerId);
        Customer.findOneAndDelete({_id: customerId}, function(err, foundCustomer){
            if (err){
                console.log(err);
            } else {
                User.findById(req.user, function(err, foundUser){
                    if (err){
                        console.log(err);
                    } else {
                        foundUser.customers.splice(foundUser.customers.indexOf(customerId), 1);
                        foundUser.save(function(err){
                            if (!err){
                                res.redirect("/customer/0/1");
                            }
                        });
                    }
                });
            }
        });
    }
    
});

app.get("/graph", function(req, res){
    if (req.isAuthenticated()){
        console.log("auth graph");
        console.log(req.user);
        console.log(session.username);
        Customer.find({user:req.user}).populate({
            path: "transactions",
            select:["concept", "balance", "date", "amount", "type"],
            options: {sort: {date: 1, balance: 1}}
        }).exec(function(err, customers){
            if (err){
                console.log("Error finding customers: " + err);
            }
            else {
                data = [];
    
                console.log("customers graph");
                console.log(customers);
                const data_json = JSON.stringify(customers);
                // console.log(customers[2].transactions)
                console.log("data_json");
                console.log(data_json);
                res.render("graph", {
                    username: session.username,
                    customers: customers,
                    data: data_json,
                    current_id: customers[0]._id
                });
    
            } 
        });
    } else {
        console.log("not auth graph");
        res.redirect("/");
    }
});


app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { 
            console.log(err); 
        }
        res.redirect('/');
      });
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000.")
});