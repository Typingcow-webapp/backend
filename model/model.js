const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  results: [
    {
      wpm: {
        type: String,
        required: true,
      },

      cpm: {
        type: String,
        required: true,
      },

      acc: {
        type: String,
        required: true,
      },

      timer: {
        type: String,
        required: true,
      },

      // uuid: {
      //   type: String,
      //   required: true,
      // },
    },
  ],
});

UserSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 10);

  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
