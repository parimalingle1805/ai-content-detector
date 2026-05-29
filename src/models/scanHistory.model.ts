import mongoose, { Schema, Document } from 'mongoose';

export interface IScanHistory extends Document {
  userId: string;
  scanType: string;
  contentReference?: string;
  thumbnailUrl?: string;
  originalText?: string;
  resultData: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const scanHistorySchema = new Schema(
  {
    userId: { type: String, required: true },
    scanType: { type: String, required: true, enum: ['text', 'image'] },
    contentReference: { type: String },
    thumbnailUrl: { type: String },
    originalText: { type: String },
    resultData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

scanHistorySchema.index({ userId: 1, createdAt: -1 });

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', scanHistorySchema);
