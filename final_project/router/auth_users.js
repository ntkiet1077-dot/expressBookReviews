const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username already exists in users array
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
    // Check if username and password match records
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validusers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn];
    if (filtered_book) {
        let review = req.query.review || req.body.review;
        let reviewer = req.session.authorization['username'];
        if (review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
            return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
        } else {
            return res.status(400).json({ message: "Review content is required." });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let reviewer = req.session.authorization['username'];
    let filtered_book = books[isbn];
    if (filtered_book) {
        if (filtered_book.reviews && filtered_book.reviews[reviewer]) {
            delete filtered_book.reviews[reviewer];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${reviewer} deleted.`);
        } else {
            return res.status(404).json({ message: `No review found by user ${reviewer} for book with ISBN ${isbn}.` });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
