const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    headlines: [
      // the headlines the user has seen and rated
      {
        headline_id: Number,
        publication: String,
        chose_correctly: Boolean, // did the user choose the correct origin publication of the headline?
        democrat_republican_na: String, // the user's feeling about which political party the headline might respresent or if it isn't applicable
        inflammatory_rating: Number, // number from 1 to 10 representing the disturbance the headline seems to want to cause
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
