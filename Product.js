import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Link to Farmer profile
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "vegetables",
        "fruits",
        "grains",
        "dairy",
        "spices",
        "flowers",
        "other",
      ],
      required: true,
    },

    // IPFS image hashes
    images: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "gram", "piece", "bunch", "litre", "packet"],
      default: "kg",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isOrganic: {
      type: Boolean,
      default: false,
    },

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ farmer: 1, createdAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });

export default mongoose.model("Product", productSchema);
