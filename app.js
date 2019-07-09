var express = require('express'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require("method-override"),
    bodyparser = require("body-parser"),
    mongoose = require("mongoose");
var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(expressSanitizer());
mongoose.connect("mongodb://localhost:27017/blog_app", {
    useNewUrlParser: true
});
app.use(methodOverride('_method'));

app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }

});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://www.bmmagazine.co.uk/wp/wp-content/uploads/2017/01/blogging-e1484908296381.jpg",
//     body: "Hello This is a blog Post",

// });

app.get('/', function(req, res) {
    res.redirect('/blogs');
});

app.get('/blogs', function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log("ERROR!!!");
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    });
});

app.get('/blogs/new', function(req, res) {
    res.render("new");
});

app.get('/blogs/:id', function(req, res) {

    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) { res.redirect('/blogs'); } else {
            res.render('show', { blog: foundBlog });
        }
    });

});

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect('/blogs');
        } else { res.render("edit", { blog: foundBlog }); }
    });
});

app.put('/blogs/:id', function(req, res) {

    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});


app.post('/blogs', function(req, res) {

    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            res.redirect('/blogs');
        }
    });

});



app.delete('/blog/:id', function(req, res) {

    Blog.findByIdAndDelete(req.params.id, function(err) {
        if (err) {
            res.redirect('/blogs');
        } else {
            req.redirect('/blogs');
        }
    });
});




app.get('*', function(req, res) {
    res.send("Page Not Found!!!!!!!");
});
app.listen(3000, function() {
    console.log('Server is Running!!!!!!!!!!');
});