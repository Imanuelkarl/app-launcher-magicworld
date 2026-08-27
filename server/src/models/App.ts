import mongoose, { InferSchemaType } from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["web", "desktop", "mobile", "service"],
      default: "web",
    },
    iconUrl: { type: String, default: "" },
    installPath: { type: String, default: "" },
    webUrl: { type: String, default: "" },
    downloadUrl: { type: String, default: "" },
    updateUrl: { type: String, default: "" },
    currentVersion: { type: String, default: "1.0.0" },
    latestVersion: { type: String, default: "1.0.0" },
    category: { type: String, default: "General" },
    platforms: { type: [String], default: ["Web"] },
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    owner: { type: String, default: "MagicWorld" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, strict: "throw" },
);
schema.virtual("updateAvailable").get(function () {
  return this.currentVersion !== this.latestVersion;
});
export type AppData = InferSchemaType<typeof schema>;
export default mongoose.model("App", schema);
