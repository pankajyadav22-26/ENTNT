import { db, type Job, type Candidate, type Assessment } from './db';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

async function seedAssessments() {
  const assessmentCount = await db.assessments.count();
  if (assessmentCount > 0) {
    return;
  }

  console.log('Seeding assessments...');
  const jobs = await db.jobs.limit(3).toArray();
  if (jobs.length < 2) {
    console.warn('Could not seed assessments because there are not enough jobs in the DB.');
    return;
  }

  const assessmentsToCreate: Assessment[] = [
    {
      jobId: jobs[0].id,
      sections: [{
        id: uuidv4(),
        title: 'Basic Information',
        questions: [
          { id: 'q1', title: 'What is your expected salary?', type: 'numeric', validation: { required: true, min: 50000 } },
          { id: 'q2', title: 'Are you legally authorized to work in the US?', type: 'single-choice', options: ['Yes', 'No'], validation: { required: true } },
          { id: 'q3', title: 'If no, please specify your visa status.', type: 'short-text', conditional: { questionId: 'q2', value: 'No' } }
        ]
      }]
    },
    {
      jobId: jobs[1].id,
      sections: [{
        id: uuidv4(),
        title: 'Experience',
        questions: [
          { id: 'q4', title: 'Upload your resume.', type: 'file-upload', validation: { required: true } },
          { id: 'q5', title: 'Describe your experience with React in a few sentences.', type: 'long-text', validation: { required: true, minLength: 50 } }
        ]
      }]
    }
  ];

  await db.assessments.bulkAdd(assessmentsToCreate);
  console.log('Added 2 sample assessments.');
}

async function seedJobsAndCandidates() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    return;
  }
  
  console.log('Seeding jobs and candidates...');

  const jobsToCreate: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = faker.person.jobTitle();
    jobsToCreate.push({
      id: uuidv4(),
      title: title,
      slug: faker.helpers.slugify(title).toLowerCase() + '-' + i,
      status: i % 5 === 0 ? 'archived' : 'active',
      tags: faker.helpers.arrayElements(['Full-time', 'Remote', 'Contract'], { min: 1, max: 2 }),
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

export async function seedDatabase() {
  await seedJobsAndCandidates();
  await seedAssessments();
}