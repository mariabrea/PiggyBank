//jshint esversion:6
// import mongoose from 'mongoose';

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/piggybankDB');
mongoose.connect('mongodb+srv://admin-Maria:vVylhihjBZDK2mVe@cluster0.fjvwk.mongodb.net/piggybankDB');

const { Schema } = mongoose;

var mongoosePaginate = require('mongoose-paginate');

const customerSchema = new Schema({
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

transactionSchema.plugin(mongoosePaginate);


const Customer = mongoose.model("Customer", customerSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/", function(req, res){
  
    Customer.find({}, function(err, customers){
        console.log(customers[0]._id);
        Transaction.paginate({customer: customers[0]._id}, {sort: { date: -1, _id: "asc" }, page: 1, limit: 5}, function(err, transactions){
            res.render("index", {
                customers: customers,
                current_id: customers[0]._id,
                transactions: transactions.docs,
                current_page: 1,
                pages: transactions.pages
            });
        
        console.log(customers);
        console.log(transactions);
        });
    });
});



app.get("/customer/:customerId/:page", function(req, res){
    const requestedCustomerId = req.params.customerId;
    const page = req.params.page;
    console.log("Customer requested");
    console.log(requestedCustomerId);
    Customer.find({}, function(err, customers){
        console.log(customers);

        Transaction.paginate({customer: requestedCustomerId}, {sort: { date: -1, _id: "asc" }, page: page, limit: 5}, function(err, transactions){
            res.render("index", {
                customers: customers,
                current_id: requestedCustomerId,
                transactions: transactions.docs,
                current_page: page,
                pages: transactions.pages
            });
        
        console.log(transactions);
      });
    });

});

app.post("/customer/:customerId/:page", function(req, res){
    console.log("post");
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
        var new_balance = customer.balance + Number(req.body.transactionAmount);
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
                        res.redirect("/customer/"+customerId+"/1");
                    }
                })
                
            }
        });
    });
});

app.get("/graph", function(req, res){
    Customer.find().populate({
        path: "transactions",
        select:["concept", "balance", "date"]
    }).exec(function(err, customers){
        if (err){
            console.log("Error finding customers: " + err);
        }
        else {
            data = [];

            console.log("customers graph");
            console.log(customers);
            const data_json = JSON.stringify(customers);
            console.log("data_json");
            console.log(data_json);
            res.render("graph", {
                customers: customers,
                data: data_json,
                current_id: customers[0]._id
            });

                // for (let i=0; i<customers.length; i++) {
                //     Transaction.find({customer: customers[i]._id}, function(err, transactions){
                //         if (err){
                //             console.log("Error finding transactions: " + err);
                //         }
                //         else {
                //             data.push({
                //                 "customer": customers[i].name,
                //                 "transactions": transactions
                //             })
                //             console.log("push");
                //             console.log(data);
                //             if (i == 2){
                //                 console.log("DATA");
                //                 console.log(data);
                //                 res.render("graph", {
                //                     all_customers: customers,
                //                     data_json: data
                //                 });
                //             }
                //         }
                        
                //     });
                    
                // };
        } 
    });
    // console.log("data");
    // console.log(data);
    
});

app.listen(3000, function(){
    console.log("Server started on port 3000.")
});