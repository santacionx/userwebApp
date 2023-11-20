const exp = require('constants');
const express = require('express')
const app = express()
const port = 3000
const path=require("path");
const { v4: uuidv4 } = require('uuid');
var methodOverride = require('method-override')
const { faker } = require('@faker-js/faker');
// get the client
const mysql = require('mysql2');
// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'app'
  });

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// get : / -> show # of users in database [select count(*) from user;]
app.get("/", (req, res) => {
    let q=`SELECT count(*) FROM user`;
    try{
        connection.query(q,(err,result)=>{
                    if(err) throw err;
                    console.log(result[0]["count(*)"]);
                    res.render("home.ejs",{result:result[0]["count(*)"]})
                }
              );
          }
          catch(err){
            console.log(err);
            res.send('error World!')
          }
    
  });
// get : /user -> show the user details
app.get("/user", (req, res) => {
    let q=`SELECT * FROM user`;
    try{
        connection.query(q,(err,result)=>{
                    if(err) throw err;
                    // res.send(result)
                    // console.log(result);
                    res.render("show.ejs",{result})
                } 
              );
          }
          catch(err){
            console.log(err);
            res.send('error!')
          }
    
  });

  app.get("/user/:id/edit", (req, res) => {
    let {id}=req.params;
    let q=`SELECT  * FROM user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
                    if(err) throw err;
                    // res.send(result)
                    user=result[0];
                    res.render("edit.ejs",{user})
                } 
              );
          }
          catch(err){
            console.log(err);
            res.send('error!')
          }
  });

  app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password:pass, username:newUsername } = req.body;
    // Check user password and update username
    let q = `SELECT id, username, password FROM user WHERE id='${id}'`;
   
    try {
        connection.query(q, (err, result) => {
            if (err) {
                throw err;
            }

            const user = result[0];
            if (pass != user.password) {
                res.send("Wrong password!");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) {
                        throw err; 
                    }
                    res.redirect("/user")
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send('Error!');
    }
});
// create a  new user using [form]->new.ejs
app.get('/user/new', (req, res) => {
    res.render("new.ejs");
  })

// user : /user : to add new post 
app.post('/user', (req, res) => {
    let id = uuidv4();
    let { username: u, password: p, email: e } = req.body;
    let q = `INSERT INTO user (id, username, email, password)
    VALUES ('${id}', '${u}', '${e}', '${p}')`;
    
    try {
        connection.query(q, (err, result) => {
            if (err) {
                throw err;
            }
            res.redirect(`/user`);
        });
    } catch (err) {
        console.log(err);
        res.send('error!');
    }
});

// // delete : user/:id : delete specific post
app.delete('/user/:id', (req, res) => {
    const { id } = req.params;
    const q = `DELETE FROM user WHERE id = ?`; // Use appropriate delete query based on your table structure

    try {
        connection.query(q, [id], (err, result) => {
            if (err) {
                throw err;
            }
            res.redirect("/user"); // Redirect to the appropriate route after user deletion
        });
    } catch (err) {
        console.log(err);
        res.send('Error!');
    }
});


// let getRandomUser=()=>{
//     return [
//        faker.string.uuid(),
//        faker.internet.userName(),
//        faker.internet.email(),
//        faker.internet.password(),
//     ];  
// }

//   new data
//   let q= "INSERT INTO user (id, username,email,password) values ?";
//   let users=[[3,"sandeep1","sandeep1@gmail.com","123"],[5,"savitha1","savitha1@gmail.com","xxx"]];

// let data=[];
// for(let i=0;i<=100;i++){
//     data.push(getRandomUser());
// }
//   try{
//     connection.query(
//       q,[data] ,(err,result)=>{
//             if(err) throw err;
//             console.log(result);
            
//         }
//       );
//   }
//   catch(err){
//     console.log(err);
//   }
//  

// get : / -> show # of users in database [select count(*) from user;]
// get : /user -> show the user details
// patch /user/:id -> username edit
// add : post /user ->new user
// delete : /user/:id


app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })
