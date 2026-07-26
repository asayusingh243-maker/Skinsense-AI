const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters."],
      maxlength: [60, "Name cannot exceed 60 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    /*
      Only the bcrypt password hash is stored here.
      The original password is never saved in MongoDB.
      Password-length validation happens in authController
      before the password is hashed.
    */
    password: {
      type: String,
      required: [true, "Password is required."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (document, returnedObject) {
        delete returnedObject.password;
        return returnedObject;
      },
    },
    toObject: {
      transform: function (document, returnedObject) {
        delete returnedObject.password;
        return returnedObject;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);