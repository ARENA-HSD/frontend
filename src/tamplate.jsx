import React, { useState } from 'react';
import { Users, Plus, MoreVertical, Edit2, Trash2, Search, Filter, Settings, FileText, Save, X, Check, Clock, Crown, TrendingUp, LogOut, ChevronRight, Upload, Zap } from 'lucide-react';

const QuizApp = () => {
  const [currentView, setCurrentView] = useState('host-dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Mock data
  const quizzes = [
    { id: 1, name: 'Advanced Mathematics', questions: 12, mode: 'Personal', timePerQuestion: 20 },
    { id: 2, name: 'World History', questions: 15, mode: 'Stage', timePerQuestion: 15 },
    { id: 3, name: 'Science Fundamentals', questions: 10, mode: 'Personal', timePerQuestion: 25 },
    { id: 4, name: 'Literature Quiz', questions: 8, mode: 'Stage', timePerQuestion: 30 }
  ];

  const questions = [
    { id: 1, text: 'What is the capital of France?', hasImage: true },
    { id: 2, text: 'Which planet is known as the Red Planet?', hasImage: false },
    { id: 3, text: 'Who wrote Romeo and Juliet?', hasImage: true },
  ];

  const participants = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Lee', 'Emma Wilson',
    'Frank Brown', 'Grace Taylor', 'Henry Clark', 'Ivy Martinez', 'Jack Anderson'
  ];

  const leaderboard = [
    { rank: 1, name: 'Alice Johnson', points: 8500, streak: 7 },
    { rank: 2, name: 'Bob Smith', points: 7800, streak: 5 },
    { rank: 3, name: 'Carol Davis', points: 7200, streak: 3 },
    { rank: 4, name: 'David Lee', points: 6900, streak: 0 },
    { rank: 5, name: 'Emma Wilson', points: 6500, streak: 4 }
  ];

  const members = [
    { id: 1, name: 'John Doe', role: 'Admin', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'Host', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', role: 'Participant', avatar: 'MJ' },
    { id: 4, name: 'Sarah Williams', role: 'Host', avatar: 'SW' }
  ];

  const logs = [
    { timestamp: '2024-01-15 14:23', user: 'John Doe', action: 'Created quiz', item: 'Advanced Math Quiz' },
    { timestamp: '2024-01-15 14:20', user: 'Jane Smith', action: 'Added user', item: 'Mike Johnson' },
    { timestamp: '2024-01-15 14:18', user: 'Admin', action: 'Changed setting', item: 'Default quiz mode' },
    { timestamp: '2024-01-15 14:15', user: 'John Doe', action: 'Deleted quiz', item: 'Old Physics Quiz' }
  ];

  // Navigation
  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
      <div className="flex gap-2 flex-wrap">
        <NavButton label="Host Dashboard" view="host-dashboard" />
        <NavButton label="Quiz Detail" view="quiz-detail" />
        <NavButton label="Edit Question" view="edit-question" />
        <NavButton label="Create Question" view="create-question" />
        <NavButton label="Host Lobby" view="host-lobby" />
        <NavButton label="Question Transition" view="question-transition" />
        <NavButton label="Live Question" view="live-question" />
        <NavButton label="Answer Results" view="answer-results" />
        <NavButton label="Leaderboard" view="leaderboard" />
        <NavButton label="Quiz End" view="quiz-end" />

        <div className="w-px bg-gray-300 mx-2"></div>

        <NavButton label="Mobile Login" view="mobile-login" />
        <NavButton label="Mobile Lobby" view="mobile-lobby" />
        <NavButton label="Mobile Q.Transition" view="mobile-transition" />
        <NavButton label="Mobile Personal Q" view="mobile-personal-q" />
        <NavButton label="Mobile Stage Q" view="mobile-stage-q" />
        <NavButton label="Mobile Answer Result" view="mobile-answer-result" />
        <NavButton label="Mobile Personal LB" view="mobile-personal-lb" />
        <NavButton label="Mobile Stage LB" view="mobile-stage-lb" />
        <NavButton label="Mobile Personal End" view="mobile-personal-end" />
        <NavButton label="Mobile Stage End" view="mobile-stage-end" />

        <div className="w-px bg-gray-300 mx-2"></div>

        <NavButton label="Admin Org" view="admin-org" />
        <NavButton label="Admin Members" view="admin-members" />
        <NavButton label="Admin Settings" view="admin-settings" />
        <NavButton label="Admin Logs" view="admin-logs" />
      </div>
    </div>
  );

  const NavButton = ({ label, view }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${currentView === view
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
    >
      {label}
    </button>
  );

  // HOST SCREENS
  const HostDashboard = () => (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <div className="font-semibold text-gray-900">John Doe</div>
            <div className="text-sm text-gray-500">Host</div>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-700">Tech Academy</div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-8 flex items-center justify-center cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg">
          <div className="text-center text-white">
            <Plus className="w-12 h-12 mx-auto mb-3" />
            <div className="text-xl font-bold">Create Quiz</div>
          </div>
        </div>

        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">{quiz.name}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-500 mb-6">
                {quiz.questions} questions • {quiz.mode} mode • {quiz.timePerQuestion}s per question
              </div>
              <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QuizDetail = () => (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Mathematics</h1>
            <div className="text-gray-600">12 questions • Personal mode • 20s per question</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              Start
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-20">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                {idx + 1}
              </div>
              <div className="text-gray-900 font-medium">{q.text}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                <Edit2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <button className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>
    </div>
  );

  const EditQuestion = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Question 1</div>
          <div className="text-xl font-bold text-gray-900">Edit Question</div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm mb-6">
        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-3 overflow-hidden">
            <img src="/api/placeholder/600/300" alt="Question" className="w-full h-full object-cover" />
            <button className="absolute top-3 right-3 px-3 py-1.5 bg-white rounded shadow-sm text-sm font-medium hover:bg-gray-50">
              Change
            </button>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="3"
            defaultValue="What is the capital of France?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Answers</label>
          <div className="grid grid-cols-2 gap-4">
            {['Paris', 'London', 'Berlin', 'Madrid'].map((answer, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={idx === 0}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  readOnly
                />
                <input
                  type="text"
                  defaultValue={answer}
                  className="flex-1 text-lg border-none focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Save
        </button>
      </div>
    </div>
  );

  const CreateQuestion = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">New Question</div>
          <div className="text-xl font-bold text-gray-900">Create Question</div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm mb-6">
        <div className="mb-6">
          <button className="w-full bg-gray-100 rounded-lg h-64 flex flex-col items-center justify-center mb-3 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-600 font-medium">Add Image</span>
          </button>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="3"
            placeholder="Enter your question here..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Answers</label>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder={`Answer ${idx + 1}`}
                  className="flex-1 text-lg border-none focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Save
        </button>
      </div>
    </div>
  );

  const HostLobby = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center justify-between">
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Manage Participants
        </button>
        <div className="text-xl font-bold text-gray-900">Advanced Mathematics</div>
        <div className="w-40"></div>
      </div>

      <div className="flex justify-center text-center mb-2">
        <div className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-lg mb-2">
          <div className="w-56 h-56 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
            <div className="text-white text-xs">QR CODE</div>
          </div>
          <a href="https://org.hsdarena.com/join/ABC123" className="text-2xl font-bold text-indigo-600">org.hsdarena.com/join/ABC123</a>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Participants ({participants.length})</h3>
        <div className="flex justify-evenly items-center mb-2">
          {participants.slice(0, 3).map((name, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xl font-semibold text-gray-900">{name}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-evenly items-center mb-2">
          {participants.slice(3, 8).map((name, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-lg font-medium text-gray-800">{name}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-evenly items-center overflow-x-auto pb-2">
          {participants.slice(8).map((name, idx) => (
            <div key={idx} className="bg-white px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
              <div className="text-sm font-medium text-gray-700">{name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button className="px-12 py-4 bg-indigo-600 text-white rounded-lg text-xl font-bold hover:bg-indigo-700 shadow-lg">
          Start Quiz
        </button>
      </div>
    </div>
  );

  const QuestionTransition = () => (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center">
        <div className="text-white text-6xl font-bold mb-8 animate-pulse">Question incoming!</div>
        <div className="text-white text-9xl font-black">3</div>
      </div>
    </div>
  );

  const LiveQuestion = () => (
    <div className="h-screen flex flex-col">
      <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200">
          Manage Participants
        </button>
        <div className="font-semibold text-gray-900">Advanced Mathematics</div>
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-indigo-600">
          18
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-5xl w-full">
          <div className="mb-12">
            <img src="/api/placeholder/800/400" alt="Question" className="w-full rounded-2xl shadow-xl mb-8" />
            <div className="text-5xl font-bold text-gray-900 text-center">
              What is the capital of France?
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {['Paris', 'London', 'Berlin', 'Madrid'].map((answer, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border-4 border-gray-200 hover:border-indigo-400 transition-colors">
                <div className="text-3xl font-bold text-gray-900 text-center">{answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AnswerResults = () => (
    <div className="h-screen flex flex-col">
      <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium">
          Manage Participants
        </button>
        <div className="font-semibold text-gray-900">Advanced Mathematics</div>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Leaderboard
        </button>
      </div>

      <div className="flex-1 p-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
            <div className="h-64 flex items-end justify-around gap-4">
              {[
                { answer: 'Paris', count: 7, correct: true },
                { answer: 'London', count: 2, correct: false },
                { answer: 'Berlin', count: 1, correct: false },
                { answer: 'Madrid', count: 0, correct: false }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-lg ${item.correct ? 'bg-green-500' : 'bg-gray-300'}`}
                    style={{ height: `${(item.count / 7) * 100}%`, minHeight: '20px' }}
                  >
                    <div className="text-white font-bold text-2xl pt-2 text-center">{item.count}</div>
                  </div>
                  <div className="mt-2 text-gray-700 font-medium">{item.answer}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold text-gray-900 text-center mb-6">
            What is the capital of France?
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { answer: 'Paris', correct: true },
              { answer: 'London', correct: false },
              { answer: 'Berlin', correct: false },
              { answer: 'Madrid', correct: false }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl shadow-lg border-4 ${item.correct
                  ? 'bg-green-50 border-green-500 shadow-green-200'
                  : 'bg-gray-100 border-gray-300 opacity-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">{item.answer}</div>
                  {item.correct && <Check className="w-8 h-8 text-green-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Leaderboard = () => (
    <div className="h-screen flex flex-col">
      <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium">
          Manage Participants
        </button>
        <div className="font-semibold text-gray-900">Advanced Mathematics</div>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Next Question
        </button>
      </div>

      <div className="flex-1 p-12 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Leaderboard</h2>

          <div className="space-y-4 mb-8">
            {leaderboard.map((player, idx) => (
              <div
                key={player.rank}
                className={`flex items-center gap-4 p-6 rounded-xl shadow-lg ${idx === 0
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : idx === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : idx === 2
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                      : 'bg-white'
                  }`}
              >
                <div className={`text-3xl font-black ${idx < 3 ? 'text-white' : 'text-gray-900'} w-12`}>
                  {player.rank}
                </div>
                <div className="flex-1">
                  <div className={`text-xl font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                    {player.name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                    {player.points}
                  </div>
                  {player.streak >= 3 && (
                    <div className="text-2xl">
                      🔥
                      {player.streak >= 7 && <span className="text-3xl">🔥</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-indigo-900 mb-1">Biggest climber this round</div>
                <div className="text-lg font-bold text-indigo-700">Carol Davis (+3 positions)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const QuizEnd = () => (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-100">
      <div className="bg-white px-6 py-3 flex items-center justify-center shadow-sm relative">
        <div className="font-semibold text-gray-900 text-xl">Advanced Mathematics - Quiz Complete</div>
        <button className="absolute right-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
          Exit
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-5xl font-black text-gray-900 mb-12">🎉 Quiz Complete! 🎉</div>

          <div className="flex items-end justify-center gap-8 mb-12">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-32 h-40 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                <div className="text-white">
                  <div className="text-4xl font-black mb-1">2</div>
                  <div className="text-sm font-semibold">Silver</div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">Bob Smith</div>
              <div className="text-lg text-gray-600">7,800 pts</div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-40 h-56 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-2xl flex items-center justify-center shadow-2xl mb-3">
                <div className="text-white">
                  <Crown className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-5xl font-black mb-1">1</div>
                  <div className="text-sm font-semibold">Gold</div>
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">Alice Johnson</div>
              <div className="text-xl text-gray-600">8,500 pts</div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                <div className="text-white">
                  <div className="text-4xl font-black mb-1">3</div>
                  <div className="text-sm font-semibold">Bronze</div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">Carol Davis</div>
              <div className="text-lg text-gray-600">7,200 pts</div>
            </div>
          </div>

          <div className="text-2xl font-semibold text-gray-700">
            Thank you for participating! 🎓
          </div>
        </div>
      </div>
    </div>
  );

  // MOBILE PARTICIPANT SCREENS
  const MobileLogin = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl font-black text-indigo-600 mb-2">QuizApp</div>
          <div className="text-gray-600">Join the fun!</div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Session ID</label>
            <input
              type="text"
              placeholder="Enter session code"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nickname</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xl font-bold hover:bg-indigo-700 shadow-lg">
          Join Quiz
        </button>
      </div>
    </div>
  );

  const MobileLobby = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="text-center text-white">
        <div className="text-4xl font-bold mb-8">Advanced Mathematics</div>
        <div className="bg-white rounded-2xl p-6 inline-block mb-8 shadow-xl">
          <div className="text-2xl font-bold text-gray-900 mb-2">Welcome!</div>
          <div className="text-xl text-indigo-600 font-semibold">Alice Johnson</div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Check className="w-6 h-6" />
          <div className="text-xl font-semibold">Connected</div>
        </div>
        <div className="text-lg opacity-90 animate-pulse">Waiting for host to start...</div>
      </div>
    </div>
  );

  const MobileTransition = () => (
    <div className="max-w-md mx-auto h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
      <div className="text-center text-white">
        <div className="text-5xl font-black mb-12 animate-bounce">Get Ready!</div>
        <div className="text-9xl font-black animate-pulse">3</div>
      </div>
    </div>
  );

  const MobilePersonalQuestion = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-50">
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="font-semibold text-gray-900">Advanced Math</div>
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-indigo-600">
          18
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="mb-6">
          <img src="/api/placeholder/400/200" alt="Question" className="w-full rounded-2xl shadow-lg mb-4" />
          <div className="text-2xl font-bold text-gray-900 text-center">
            What is the capital of France?
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {['Paris', 'London', 'Berlin', 'Madrid'].map((answer, idx) => (
            <button
              key={idx}
              className={`p-6 rounded-2xl font-bold text-xl shadow-lg transition-all ${idx === 0
                ? 'bg-indigo-600 text-white scale-105 ring-4 ring-indigo-300'
                : 'bg-white text-gray-900 hover:bg-gray-50'
                }`}
            >
              {answer}
            </button>
          ))}
        </div>

        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
            <Check className="w-5 h-5" />
            Answer received
          </div>
        </div>
      </div>
    </div>
  );

  const MobileStageQuestion = () => (
    <div className="max-w-md mx-auto h-screen grid grid-cols-2 gap-2 p-2 bg-gray-900">
      {[
        { letter: 'A', color: 'bg-blue-500' },
        { letter: 'B', color: 'bg-green-500' },
        { letter: 'C', color: 'bg-orange-500' },
        { letter: 'D', color: 'bg-red-500' }
      ].map((option, idx) => (
        <button
          key={idx}
          className={`${option.color} text-white rounded-2xl flex items-center justify-center text-8xl font-black hover:opacity-90 transition-opacity shadow-2xl`}
        >
          {option.letter}
        </button>
      ))}
    </div>
  );

  const MobileAnswerResult = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 p-6">
      <div className="text-center text-white">
        <div className="text-7xl mb-6">✓</div>
        <div className="text-5xl font-black mb-8">Correct!</div>
        <div className="text-6xl font-black mb-8">+1000</div>
        <div className="text-3xl font-bold flex items-center justify-center gap-2">
          🔥 3 in a row!
        </div>
      </div>
    </div>
  );

  const MobilePersonalLeaderboard = () => (
    <div className="max-w-md mx-auto h-screen bg-gray-50 overflow-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-12">
        <h2 className="text-3xl font-bold text-center mb-6">Leaderboard</h2>
      </div>

      <div className="px-4 -mt-6 space-y-3 mb-6">
        {leaderboard.map((player, idx) => (
          <div
            key={player.rank}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg ${idx === 0
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
              : idx === 1
                ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                : idx === 2
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                  : 'bg-white'
              }`}
          >
            <div className={`text-2xl font-black ${idx < 3 ? 'text-white' : 'text-gray-900'} w-8`}>
              {player.rank}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                {player.name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                {player.points}
              </div>
              {player.streak >= 3 && <div className="text-xl">🔥</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-gray-200 my-4"></div>

      <div className="px-4 pb-6">
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4">
          <div className="text-sm text-indigo-600 font-semibold mb-1">Your Position</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-indigo-900">#4</div>
            <div className="text-xl font-bold text-indigo-700">6,900 pts</div>
          </div>
        </div>
        <div className="text-center mt-4 text-lg font-semibold text-gray-700">Keep it up! 💪</div>
      </div>
    </div>
  );

  const MobileStageLeaderboard = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-6">
      <div className="text-center text-white">
        <div className="text-6xl font-black mb-8">#4</div>
        <div className="text-5xl font-black mb-12">6,900</div>
        <div className="text-2xl font-bold flex items-center justify-center gap-2 mb-8">
          🔥 Streak: 3
        </div>
        <div className="text-xl opacity-90">You're doing great!</div>
      </div>
    </div>
  );

  const MobilePersonalEnd = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-black text-gray-900 mb-8">🎉 Quiz Complete! 🎉</div>

        <div className="flex items-end justify-center gap-4 mb-8">
          <div className="text-center">
            <div className="w-20 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-xl flex items-center justify-center shadow-lg mb-2">
              <div className="text-white text-2xl font-black">2</div>
            </div>
            <div className="font-bold text-sm">Bob Smith</div>
            <div className="text-xs text-gray-600">7,800</div>
          </div>

          <div className="text-center">
            <div className="w-24 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-xl flex items-center justify-center shadow-xl mb-2">
              <div className="text-white">
                <Crown className="w-6 h-6 mx-auto mb-1" />
                <div className="text-3xl font-black">1</div>
              </div>
            </div>
            <div className="font-bold">Alice Johnson</div>
            <div className="text-sm text-gray-600">8,500</div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-xl flex items-center justify-center shadow-lg mb-2">
              <div className="text-white text-2xl font-black">3</div>
            </div>
            <div className="font-bold text-sm">Carol Davis</div>
            <div className="text-xs text-gray-600">7,200</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg w-full mb-6">
          <div className="text-center">
            <div className="text-gray-600 mb-2">Your Final Position</div>
            <div className="text-4xl font-black text-indigo-600 mb-1">#4</div>
            <div className="text-2xl font-bold text-gray-800">6,900 points</div>
          </div>
        </div>

        <div className="text-xl font-semibold text-gray-700 text-center">
          Thank you for playing! 🎓
        </div>
      </div>
    </div>
  );

  const MobileStageEnd = () => (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-6">
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-gray-900 mb-2">Quiz Complete!</div>
          <div className="text-gray-600">Great job!</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
            <div className="text-gray-700 font-semibold">Total Points</div>
            <div className="text-3xl font-black text-indigo-600">6,900</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div className="text-gray-700 font-semibold">Correct Answers</div>
            <div className="text-2xl font-bold text-green-600">9</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div className="text-gray-700 font-semibold">Wrong Answers</div>
            <div className="text-2xl font-bold text-red-600">3</div>
          </div>
        </div>

        <div className="text-center text-lg font-semibold text-gray-700">
          Thank you for playing! 🎓
        </div>
      </div>
    </div>
  );

  // ADMIN SCREENS
  const AdminTopBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
          JD
        </div>
        <div>
          <div className="font-semibold text-gray-900">John Doe</div>
          <div className="text-xs text-indigo-600 font-medium">Admin</div>
        </div>
      </div>
      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
        Switch to Host
      </button>
      <div className="text-lg font-semibold text-gray-700">Tech Academy</div>
    </div>
  );

  const AdminSidebar = ({ active }) => (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {[
          { id: 'admin-org', label: 'Organization customization', icon: Settings },
          { id: 'admin-members', label: 'Members management', icon: Users },
          { id: 'admin-settings', label: 'Default quiz settings', icon: Settings },
          { id: 'admin-logs', label: 'Activity logs', icon: FileText }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${active === item.id
              ? 'bg-indigo-100 text-indigo-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const AdminOrganization = () => (
    <div className="flex flex-col h-screen">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active="admin-org" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Organization Customization</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Organization Logo</label>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                  <div className="w-32 h-32 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-4xl font-black text-indigo-600">TA</div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                    Change Logo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Tech Academy"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    defaultValue="An educational organization focused on technology and innovation"
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Theme and Visual Settings</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Font</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option>Inter</option>
                    <option>Poppins</option>
                    <option>Roboto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#4F46E5"
                      className="w-16 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      defaultValue="#4F46E5"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#9333EA"
                      className="w-16 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      defaultValue="#9333EA"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminMembers = () => (
    <div className="flex flex-col h-screen">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active="admin-members" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Members Management</h1>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by Role
              </button>
            </div>

            <div className="mb-6">
              <button
                onClick={() => {
                  setModalType('add-member');
                  setShowModal(true);
                }}
                className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div className="font-semibold text-gray-700">Add Member</div>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminSettings = () => (
    <div className="flex flex-col h-screen">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active="admin-settings" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Default Quiz Settings</h1>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Quiz Mode</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Personal Mode</option>
                  <option>Stage Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Question Duration (seconds)</label>
                <input
                  type="number"
                  defaultValue="20"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Streak System</label>
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-semibold">
                    ON
                  </button>
                  <button className="px-6 py-2.5 bg-gray-200 text-gray-600 rounded-lg font-semibold">
                    OFF
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Leaderboard Display Count</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminLogs = () => (
    <div className="flex flex-col h-screen">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active="admin-logs" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Logs</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Action Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Actions</option>
                    <option>Quiz creation</option>
                    <option>Quiz deletion</option>
                    <option>User add/remove</option>
                    <option>Settings change</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">User</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Users</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Affected Item</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{log.timestamp}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
          {modalType === 'add-member' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add Member</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option>Participant</option>
                    <option>Host</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                Send Invite
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      // Host views
      case 'host-dashboard': return <HostDashboard />;
      case 'quiz-detail': return <QuizDetail />;
      case 'edit-question': return <EditQuestion />;
      case 'create-question': return <CreateQuestion />;
      case 'host-lobby': return <HostLobby />;
      case 'question-transition': return <QuestionTransition />;
      case 'live-question': return <LiveQuestion />;
      case 'answer-results': return <AnswerResults />;
      case 'leaderboard': return <Leaderboard />;
      case 'quiz-end': return <QuizEnd />;

      // Mobile views
      case 'mobile-login': return <MobileLogin />;
      case 'mobile-lobby': return <MobileLobby />;
      case 'mobile-transition': return <MobileTransition />;
      case 'mobile-personal-q': return <MobilePersonalQuestion />;
      case 'mobile-stage-q': return <MobileStageQuestion />;
      case 'mobile-answer-result': return <MobileAnswerResult />;
      case 'mobile-personal-lb': return <MobilePersonalLeaderboard />;
      case 'mobile-stage-lb': return <MobileStageLeaderboard />;
      case 'mobile-personal-end': return <MobilePersonalEnd />;
      case 'mobile-stage-end': return <MobileStageEnd />;

      // Admin views
      case 'admin-org': return <AdminOrganization />;
      case 'admin-members': return <AdminMembers />;
      case 'admin-settings': return <AdminSettings />;
      case 'admin-logs': return <AdminLogs />;

      default: return <HostDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderNavigation()}
      {renderView()}
      <Modal />
    </div>
  );
};

export default QuizApp;