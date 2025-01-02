const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const registerRouter = require('./src/routes/registerRouter');
const loginRouter = require('./src/routes/loginRouter');
const newsRouter = require('./src/routes/newsRouter');

require('dotenv').config();

app.use(express.static('./public'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('hello')
})

app.use('/api/register',registerRouter)
app.use('/api/login',loginRouter)
app.use('/api/news',newsRouter)


mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log('Database Error:', error);
});