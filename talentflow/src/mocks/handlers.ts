import { http, HttpResponse } from 'msw';
import { db, type Job, type Candidate, type CandidateTimeline, type Assessment } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const simulateNetwork = async (errorRate = 0.05) => {
  const delay = Math.random() * (1200 - 200) + 200;
  await new Promise(res => setTimeout(res, delay));
  if (Math.random() < errorRate) {
    throw new Error('Simulated network error');
  }
};

export const handlers = [
  http.get('/jobs', async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const titleSearch = url.searchParams.get('title');

    let jobs = await db.jobs.toArray();

    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    if (titleSearch) {
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }

    jobs.sort((a, b) => a.order - b.order);

    return HttpResponse.json(jobs);
  }),

  http.post('/jobs', async ({ request }) => {
    try {
      await simulateNetwork();
      const { title, slug } = await request.json() as Partial<Job>;

      if (!title) {
        return HttpResponse.json(
          { message: 'Title is required' },
          { status: 400 }
        );
      }

      const existing = await db.jobs.where('slug').equals(slug!).first();
      if (existing) {
        return HttpResponse.json(
          { message: 'Slug must be unique' },
          { status: 400 }
        );
      }

      const maxOrderJob = await db.jobs.orderBy('order').last();
      const newOrder = (maxOrderJob?.order ?? 0) + 1;

      const newJob: Job = {
        id: uuidv4(),
        title,
        slug: slug || uuidv4(),
        status: 'active',
        tags: [],
        order: newOrder,
      };

      const newId = await db.jobs.add(newJob);
      const result = await db.jobs.get(newId);

      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }),

  http.patch('/jobs/reorder', async ({ request }) => {
    if (Math.random() < 0.5) {
      console.error("Simulating a 500 server error on reorder!");
      return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }

    const reorderedJobs = await request.json() as { id: string; order: number }[];

    const updates = reorderedJobs.map(job => ({
      key: job.id,
      changes: { order: job.order }
    }));

    await db.jobs.bulkUpdate(updates);

    return HttpResponse.json({ success: true });
  }),

  http.patch('/jobs/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Job>;

    await db.jobs.update(id as string, updates);

    const updatedJob = await db.jobs.get(id as string);
    return HttpResponse.json(updatedJob);
  }),

  http.get('/jobs/:id', async ({ params }) => {
    const { id } = params;
    const job = await db.jobs.get(id as string);

    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(job);
  }),

  http.get('/candidates', async ({ request }) => {
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const search = url.searchParams.get('search');

    let candidatesQuery = db.candidates.toCollection();

    if (stage) {
      candidatesQuery = candidatesQuery.filter(c => c.stage === stage);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      candidatesQuery = candidatesQuery.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
      );
    }

    const candidates = await candidatesQuery.toArray();
    return HttpResponse.json(candidates);
  }),

  http.patch('/candidates/:id', async ({ request, params }) => {
    try {
      const { id } = params;
      const { stage } = await request.json() as Partial<Candidate>;

      if (!stage) return new HttpResponse('Stage is required', { status: 400 });

      const candidateId = id as string;
      const oldCandidate = await db.candidates.get(candidateId);

      await db.candidates.update(candidateId, { stage });

      const timelineEvent: CandidateTimeline = {
        id: uuidv4(),
        candidateId: candidateId,
        event: `Stage changed from "${oldCandidate?.stage}" to "${stage}"`,
        timestamp: new Date(),
      };
      await db.candidateTimeline.add(timelineEvent);

      const updatedCandidate = await db.candidates.get(candidateId);
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return HttpResponse.json({ message: 'Failed to update candidate' }, { status: 500 });
    }
  }),

  http.get('/candidates/:id', async ({ params }) => {
    const { id } = params;
    const candidate = await db.candidates.get(id as string);

    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(candidate);
  }),

  http.get('/candidates/:id/timeline', async ({ params }) => {
    const { id } = params;

    const timelineEvents = await db.candidateTimeline
      .where('candidateId')
      .equals(id as string)
      .sortBy('timestamp');

    return HttpResponse.json(timelineEvents.reverse());
  }),

  http.get('/assessments/:jobId', async ({ params }) => {
    const { jobId } = params;
    const assessment = await db.assessments.get(jobId as string);

    if (!assessment) {
      return HttpResponse.json({ jobId, sections: [] });
    }

    return HttpResponse.json(assessment);
  }),

  http.put('/assessments/:jobId', async ({ request, params }) => {
    const { jobId } = params;
    const assessmentData = await request.json() as Assessment;

    await db.assessments.put({ ...assessmentData, jobId: jobId as string });

    return HttpResponse.json(assessmentData);
  }),
];