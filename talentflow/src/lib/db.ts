import Dexie, { type Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
}

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  event: string;
  timestamp: Date;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  candidateTimeline!: Table<CandidateTimeline>;

  constructor() {
    super('talentFlowDatabase');
    this.version(2).stores({
      jobs: 'id, slug, status, order',
      candidates: 'id, jobId, stage, *nameWords',
      candidateTimeline: '++id, candidateId',
    });
  }
}

export const db = new TalentFlowDB();