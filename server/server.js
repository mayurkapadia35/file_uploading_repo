const express=require('express');
const multer=require('multer');
const ejs=require('ejs');
const path=require('path');
var mysql=require("mysql");
var cors=require('cors');
var bodyparser=require('body-parser');
//set storage engine
//init App
var app=express();

app.use(cors());
app.use(express.static('./public'));

var con=mysql.createConnection({
   host: "localhost",
    user: "root",
    password: "",
    database: "dbtest"
});


con.connect(function (err) {

    app.use(bodyparser.urlencoded({
        extended: true
    }));


    const storage=multer.diskStorage({
        destination: './public/images/',
        filename: function (req,file,cb) {
            cb(null,file.fieldname+ "-" +Date.now()+path.extname(file.originalname));
        }
    });

//init upload
    const upload =multer({
        storage: storage
    }).single('myimage');

app.post('/insert', upload,(req,res)=>{

    console.log(req.body);
    console.log(JSON.stringify(req.file), 'upload complete');

    var sql="insert into tblprofile(firstname,profile) values('"+ req.body.fname +"','"+ req.file.filename +"')";
    con.query(sql,function (err,result) {
        if(err) {
            throw err;
        }
        res.send(result);
    });
});

app.put('/update',upload, (req,res)=>{

    var sql="update tblprofile set firstname='"+ req.body.fname +"', profile='"+ req.file.filename +"' where pid='"+ req.query.id +"'";
    con.query(sql,function (err,result) {
        if(err) {
            throw err;
        }
        res.send(result);
    });
});

app.get('/display',(req,res)=>{

    //var imgpath="E:/Mayur/Node-Js-Programmes/File_uploading_Demo/public/images/";

    var sql="select * from tblprofile where flag='true'";
    con.query(sql,function (err,result) {
        if(err){
            throw err;
        }
        console.log(result);
        res.send(result);
    });
});

app.post('/delete',(req,res)=>{
   var id=req.query.id;

    var sql="update tblprofile set flag='false' where pid='"+ id +"'";
    con.query(sql,function (err,result) {
        if(err){
            throw err;
        }
        console.log(result);
        res.send(result);
    });
});

app.get('/fetch',(req,res)=>{
    var id=req.query.id;

    var sql="select * from tblprofile where pid='"+ id +"'";
    con.query(sql,function (err,result) {
        if(err){
            throw err;
        }

        res.send(result);
    });
});

}); //end Connection

app.listen(3002,()=>{
    console.log("Connected to the Server 3002 ");
});
