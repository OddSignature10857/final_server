// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 

const { Schema } = mongoose;  
const userSchema = new Schema(
  {
    accountType: {
      type: String,
      enum: ["regularCustomer", "licensedStylist", "salonOwner"],
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    preferredName: { type: String }, // Optional
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique in the DB
      match: [/.+\@.+\..+/, "Please fill a valid email address"], // Regex for email validation
    },
    password: { type: String, required: true },
    // stylistImage: {
    //   type: String, // Stores file path or URL
    //   required: function () {
    //     return (
    //       this.accountType === "licensedStylist" ||
    //       this.accountType === "salonOwner"
    //     );
    //   },
    // },
    licenseNumber: {
      type: String,
      required: function () {
        return this.accountType === "licensedStylist";
      },
    },
    businessNumber: {
      type: String,
      required: function () {
        return this.accountType === "salonOwner";
      },
    },
    referralName: {
      type: String,
      required: function () {
        return this.accountType === "regularCustomer";
      },
    },
    hearAbout: {
      type: String,
      required: true,
      enum: [
        "Stylist",
        "Client",
        "Media",
        "Distributor",
        "Ad",
        "Social",
        "Other",
      ],
    },
    licensedState: {
      type: String,
      required: function () {
        return (
          this.accountType === "licensedStylist" ||
          this.accountType === "salonOwner"
        );
      },
    },
    zipCode: {
      type: String,
      required: function () {
        return (
          this.accountType === "licensedStylist" ||
          this.accountType === "salonOwner"
        );
      },
      match: [
        /^\d{5}(-\d{4})?$/,
        "Please enter a valid zip code (e.g., 12345 or 12345-6789)",
      ],
    },
    joinSociety: { type: Boolean, default: false },
  },
  { timestamps: true }
);



userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10); 
    } catch (error) {
      console.error("Error hashing password:", error);
      return next(error);
    }
  }
  next();
});



userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); 
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
