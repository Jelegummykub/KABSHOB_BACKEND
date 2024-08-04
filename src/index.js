const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth',require('./routers/auth.route'))
app.use('/item',require('./routers/item.route'))
app.use('/bill',require('./routers/bill.route'))
app.use('/cart',require('./routers/cart.route'))
app.use('/stock',require('./routers/stock.route'))


app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`);
})