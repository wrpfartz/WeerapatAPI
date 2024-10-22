const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 4000

const https = require('https');
const fs = require('fs');

const fileupload = require('express-fileupload');
const path = require('path');

// Import CORS library
const cors = require('cors');

//Database(MySql) configulation
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "",
        database: "weerapatdatabase"
    }
)
db.connect()

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
app.use(cors());
app.use(fileupload());


app.get('/api/viewcarr', (req, res) => {
    const sql = 'SELECT * FROM viewcar';
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });  

app.get('/api/viewcarr/:id', 
    function (req, res){
        const sql = 'SELECT * FROM viewcar WHERE idcar = ?';
        db.query(sql, [req.params.id], (err, result) => {
            if (err) throw err;

            if(result.length > 0) {
              viewcar = result[0];
              viewcar['message'] = 'success';
              viewcar['status'] = true;
                res.json(viewcar);
            }else{
                res.send({'message':'ไม่พบข้อมูลสินค้า','status':false});
            }
        });
    }
);

// app.get('/api/history/:id', (req, res) => {
//   const custID = req.params.id;
//   // Updated SQL query
//   let sql = `
//     SELECT rentcar.*, viewcar.cname, viewcar.cbrand
//     FROM rentcar
//     INNER JOIN viewcar ON rentcar.carID = viewcar.carID
//     INNER JOIN customer ON rentcar.custID = customer.custID
//     WHERE customer.custID = ?`;

//   db.query(sql, [custID], (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Database query error');
//     } else {
//       res.json(results);
//     }
//   });
// });


//Show a product image
app.get('/api/car/image/:filename', 
  function(req, res){
    const filepath = path.join(__dirname, 'assets/car', req.params.filename);  
    res.sendFile(filepath);
  }
);

app.get('/api/customer/image/:filename', 
  function(req, res) {        
      const filepath = path.join(__dirname, 'assets/customer', req.params.filename);        
      res.sendFile(filepath);
  }
);

app.post('/api/rentcar', 
  async function(req, res){
          const {idrent, idcar, price, custID, sdate, edate, stime, etime, statusID} = req.body;
          let sql = `INSERT INTO rentcar(
                     idrent, idcar, price, custID, sdate, edate, stime, etime, statusID
                     )VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1)`;                
          let params = [idrent, idcar, price, custID, sdate, edate, stime, etime, statusID];            
      
          db.query(sql, params, (err, result) => {
              if (err) throw err;
              res.send({ 'message': 'เพิ่มข้อมูลสินค้าเรียบร้อยแล้ว', 'status': true });
          });
          
  }
);


//Login
app.post('/api/login', function(req, res){
    const {username, password} = req.body
    const sql = 'SELECT * FROM customer WHERE username = ? AND password = ? AND isActive = 1'

    db.query(sql, [username, password], function(err, result){
        if(err) throw err
        
        if(result.length > 0){
            let customer = result[0]
            customer['message'] = "เข้าสู่ระบบสำเร็จ"
            customer['status'] = true

            res.send(customer)
        }else{
            res.send({"message":"กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status":false} )
        }        
    })    
})


// Profile
app.get('/api/profile/:id', (req, res) => {
  const custID = req.params.id; // รับค่า userId จากพารามิเตอร์ URL
  db.query('SELECT * FROM `customer` WHERE custID = ?', [custID], (err, result, fields) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', data: null });
    } else {
      if (result.length > 0) {
        let user = result[0];
        user['message'] = 'success';
        user['status'] = true;
        res.json(user);
      } else {
        res.status(404).json({ status: false, message: 'ไม่พบข้อมูลผู้ใช้', data: null });
      }
    }
  });
});




// Create an HTTPS server
const httpsServer = https.createServer(app);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});