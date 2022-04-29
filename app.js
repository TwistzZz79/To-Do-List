//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();

const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-duong:test123@cluster0.drw99.mongodb.net/todolistDB");
//schema
const itemsSchema={
  name:String
};

//model
const Item =mongoose.model("Item",itemsSchema);

//document
const item1 =new Item({name:"Welcome to your todolist!"});
const item2 =new Item({name:"Hit the + button to add item"});
const item3 =new Item({name:"<---- Hit this to delete an item."});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List =mongoose.model("List",listSchema);

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
  // const day = date.getDate();

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Sucessfully save items on DB");
        }
      });
        res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });


  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item= Item({name:itemName});


  if(listName==="Today"){
    item.save();
  res.redirect("/");
  } else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName =req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
    
  }

  // Item.findByIdAndRemove(checkedItemId,function(err){
  //   if(!err){
  //     console.log("Deleted");
  //     res.redirect("/");
  //   }else{
  //     console.log("Failed")
  //   }
  // });
  
});

app.get("/:customListName",(req,res)=>{
  

  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:customListName,newListItems:foundList.items});
      }
    }
  });
  

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
app.listen(port, function() {
  console.log("Server has started on port 3000 successfully");
});
