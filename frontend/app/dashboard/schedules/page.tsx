'use client';

import { useEffect, useState } from 'react';
import { scheduleService } from '@/lib/services';

// サンプルイベント
const sampleEvents = [
  {
    id: '1',
    title: '田中太郎 - 1次面接',
    date: new Date(2026, 1, 18, 14, 0),
    duration: 60,
    status: 'CONFIRMED',
    candidateName: '田中太郎',
    candidateEmail: 'tanaka@example.com',
  },
  {
    id: '2',
    title: '佐藤花子 - 最終面接',
    date: new Date(2026, 1, 19, 10, 30),
    duration: 90,
    status: 'CONFIRMED',
    candidateName: '佐藤花子',
    candidateEmail: 'sato@example.com',
  },
  {
    id: '3',
    title: '鈴木一郎 - カジュアル面談',
    date: new Date(2026, 1, 20, 15, 0),
    duration: 45,
    status: 'PROPOSED',
    candidateName: '鈴木一郎',
    candidateEmail: 'suzuki@example.com',
  },
  {
    id: '4',
    title: '高橋美咲 - 2次面接',
    date: new Date(2026, 1, 21, 13, 0),
    duration: 60,
    status: 'CONFIRMED',
    candidateName: '高橋美咲',
    candidateEmail: 'takahashi@example.com',
  },
];

export default function SchedulesPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const renderCalendar = () => {
    const days = [];

    // 前月の空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 p-2 min-h-[100px]"></div>
      );
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`border border-gray-200 p-2 min-h-[100px] transition-all hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-all hover:shadow-md ${
                  event.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                {new Date(event.date).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} {event.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">日程調整カレンダー</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1"></span>
            確定
          </span>
          <span className="text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-yellow-100 rounded mr-1"></span>
            調整中
          </span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* カレンダーヘッダー */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-white">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          <button
            onClick={nextMonth}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-100">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center py-3 text-sm font-semibold ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">面接予定</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">候補者名</label>
                <p className="mt-1 text-gray-900">{selectedEvent.candidateName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <p className="mt-1 text-gray-900">{selectedEvent.candidateEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">日時</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedEvent.date).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">所要時間</label>
                <p className="mt-1 text-gray-900">{selectedEvent.duration}分</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ステータス</label>
                <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedEvent.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedEvent.status === 'CONFIRMED' ? '確定' : '調整中'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Googleカレンダーで開く
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
