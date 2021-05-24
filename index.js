const express = require('express');
const bodyParse = require('body-parser');
const date = require(__dirname + '/date.js');
const app = express();

const items = ["Learn","Develop Skills","Work on Project"];
const workItems = [];

app.set('view engine','ejs');
app.use(bodyParse.urlencoded({extended:true}));
app.use(express.static("public"));

app.get('/',function(req,res){
    
    const day = date.getDate();
    res.render("index",{
        listTitle: day ,
        newItemsList: items
    });
});

app.post("/",function(req,res){
    if(req.body.list === "Work List"){
        res.redirect("/work");
    }else{
    const item = req.body.newItem;
    items.push(item);
    res.redirect("/");
    }
});

app.get("/work",function(req,res){
    res.render("index",{
        listTitle: "Work List",
        newItemsList: workItems
    })
});

app.post("/work",function(req,res){
    const workItem = req.body.newItem;
    workItems.push(workItem);
})

app.listen(3000, function(){
    console.log("Server started at port 3000");
});