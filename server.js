const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const ld = require("lodash");

const app = express();
var items=[];
var workItems=[];
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name : String
});
 
const Item = mongoose.model("Item",itemSchema);

/*const item1 = new Item({
    name: "Example 1"
});

const item2 = new Item({
    name: "Example 2"
});

const item3 = new Item({
    name: "Example 3"
});*/

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
    /*var today = new Date();
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    }
    
    var day=today.toLocaleDateString("en-US",options);*/
    

    Item.find({})
    .then(function(listOfItems){
        /*if(listOfItems.length==0){
            Item.insertMany([item1,item2])
            .then(function(){
                console.log("Successful");
            })
            .catch(function(err){
                console.log(err);
            });
            res.redirect("/");
        }
        else {
            res.render("list",{listTitle: "Today", newListTasks: listOfItems});
        }*/
        
    res.render("list",{listTitle: "Today", newListTasks: listOfItems});
    })
    .catch(function(err){
        console.log(err);
    });

    

});

app.post("/",function(req,res){
    console.log(req.body);
    const newItem = new Item({
        name: req.body.newtask
    });
    
    if(req.body.list === "Today")
    {
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: req.body.list})
        .then(function(foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+req.body.list);
        })
        .catch(function(err) {
            console.log(err);
            res.redirect("/");
        });
        
    }
    
    
});

app.post("/delete", function(req,res){
    console.log(req.body);
    if(req.body.listName === "Today"){
        Item.findByIdAndRemove(req.body.deleteitem)
        .then(function(deletedItem) {
        console.log("Deleted item:", deletedItem);
        res.redirect("/");
        })
        .catch(function(err) {
        console.log(err);
        res.redirect("/");
        });
    }
    else{
        List.findOneAndUpdate({name: req.body.listName}, {$pull:{items:{_id: req.body.deleteitem}}})
        .then(function(deletedList) {
        console.log("Deleted list", deletedList);
        res.redirect("/"+req.body.listName);
        })
        .catch(function(err) {
        console.log(err);
        res.redirect("/");
        });
    }
    
});

app.get("/:topic",function(req,res){
    const customListName = ld.capitalize(req.params.topic);
    
    
    List.findOne({name:customListName})
    .then(function(foundList) {
      if(!foundList){
        const list = new List({
            name: customListName,
            items: []
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListTasks: foundList.items});
      }

        
    })
    .catch(function(err) {
      console.log(err);
      res.redirect("/");
    });

    
    

})

app.listen(process.env.PORT || 3000,function(){
    console.log("server running on port");
});