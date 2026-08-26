import mongoose, { InferSchemaType } from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: { type: String, required: true, select: false }, role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' }, active: { type: Boolean, default: true } }, { timestamps: true });
export type UserData = InferSchemaType<typeof schema>; export default mongoose.model('User', schema);
