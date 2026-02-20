/**
 * HSD Arena - Answer Chart Component
 * 
 * Bar chart showing answer distribution
 */

import type { AnswerResult } from '@/types';

interface AnswerChartProps {
    results: AnswerResult[];
}

const AnswerChart = ({ results }: AnswerChartProps) => {
    const answerLabels = ['A', 'B', 'C', 'D'];
    const maxCount = Math.max(...results.map(r => r.count), 1);

    return (
        <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Answer Distribution</h3>

            <div className="space-y-4">
                {results.map((result, idx) => {
                    const percentage = (result.count / maxCount) * 100;

                    return (
                        <div key={result.answerId} className="space-y-2">
                            {/* Label and Count */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${result.isCorrect ? 'bg-green-500' : 'bg-gray-400'
                                        }`}>
                                        {answerLabels[idx]}
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {result.text}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-gray-700">
                                    {result.count}
                                </span>
                            </div>

                            {/* Bar */}
                            <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${result.isCorrect
                                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnswerChart;
