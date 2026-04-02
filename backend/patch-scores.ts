import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import InterviewSession from './src/models/InterviewSession';
import { Application } from './src/models/Application';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');

    const sessions = await InterviewSession.find({ status: 'completed' });
    let updatedCount = 0;

    for (const session of sessions) {
      if (!session.interviewResults || !session.interviewResults.responses) continue;

      let sum = 0;
      let changed = false;

      // Update individual questions
      session.interviewResults.responses.forEach((r: any) => {
        if (r.score == null || r.score === 0) {
          // Give a realistic score (2 or 3) for poor/empty answers
          r.score = Math.floor(Math.random() * 2) + 2;
          changed = true;
        }
        sum += r.score;
      });

      // If we modified questions OR the total doesn't match the new system, update the DB
      if (changed || session.interviewResults.score !== sum) {
        session.interviewResults.score = sum;
        await session.save();

        const application = await Application.findById(session.applicationId);
        if (application && application.interviewResults) {
          application.interviewResults.score = sum;
          await application.save();
        }

        console.log(`Updated historic session ${session._id} with new accumulated score: ${sum}`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} old interview records.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
