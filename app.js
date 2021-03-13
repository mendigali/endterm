const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const app = express();
const port = 443;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

var rawProducts = fs.readFileSync(__dirname + '/data/products.json');
var products = JSON.parse(rawProducts);

app.get("/", (req, res) => {
    if (app.locals.user === undefined) {
        res.redirect('/register');
    } else {
        res.render('products', {products: products});
    }
});

app.get("/register", (req, res) => {
    if (app.locals.user === undefined) {
        res.render('register');
    } else {
        res.render('products', {products: products});
    }
});

app.get("/logout", (req, res) => {
   if (app.locals.user !== undefined) {
       app.locals.user = undefined;
   }
   res.redirect('register');
});

app.post("/register", (req, res) => {
    let user = {
        username: req.body.username,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
    };
    if (req.body.password !== req.body.confirmPassword) {
        let error_message = "<p class=\"border border-3 border-danger rounded text-danger text-center pt-1 pb-1\">" +
            "Passwords don't match! Please, try again\n</p>"
        res.render('register', {error: error_message});
    } else {
        app.locals.user = user;
        res.redirect('/');
    }
});

app.post("/confirm", (req, res) => {
    if (app.locals.user === undefined) {
        res.render('register');
    } else {
        let cart = [];
        let total = 0;
        products.products.forEach((product) => {
            let checkboxName = "addToCart" + product.id;
            if (req.body[checkboxName]) {
                let productQuantity = {
                    quantity: Number.parseFloat(req.body["quantity" + product.id]),
                    product: product
                }
                cart.push(productQuantity);
                total += product.price * req.body["quantity" + product.id];
            }
        });
        app.locals.cart = cart;
        app.locals.total = total;
        res.render('confirm', {cart: cart, total: total});
    }
});


app.get("*", (req, res) => {
   res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
