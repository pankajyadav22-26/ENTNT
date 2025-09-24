import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Candidate, CandidateTimeline } from "../lib/db";

const fetchCandidate = async (id: string): Promise<Candidate> => {
  const res = await fetch(`/candidates/${id}`);
  if (!res.ok) throw new Error("Candidate not found");
  return res.json();
};

const fetchTimeline = async (id: string): Promise<CandidateTimeline[]> => {
  const res = await fetch(`/candidates/${id}/timeline`);
  if (!res.ok) throw new Error("Timeline not found");
  return res.json();
};

const MentionRenderer = ({ text }: { text: string }) => {
  const parts = text.split(/(@\w+)/g);
  return (
    <div className="w-full rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-3 min-h-[60px] text-gray-200">
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="font-semibold text-indigo-400">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
};

const TEAM_MEMBERS = ["Anna", "Ben", "Chris", "David", "Emily", "Frank"];

export function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [note, setNote] = useState(
    "Initial note for @Chris about the upcoming tech screen."
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchCandidate(candidateId!),
    enabled: !!candidateId,
  });

  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["candidateTimeline", candidateId],
    queryFn: () => fetchTimeline(candidateId!),
    enabled: !!candidateId,
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNote(text);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastMentionIndex = textBeforeCursor.lastIndexOf("@");
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(" ");

    if (lastMentionIndex > lastSpaceIndex) {
      const query = textBeforeCursor.substring(lastMentionIndex + 1);
      setMentionQuery(query);
      setSuggestions(
        TEAM_MEMBERS.filter((member) =>
          member.toLowerCase().startsWith(query.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
      setMentionQuery("");
    }
  };

  const handleSuggestionClick = (memberName: string) => {
    const cursorPosition = note.lastIndexOf("@" + mentionQuery);
    const textBefore = note.substring(0, cursorPosition);
    const textAfter = note.substring(cursorPosition + mentionQuery.length + 1);

    setNote(`${textBefore}@${memberName} ${textAfter}`);
    setSuggestions([]);
    setMentionQuery("");
  };

  if (isLoadingCandidate || isLoadingTimeline) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading candidate profile...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        Candidate not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Link
            to="/candidates"
            className="text-sm text-gray-400 hover:text-indigo-300 transition"
          >
            &larr; Back to Candidates List
          </Link>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-indigo-300">
            {candidate.name}
          </h1>
          <p className="mt-2 text-gray-300">
            <strong>Email:</strong> {candidate.email}
          </p>
          <p className="mt-1 text-gray-300">
            <strong>Current Stage:</strong>{" "}
            <span className="capitalize text-indigo-400">
              {candidate.stage}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-300 mb-4">
              Hiring Timeline
            </h3>
            {timeline && timeline.length > 0 ? (
              <ul className="space-y-4">
                {timeline.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-white/10 pb-2 last:border-b-0"
                  >
                    <div className="text-gray-200">{item.event}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No timeline events yet.</p>
            )}
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-xl font-semibold text-indigo-300">Notes</h3>
            <div className="relative">
              <textarea
                value={note}
                onChange={handleNoteChange}
                className="w-full min-h-[120px] rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Add notes with @mentions..."
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 rounded-md bg-white shadow-lg border border-gray-200">
                  {suggestions.map((member) => (
                    <div
                      key={member}
                      onClick={() => handleSuggestionClick(member)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100"
                    >
                      {member}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Preview:
              </h4>
              <MentionRenderer text={note} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
