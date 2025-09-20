import { db, type Job, type Candidate } from './db';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log('Database already seeded.');
    return;
  }
  console.log('Seeding database...');

  const jobsToCreate: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = faker.person.jobTitle();
    jobsToCreate.push({
      id: uuidv4(),
      title: title,
      slug: faker.helpers.slugify(title).toLowerCase() + '-' + i,
      status: i % 5 === 0 ? 'archived' : 'active',
      tags: faker.helpers.arrayElements(['Full-time', 'Remote', 'Contract'], {min: 1, max: 2}),
      order: i + 1,
    });
  }
  await db.jobs.bulkAdd(jobsToCreate);
  console.log('Added 25 jobs.');

  const candidatesToCreate: Candidate[] = [];
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  for (let i = 0; i < 1000; i++) {
    candidatesToCreate.push({
      id: uuidv4(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      jobId: faker.helpers.arrayElement(jobsToCreate).id,
      stage: faker.helpers.arrayElement(stages),
    });
  }
  await db.candidates.bulkAdd(candidatesToCreate);
  console.log('Added 1000 candidates.');
}