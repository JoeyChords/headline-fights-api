const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    password_reset_token: String,
    password_reset_datetime: Date,
    verification_code: Number,
    email_verified: Boolean,
    verification_code_datetime: Date,
    headlines: [
      // the headlines the user has seen and rated
      {
        headline_id: String,
        publication: String,
        chose_correctly: Boolean, // did the user choose the correct origin publication of the headline?
        attribute1: String,
        attribute1Answer: String,
        attribute2: String,
        attribute2Answer: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      return next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword, hash) {
  bcrypt.compare(candidatePassword, hash);
};

User = mongoose.model("User", userSchema);

module.exports = User;
