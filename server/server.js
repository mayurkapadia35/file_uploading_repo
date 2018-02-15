const express=require('express');
const multer=require('multer');
const ejs=require('ejs');
const path=require('path');
var mysql=require("mysql");
var cors=require('cors');
var bodyparser=require('body-parser');
//set storage engine
//init App
var fs=require('fs');
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
        storage: storage,
        limits:{fileSize: 100000},
        fileFilter: function(req,file,cb){
            checkfiletype(file,cb);
        }
    }).single('myimage');

    //check file type
    function checkfiletype(file,cb) {
        //allow ext
        const filetype=/jpeg|jpg|png|gif/;
        //check Ext
        const extname=filetype.test(path.extname(file.originalname).toLowerCase());

        //check mimetype
        const mimetype=filetype.test(file.mimetype);

        if(mimetype &&extname){
            return cb(null,true);
        }else{
            cb("images only");
        }
    }

var error;
app.post('/insert',(req,res)=>{
    upload(req, res, function (err) {
            if (err) {
            console.log("cs " + err);
            res.status(500).send(err);
            return
        }

        console.log(req.body);
        console.log(JSON.stringify(req.file), 'upload complete');

        var sql="insert into tblprofile(firstname,profile) values('"+ req.body.fname +"','"+ req.file.filename +"')";
        con.query(sql,function (err,result) {
            if(err) {
                throw err;
            }
            res.send(result);
        });
        // Everything went fine
    });

    // }else{
    //     console.log("error in filesize");
    //     res.send("error in filesize");
    // }
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

app.delete('/deleteimage',(req,res)=>{

    var image=req.query.name;
    fs.unlink('./public/images/'+image,function (err,res) {
        if(err){
            console.log("Error is there");
        }else{
            console.log("deleted");
            //res.send(res);
        }
    });
    res.send("deleted");
});

app.get('/search',(req,res)=>{
   var sname=req.query.name;

   var sql="select * from tblprofile where firstname like '%"+ sname +"%' and flag='true'";

    con.query(sql, (err,result)=> {
        if(err){
            throw err;
        }
        //console.log(result);
        res.send(result);
    });
});

app.get('/display',(req,res)=>{
    var sql="select * from tblprofile where flag='true'";
    con.query(sql,function (err,result) {
        if(err){
            throw err;
        }
        //console.log(result);
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
        //console.log(result);
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
