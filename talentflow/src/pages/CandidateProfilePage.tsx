import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Candidate, CandidateTimeline } from '../lib/db';

const fetchCandidate = async (id: string): Promise<Candidate> => {
  const res = await fetch(`/candidates/${id}`);
  if (!res.ok) throw new Error('Candidate not found');
  return res.json();
};

const fetchTimeline = async (id: string): Promise<CandidateTimeline[]> => {
  const res = await fetch(`/candidates/${id}/timeline`);
  if (!res.ok) throw new Error('Timeline not found');
  return res.json();
};

const MentionRenderer = ({ text }: { text: string }) => {
  const parts = text.split(/(@\w+)/g);
  return (
    <p style={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '0.5rem', minHeight: '50px' }}>
      {parts.map((part, i) =>
        part.startsWith('@') ? <strong key={i}>{part}</strong> : part
      )}
    </p>
  );
};

export function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [note, setNote] = useState('Initial note for @JohnDoe about the upcoming tech screen.');

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => fetchCandidate(candidateId!),
    enabled: !!candidateId,
  });

  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['candidateTimeline', candidateId],
    queryFn: () => fetchTimeline(candidateId!),
    enabled: !!candidateId,
  });

  if (isLoadingCandidate || isLoadingTimeline) {
    return <div>Loading candidate profile...</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  return (
    <div>
      <Link to="/candidates">&larr; Back to Candidates List</Link>
      <div style={{ marginTop: '1rem' }}>
        <h1>{candidate.name}</h1>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Current Stage:</strong> <span style={{ textTransform: 'capitalize' }}>{candidate.stage}</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3>Hiring Timeline</h3>
          {timeline && timeline.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {timeline.map(item => (
                <li key={item.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                  <div>{item.event}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No timeline events yet.</p>
          )}
        </div>

        <div>
          <h3>Notes</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
            placeholder="Add notes with @mentions..."
          />
          <h4>Preview:</h4>
          <MentionRenderer text={note} />
        </div>
      </div>
    </div>
  );
}