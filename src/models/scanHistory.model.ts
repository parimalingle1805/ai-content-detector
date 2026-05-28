import mongoose, { Document, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: string;
  contentType: string;
  result: Record<string, any>;
  createdAt: Date;
}

const ScanHistorySchema: Schema = new Schema({
  userId: { type: String, required: true },
  contentType: { type: String, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);
