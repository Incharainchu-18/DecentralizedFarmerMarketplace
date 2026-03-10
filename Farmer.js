import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const farmerSchema = new mongoose.Schema(
  {
    // Link to User (authentication handled by User model)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    // Address
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: "India",
    },

    // Farm Details
    farmName: {
      type: String,
      required: true,
    },
    farmType: {
      type: String,
      enum: [
        "organic",
        "dairy",
        "poultry",
        "vegetable",
        "fruit",
        "grains",
        "flowers",
        "spices",
        "mixed",
        "other",
      ],
    },
    farmSize: Number,
    farmSizeUnit: {
      type: String,
      enum: ["acres", "hectares"],
      default: "acres",
    },

    crops: [
      {
        name: String,
        season: {
          type: String,
          enum: ["kharif", "rabi", "zaid", "all"],
        },
        quantity: Number,
        unit: {
          type: String,
          enum: ["kg", "quintal", "ton"],
        },
      },
    ],

    // Wallet (Blockchain)
    walletAddress: {
      type: String,
    },

    // Verification & Status
    verificationLevel: {
      type: String,
      enum: ["basic", "verified", "premium"],
      default: "basic",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Rating
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // Location (optional)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },
  },
  { timestamps: true }
);

// ==============================
// Virtuals
// ==============================
farmerSchema.virtual("displayName").get(function () {
  return this.farmName || this.name;
});

// ==============================
// Rating update
// ==============================
farmerSchema.methods.updateRating = function (newRating) {
  const total = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = total / this.rating.count;
  return this.save();
};

// ==============================
// Public profile
// ==============================
farmerSchema.methods.getPublicProfile = function () {
  const farmer = this.toObject();
  delete farmer.walletAddress;
  return farmer;
};

export default mongoose.model("Farmer", farmerSchema);
