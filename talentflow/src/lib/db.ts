import Dexie, { type Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;

  constructor() {
    super('talentFlowDatabase');
    this.version(1).stores({
      jobs: '++id, slug, status, order'
    });
  }
}

export const db = new TalentFlowDB();