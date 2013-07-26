var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || 'localhost'; 
var db       = mongoose.connect('localhost', 'nulltonode');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name:      { type: String, required: true },
  username:  { type: String, required: true, lowercase: true, trim: true, index: { unique: true } },
  image:     { type: String },
  following: [ UserSchema ],
  followers: [ UserSchema ],
});

var PostSchema = new Schema({
  user: { type: ObjectId, ref: 'User' },
  body: { type: String, required: true },
  date: { type: Date, required: true }
})

UserSchema.plugin(require('basic-auth-mongoose'));
exports.User = db.model('User', UserSchema);
exports.Post = db.model('Post', PostSchema);