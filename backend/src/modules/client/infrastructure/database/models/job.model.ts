import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    status: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    type: { type: String, enum: ['FULLTIME', 'FREELANCE'], required: true },
    
    hourlyRate: { type: Number },
    projectDuration: { type: String },
    
    probationMonths: { type: Number },
    hasInsurance: { type: Boolean },
  },
  { timestamps: true },
);

const Job = mongoose.model('Job', jobSchema, 'jobs');

export default Job;
