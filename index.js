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
  logs:[{
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

const addUserLog = async(id, desc, dur, dt) => {
  try {
    const UpdatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push:{
          logs:{
            description: desc,
            duration: dur,
            date: dt || new Date()
          }
        },
        $inc:{ count : 1}
      },
      { new : true}
    );
    return UpdatedUser;
  } catch(error){
      console.error("Error adding logs", error);
      throw error;
  }
}

app.post('/api/users/:_id/exercises',async (req,res) => {
  const {description, duration, date} = req.body;
  const id = req.params._id;
  const updatedUser = await addUserLog(id,description,duration,date);
  console.log(updatedUser)
  res.json(updatedUser);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
