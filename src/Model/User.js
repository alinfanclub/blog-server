import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "이름을 입력해주세요"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "이메일을 입력해주세요."],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "이메일 주소를 다시 확인해주세요."],
    },
    password: { type: String, minlength: 10 },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "비밀번호가 일치하지 않습니다.",
      },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = model("user", UserSchema);

export { User };
