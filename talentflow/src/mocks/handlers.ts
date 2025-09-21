import { http, HttpResponse } from 'msw';
import { db, type Job } from '../lib/db';
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

  http.patch('/jobs/:id', async ({ request, params }) => {
  const { id } = params;
  const updates = await request.json() as Partial<Job>;

  await db.jobs.update(id as string, updates);

  const updatedJob = await db.jobs.get(id as string);
  return HttpResponse.json(updatedJob);
}),

];