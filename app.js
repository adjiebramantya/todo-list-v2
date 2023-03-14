//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-adjie:test123@cluster0.bkzwdb6.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemsSchema = {
  name : String,
};

const Item = mongoose.model('Item', itemsSchema);

// const item1 = new Item({
//   name : "Buy Some Food",
// });

// const item2 = new Item({
//   name : "Buy Some Drink",
// });

// const item3 = new Item({
//   name : "Eat Something",
// });

// const defaultItem = [item1, item2, item3];

// Item.insertMany(defaultItem).then(function () {
//   console.log("Successfully saved defult items to DB");
// })
// .catch(function (err) {
//   console.log(err);
// });

const listSchema = {
  name : String,
  list :[itemsSchema],
}

const List = mongoose.model('List', listSchema);



app.get("/", function(req, res) {

  Item.find({}).then(function(item){
    res.render("list", {listTitle: "Today", newListItems: item});
  });

});

app.get('/:customListName',function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((item) => {
      if(!item){
        List.create({name: customListName,list: []}).then(() => {
          res.render("list", {listTitle: customListName, newListItems: []});
        });

      }else{
        List.findOne({name: customListName}).then((item) => {

        res.render("list", {listTitle: customListName, newListItems: item.list});
        });
      }
  });

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list

  const add = new Item({
    name : item
  })

  if(listName === "Today"){

    add.save().then(() =>{
      res.redirect('/');
    });

  }else{
    List.findOne({name: listName}).then((item) =>{
      item.list.push(add);
      item.save();
      res.redirect('/'+listName);
    });
  }

});

app.post('/delete', function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(id).then(() =>{
      res.redirect('/');
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull : {list:{_id:id}}}).then(() =>{
      res.redirect('/'+listName);
    });
  }



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
