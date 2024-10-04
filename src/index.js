const express = require('express');
const cors = require('cors'); // นำเข้า cors
const app = express();

// ใช้ cors middleware เพื่ออนุญาตการเข้าถึงจาก origin ที่กำหนด
app.use(cors({
  origin: 'http://localhost:5173', // อนุญาตให้เฉพาะ origin นี้เข้าถึง
  methods: ['GET', 'POST' , 'PUT' ,'DELETE'], // กำหนดเมธอดที่อนุญาต
  allowedHeaders: ['Authorization', 'Content-Type'], // กำหนด headers ที่อนุญาต
  credentials: true, // เปิดใช้งานการส่งคุกกี้
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', require('./routers/auth.route'));
app.use('/item', require('./routers/item.route'));
app.use('/bill', require('./routers/bill.route'));
app.use('/cart', require('./routers/cart.route'));
app.use('/stock', require('./routers/stock.route'));
app.use('/cagetory' , require('./routers/cagetory.route'))
// app.put('/auth/@me', (req, res) => {
//     // Logic for updating user data
//     res.send('User data updated');
// });


app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`);
});
