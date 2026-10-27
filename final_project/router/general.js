const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user. Please provide username and password." });
});

// Helper Promise: Get all books
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ status: 500, message: "Books database not available" });
        }
    });
};

// Task 1 & Task 10: Get the book list available in the shop using Promise callbacks / async-await
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getAllBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Error fetching books" });
    }
});

// Helper Promise: Get book by ISBN
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks / async-await
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Helper Promise: Get books by Author
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for author: ${author}` });
        }
    });
};

// Task 3 & Task 12: Get book details based on author using Promise callbacks / async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const result = await getBooksByAuthor(author);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
});

// Helper Promise: Get books by Title
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for title: ${title}` });
        }
    });
};

// Task 4 & Task 13: Get all books based on title using Promise callbacks / async-await
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((result) => {
            return res.status(200).json(result);
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

/* ==============================================================================
   AXIOS & PROMISE / ASYNC-AWAIT CLIENT FUNCTIONS (Tasks 10, 11, 12, 13)
   ============================================================================== */

// Task 10: Get all books using async/await with Axios
const getBooksWithAxios = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');
        return response.data;
    } catch (error) {
        console.error("Error fetching books with Axios:", error);
    }
};

// Task 11: Get book details by ISBN using Promises with Axios
const getBookByISBNWithAxios = (isbn) => {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching book by ISBN with Axios:", error);
        });
};

// Task 12: Get book details by Author using async/await with Axios
const getBookByAuthorWithAxios = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by Author with Axios:", error);
    }
};

// Task 13: Get book details by Title using async/await with Axios
const getBookByTitleWithAxios = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by Title with Axios:", error);
    }
};

module.exports.general = public_users;
