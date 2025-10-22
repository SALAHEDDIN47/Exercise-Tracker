const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const connectDB = require('./connectDB');
const bodyParser = require('body-parser');


// connect to database
connectDB();
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({extended:false}));


const userSchema = new Schema({
  username:{
    type: String,
    required: true
  },
  count:{
    type: Number,
    default: 0
  },
  log:[{
    description:{
      type: String
    },
    duration:{
      type: Number
    },
    date:{
      type: Date,
      default: Date.now
    }
  }]
});

const User = mongoose.model('User', userSchema);

app.post('/api/users',async (req,res) => {
  const username = req.body.username;
  const user = new User({username});
  const savedUser = await user.save();
  console.log(savedUser);
  res.json(savedUser);
});

app.get('/api/users', async (req, res)=>{
  const allUsers = await User.find({});
  console.log(allUsers);
  res.json(allUsers);
});

const addUserLog = async(id,log) => {
  try {
    const UpdatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push:{
          log:{
            description: log.description,
            duration: log.duration,
            date: log.date || new Date()
          }
        },
        $inc:{ count : 1}
      },
      { new : true}
    );
    return UpdatedUser;
  } catch(error){
      console.error("Error adding log", error);
      throw error;
  }
}

app.post('/api/users/:_id/exercises',async (req,res) => {
  const exercise = (({ description, duration, date }) => ({ 
    description, 
    duration: parseInt(duration), // Convert to number
    date: date ? new Date(date) : new Date()
  }))(req.body);
  const id = req.params._id;
  const updatedUser = await addUserLog(id, exercise);
  res.json({
    username: updatedUser.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: updatedUser._id
  });
});

app.get('/api/users/:_id/logs', async(req,res)=>{
  try{
    const id = req.params._id;
    let {from, to, limit} = req.query;
    const user = await User.findById(id);
     let logs = user.log;
    if(from){
      from = new Date(from);
      if(isNaN(from.getTime())){
       return res.status(500).json({error: "invalid from format"});
      } logs = logs.filter(log => new Date(log.date) >= from);
    }
    if(to){
      to = new Date(to);
      if(isNaN(to.getTime())){
       return res.status(500).json({error: "invalid to format"});
      } logs = logs.filter(log => new Date(log.date) <= to);
    }
    if(limit){
      limit = parseInt(limit);
      if(isNaN(limit) || limit < 0){
        return res.status(500).json({error: "invalid limit value"});
      } logs = logs.slice(0,limit);
    }
    logs = logs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: new Date(log.date).toDateString()
    }));
    res.json({
      username: user.username,
      count: logs.length,
      _id: user._id,
      log: logs
    });
  }catch(error){
    res.status(500).json({error: "Server error"});
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
