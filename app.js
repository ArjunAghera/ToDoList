//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-arjun:Incorrect@cluster0.kqrwt.mongodb.net/todolistDB",{useUnifiedTopology: true,useNewUrlParser: true});

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("list",listSchema);

const Item = mongoose.model("item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList"
});

const item2 = new Item({
  name: "Click on + to insert a item"
});

const item3 = new Item({
  name: "<-- Check the box to delete a item"
});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err);
        }else{
          console.log("Successfully saved to DB");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if (!err){
      if (!foundList) {
        //create list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(); 
        res.redirect("/" + customListName);       
      }else{
        //show existing list
        res.render("list",{
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err){
        console.log("Successfully removed the item!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}},function(err,foundList){
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
