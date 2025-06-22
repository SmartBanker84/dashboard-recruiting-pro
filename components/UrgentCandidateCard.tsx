import React from 'react';

type UrgentCandidate = {
  id: string;
  name: string;
  position: string;
  priorityLevel: 'High' | 'Medium' | 'Low';
};

interface UrgentCandidateCardProps {
  candidate: UrgentCandidate;
}

const UrgentCandidateCard: React.FC<UrgentCandidateCardProps> = ({ candidate }) => {
  return (
    <div className="border p-4 rounded shadow-md bg-red-50">
      <h3 className="text-lg font-bold text-red-700">{candidate.name}</h3>
      <p className="text-sm text-gray-700">Position: {candidate.position}</p>
      <p className="text-sm text-gray-600">Priority: {candidate.priorityLevel}</p>
    </div>
  );
};

export default UrgentCandidateCard;