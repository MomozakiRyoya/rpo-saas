'use client';

import { useEffect, useState } from 'react';
import { scheduleService } from '@/lib/services';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0">読み込み中...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">日程調整一覧</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {schedules.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
              日程調整はありません
            </li>
          ) : (
            schedules.map((schedule) => (
              <li key={schedule.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {schedule.candidateName}
                    </p>
                    <p className="text-sm text-gray-500">{schedule.candidateEmail}</p>
                    {schedule.confirmedSlot && (
                      <p className="text-xs text-green-600 mt-1">
                        確定日時: {new Date(schedule.confirmedSlot).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        schedule.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {schedule.status}
                    </span>
                  </div>
                </div>
                {schedule.slots && schedule.slots.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">候補日時:</p>
                    <ul className="mt-1 space-y-1">
                      {schedule.slots.map((slot: any) => (
                        <li key={slot.id} className="text-xs text-gray-600">
                          {new Date(slot.slotTime).toLocaleString('ja-JP')}
                          {slot.isSelected && ' ✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
