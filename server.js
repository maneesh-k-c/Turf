const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const registerRouter = require('./src/routes/registerRouter');
const loginRouter = require('./src/routes/loginRouter');
const newsRouter = require('./src/routes/newsRouter');
const teamRouter = require('./src/routes/teamRouter');
const tournamentRouter = require('./src/routes/tournamentRouter');
const playerRouter = require('./src/routes/playerRouter'); 
const bookingRouter = require('./src/routes/bookingRouter'); 
const reviewRouter = require('./src/routes/reviewRoute');

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
app.use('/api/team',teamRouter)
app.use('/api/tournament',tournamentRouter)
app.use('/api/players', playerRouter); 
app.use('/api/booking', bookingRouter); 
app.use('/api/review', reviewRouter); 


mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log('Database Error:', error);
});