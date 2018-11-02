const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const moment = require('moment');

const port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());


// MYSQL CONNECTION

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jamf1234',
  database: 'retros'
});

connection.connect(function(err) {
  if(err) throw err
  console.log('You are now connected to mysql')
})

// var currentDate = moment(Date.now()).format('YYYY-MM-DD HH:MM:SS');



// SPRINTS Endpoints

app.get('/', (req, res) => {
  let query = "select * from sprints where end_date is null";
  connection.query(query, (err, rows) => {
    if (err) {
      console.log(err);
    }
    res.send(rows);
  })
});

app.get('/sprint/:id', (req, res) => {
  let sprintId = req.params.id;
  let results = {};
  let query = `select * from sprints where id = ${req.params.id}`
  // res.send("you're in sprint number" + req.params.id)
  connection.query(query, (err, rows) => {
    if(err) {
      console.log(err);
    }
    results.sprintDetails = rows;
    console.log(results.sprintDetails)
    // res.send(rows);
  });

  query = `select * from retro_items where sprint_id = ${sprintId} order by id desc`
  connection.query(query, (err, rows) => {
    if(err) {
      console.log(err);
    }
    results.retroItems = rows;
    console.log(results.retroItems)
    res.send(results);
  })
})

app.post('/sprint/:id', (req, res) => {
  var currentDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  let sprintId = req.params.id;
  let query = `update sprints set end_date = ? where id = ?`
  var obj = [currentDate, sprintId]
  connection.query(query, obj, (err, rows) => {
    if (err) {
      console.log(err);
    }
    res.send(rows);
  })
})

app.post('/sprint', (req, res) => {
  var currentDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  var sprintName = req.body.sprint_name
  // var obj = {sprint_name: sprintName, start_date: currentDate}
  var obj = [sprintName, currentDate]
  // let query = `insert into sprints (sprint_name, start_date) values(${sprintName}, ${currentDate})`;
  let query = "insert into sprints set `sprint_name` = ?, `start_date` = ?"
  connection.query(query, obj, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.log(rows)
    res.send(rows);
  })
});

// RETRO ITEMS endpoints

app.post('/retro-items', (req, res) => {
  var currentDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  var message = req.body.message;
  var createdDate = currentDate;
  var userId = req.body.user_id;
  var sprintId = req.body.sprint_id;
  var obj = {message: message, created_date: createdDate, user_id: userId, sprint_id: sprintId, likes: 0}
  let query = 'insert into retro_items set ?';
  connection.query(query, obj, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.log(rows);
    res.send(rows)
  })
})

app.post('/retro-item-likes', (req, res) => {
  var retro_id = req.body.retro_item_id;
  // let query = `insert into retro_items set likes = likes + 1 where id = ${retro_id}`;
  let query = `update retro_items set likes = likes + 1 where id = ${retro_id}`
  connection.query(query, (err, rows) => {
    if (err) {
      console.log(err)
    }
    res.send(rows)
  })
  console.log("retro id that was liked: " + retro_id);
})

// Comments endpoints

app.post('/comments', (req, res) => {
  let id = req.body.retro_id;
  // let query = "select * from comments where id=''";
  let query = `select * from comments where retro_item_id = ${id}`
  connection.query(query, (err, rows) => {
    if(err) {
      console.log(err);
    }
    console.log('getting comments');
    console.log(rows);
    res.send(rows)
  })


})

app.post('/comment', (req, res) => {
  var currentDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  console.log('added comment');
  console.log(req.body)
  let retroId = req.body.retro_item_id;
  let commentMessage = req.body.comment_message;
  let userId = req.body.user_id;
  // var obj = {comment: commentMessage, user_id: userId, retro_item_id: retroId }
  let query = `insert into comments (comment, user_id, retro_item_id) values ("${commentMessage}", ${userId}, ${retroId})`;
  connection.query(query, (err, rows) => {
    if (err) {
      console.log(err);
    }

    res.send(rows)
  })
})



// START THE SERVER
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
