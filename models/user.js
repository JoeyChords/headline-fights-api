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

userSchema.pre("save", async function () {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(saltRounds);
  user.password = await bcrypt.hash(user.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword, hash) {
  return bcrypt.compare(candidatePassword, hash);
};

User = mongoose.model("User", userSchema);

module.exports = User;
