import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Regular expression to validate email format
          return /^([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    city: {
      type: String,
      required: [true, "City is required"], // Added field for city
    },
    collegeName: {
      type: String,
      required: [true, "College Name is required"], // Added field for college
    },
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment Number is required"], // Added field for enrollment number
    },
    ticketsPurchased: [
      {
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        ticketType: {
          type: String,
          enum: ["Regular", "Student"],
          required: true,
        },
        purchaseDate: {
          type: Date,
          default: Date.now,
        },
        eventDate: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) {
    return next(new Error("Password is required"));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Custom error handling for duplicate emails
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Email is already registered."));
  } else {
    next(error);
  }
});

// Ensure email uniqueness (removed because it's already handled in the 'save' hook)
userSchema.path("email").validate(async (email) => {
  const emailCount = await User.countDocuments({ email });
  return !emailCount; // Returns true if email is unique.
}, "Email already exists");

const User = mongoose.model("User", userSchema);

export default User;
