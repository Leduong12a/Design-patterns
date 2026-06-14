import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { InterviewCandidateNotificationListener } from './modules/client/application/events/interviewCandidateNotification.listener';
import { CandidateRepository } from './modules/client/infrastructure/database/repositories/candidate.repository';
import { JobRepository } from './modules/client/infrastructure/database/repositories/job.repository';
import { AiAnalysisRepository } from './modules/client/infrastructure/database/repositories/aiAnalyze.repository';
import { InterviewEmailGeminiService } from './modules/client/infrastructure/external-service/gemini.service';
import { MailService } from './modules/client/infrastructure/external-service/mail.service';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to DB');

  const listener = new InterviewCandidateNotificationListener();
  
  const candidateRepo = new CandidateRepository();
  const jobRepo = new JobRepository();
  const aiAnalysisRepo = new AiAnalysisRepository();
  const geminiSvc = InterviewEmailGeminiService.getInstance();
  const mailSvc = new MailService();

  const payload: any = {
    userId: '69ba099f2c34f82ea13067af',
    candidateID: '69ba0da82c34f82ea1306829', // Tran Duy Hai Dang
    jobID: '69ba0d582c34f82ea130680a',
    time: new Date(),
    durationMinutes: 60,
    address: 'Hanoi',
    notes: 'Test note',
    candidateRepo,
    jobRepo,
    aiAnalysisRepo,
    geminiSvc,
    mailSvc,
  };

  await listener.update(payload);
  console.log('Done');
  await mongoose.disconnect();
}

run().catch(console.error);
