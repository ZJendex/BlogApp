/**
 author: ZJendex
 Date: 8/3/2020
 Location: Amherst MA
 **/
let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    //As html originally not support the PUT and DELETE request
    methodOverride = require("method-override"),
    //When there are html tags in the body of the blogs, the sanitizer will clean the bad part such as the script tag with alerts
    expressSanitizer = require("express-sanitizer");

// APP CONFIG
//Check if DATABASEURL has been initialized in config vars in heroku (app deployed or not)
//set DATABASEURL locally if it didn't
if(!process.env.DATABASEURL){
    process.env.DATABASEURL = "mongodb://localhost:27017/restful_blog_app";
}
//connect/initialized the database  --adding options to avoid the errors
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
//express sanitizer should below the bodyParser
app.use(expressSanitizer());
//the getter can be anything corresponding to the action in forms
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    //giving a default value of a input
    created: {type: Date, default: Date.now()}
});
let Blog = mongoose.model("Blog", blogSchema);
// Blog.create(
//      {
//          title: "Test Blog2",
//          image: "https://farm1.staticflickr.com/60/215827008_6489cd30c3.jpg",
//          body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam facere incidunt ipsum maiores mollitia neque numquam vel? A, consequuntur reprehenderit."
//      },
//      function(err, campground){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("NEWLY CREATED CAMPGROUND: ");
//           console.log(campground);
//       }
//      });
//RESTFUL ROUTES
app.get("/", function (req, res) {
    res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if(err){
            console.log(err);
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});
//NEW ROUTE
app.get("/blogs/new", function (req, res) {
    res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});
//SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    })
});
//EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    })
});
//UPDATE ROUTE
//using PUT request to keep the url same to satisfy the RESTful Routing (ps: any request is functional same!!!)
app.put("/blogs/:id", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updateBlog) {
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    })
});
//DESTROY ROUTE
app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, req.body.blog, function (err, deleteBlog) {
            res.redirect("/blogs");
    })
});


app.listen(process.env.PORT || 3000, function(){
   console.log("The blog server started!!")
});

