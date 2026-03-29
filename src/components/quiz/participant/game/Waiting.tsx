/**
 * HSD Arena - Participant Waiting Component
 *
 * Shown while waiting for the first question after game starts.
 */

interface WaitingProps {
    nickname: string;
}

const Waiting = ({ nickname }: WaitingProps) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="text-center">
            <div className="text-white text-2xl font-bold animate-pulse mb-4">
                Waiting for question...
            </div>
            <div className="text-white/50 text-sm">{nickname}</div>
        </div>
    </div>
);

export default Waiting;
