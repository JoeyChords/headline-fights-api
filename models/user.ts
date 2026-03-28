import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

interface IUserHeadline {
  headline_id: string;
  publication: string;
  chose_correctly: boolean;
  attribute1: string;
  attribute1Answer: string;
  attribute2: string;
  attribute2Answer: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  password_reset_token?: string;
  password_reset_datetime?: Date;
  verification_code?: number;
  email_verified?: boolean;
  verification_code_datetime?: Date;
  headlines: IUserHeadline[];
  comparePassword(candidatePassword: string, hash: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
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
      {
        headline_id: String,
        publication: String,
        chose_correctly: Boolean,
        attribute1: String,
        attribute1Answer: String,
        attribute2: String,
        attribute2Answer: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hash);
};

export const User =
  (mongoose.models["User"] as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);
