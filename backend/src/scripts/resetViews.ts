import { connectDatabase } from '../config/database';
import { PostModel } from '../models/Post';

async function run() {
  await connectDatabase();

  const result = await PostModel.updateMany({}, { $set: { views: 0 } });
  console.log(`Reset views for ${result.modifiedCount} posts.`);

  process.exit(0);
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
