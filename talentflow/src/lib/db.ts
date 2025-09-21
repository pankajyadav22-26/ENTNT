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

export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text';

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface Assessment {
  jobId: string;
  sections: Section[];
}

export interface AssessmentResponse {
  id: string;
  jobId: string;
  candidateId: string;
  answers: Record<string, any>;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  candidateTimeline!: Table<CandidateTimeline>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super('talentFlowDatabase');
    this.version(4).stores({
      jobs: 'id, slug, status, order',
      candidates: 'id, jobId, stage, *nameWords',
      candidateTimeline: '++id, candidateId',
      assessments: 'jobId',
      assessmentResponses: 'id, jobId, candidateId',
    });
  }
}

export const db = new TalentFlowDB();