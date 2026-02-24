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
          className={`border border-gray-100 p-2 min-h-[100px] transition-all hover:bg-gray-50 ${
            isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-all hover:shadow-sm ${
                  event.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
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
      {/* ページタイトル */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">日程調整カレンダー</h2>
          <p className="mt-1 text-sm text-gray-500">面接・面談のスケジュールを管理します</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-emerald-100 rounded mr-1.5 border border-emerald-200"></span>
            確定
          </span>
          <span className="inline-flex items-center text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-amber-100 rounded mr-1.5 border border-amber-200"></span>
            調整中
          </span>
        </div>
      </div>

      {/* カレンダーカード */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {/* カレンダーヘッダー */}
        <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <button
            onClick={prevMonth}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h2>
          </div>
          <button
            onClick={nextMonth}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-50 text-gray-500">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center py-3 text-sm font-semibold ${
                index === 0 ? 'text-rose-500' : index === 6 ? 'text-indigo-500' : 'text-gray-500'
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
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">面接予定</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">候補者名</label>
                <p className="text-sm text-gray-900">{selectedEvent.candidateName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <p className="text-sm text-gray-900">{selectedEvent.candidateEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日時</label>
                <p className="text-sm text-gray-900">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">所要時間</label>
                <p className="text-sm text-gray-900">{selectedEvent.duration}分</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedEvent.status === 'CONFIRMED' ? '確定' : '調整中'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                Googleカレンダーで開く
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
