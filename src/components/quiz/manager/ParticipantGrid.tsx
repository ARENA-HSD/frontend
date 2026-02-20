/**
 * HSD Arena - Participant Grid Component
 * 
 * Display participants in lobby
 */

import { Users } from 'lucide-react';

interface ParticipantGridProps {
    participants: Array<{ nickname: string; joinedAt: string }>;
}

const ParticipantGrid = ({ participants }: ParticipantGridProps) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Participants ({participants.length})
                </h3>
            </div>

            {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    Waiting for participants to join...
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {participants.map((participant, idx) => (
                        <div
                            key={idx}
                            className="bg-indigo-50 p-3 rounded-lg text-center"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                                {participant.nickname.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="font-medium text-gray-900 truncate">
                                {participant.nickname}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParticipantGrid;
