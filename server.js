let express = require('express');
let ejs = require('ejs');
let bodyParser = require('body-parser')
let mongodb = require('mongodb');
let ObjectId = require('mongodb').ObjectID;

let app = express();
let mongodbClient = mongodb.MongoClient;
let url = "mongodb://localhost:27017/";
let db = null;
let col = null;
let query = {};

app.use(express.static('img'));
app.use(express.static('css'));

app.use(bodyParser.urlencoded({
    extended: false
}))


app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.set('port', 8888);

mongodbClient.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
},function(err,client){
    if (!err) {
        console.log("MongoDB Connected Successfully");
    }else{
        console.log("MongoDB Error:", err);
    };

    db = client.db('week6');
    col = db.collection('tasks');
    });



app.get('/', function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/newTask', function(req,res){
    res.sendFile(__dirname + '/views/newTask.html');
});

app.post('/newTask', function(req,res){
    let id = Math.round(Math.random()*1000);
    let taskName = req.body.taskName;
    let assignName = req.body.assignName;
    let taskDate = req.body.taskDate;
    let taskDesc = req.body.taskDesc;
    let date = new Date(taskDate)
    let rec = {
        id: id,
        taskName: taskName,
        assignName: assignName,
        taskDate: date,
        taskStatus: "InProgress",
        taskDesc: taskDesc
        
    };
    col.insertOne(rec, function(err, data){
        col.find({}).toArray(function (err, data) {
            res.render('listAll.html', { data: data });
        });
    });
});

app.get('/listAll', function(req,res){
    col.find({}).toArray(function (err, data) {
        res.render('listAll.html', { data: data });
    });
});

app.get('/deleteTask', function(req,res){
    res.sendFile(__dirname + '/views/deleteTask.html')
});

app.post('/deleteTask', function(req,res){
    let deleteID = parseInt(req.body.taskID);
    query = {id: deleteID};
    col.deleteMany(query, function(err, data){
        col.find({}).toArray(function (err, data) {
            res.render('listAll.html', { data: data });
        });
    });
});

app.get('/deleteComplete', function(req,res){
    query = {taskStatus: "Complete"};
    col.deleteMany(query, function(err, data){
        col.find({}).toArray(function (err, data) {
            res.render('listAll.html', { data: data });
        });
    });
});

app.get('/deleteDate', function(req,res) {
    res.sendFile(__dirname + '/views/deleteDate.html')
});

app.post('/deleteDate', function(req,res) {
    let deleteDate = new Date(req.body.deleteDate);
    //console.log(deleteDate);
    query = {taskDate: {$lt: deleteDate}};
    col.deleteMany(query, function (err, data) {
        col.find({}).toArray(function (err, data) {
            res.render('listAll.html', { data: data });
        });
    });
});

app.get('/updateStatus', function(req,res){
    res.render('updateStatus.html', {data: ""})
});

app.post('/updateStatus', function(req, res){
    let taskID = parseInt(req.body.taskID);
    let status = req.body.status.toLocaleLowerCase();
    query = {id: taskID};
    if (status == 'complete') {
        col.updateOne(query, {$set: {taskStatus: 'Complete'}}, function(err, data){
            col.find({}).toArray(function (err, data) {
                res.render('listAll.html', { data: data });
            });
        });
    }
    else if (status == 'inprogress') {
        col.updateOne(query, {$set: {taskStatus: 'InProgress'}}, function(err, data){
            col.find({}).toArray(function (err, data) {
                res.render('listAll.html', { data: data });
            });
        });
    }else{
        res.render('updateStatus.html', {data: "That was an invalid request"})
    };
});

app.listen(app.get('port'));