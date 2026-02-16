import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  async create(data: {
    candidateName: string;
    candidateEmail: string;
    inquiryId?: string;
    jobTitle?: string;
  }) {
    // ルールベースで候補日時3つを生成（ビジネス時間: 10:00, 14:00, 16:00）
    const now = new Date();
    const slots = [
      new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2日後 10:00
      new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3日後 14:00
      new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4日後 16:00
    ].map((date, index) => {
      const hours = [10, 14, 16][index];
      date.setHours(hours, 0, 0, 0);
      return date;
    });

    // Google Calendar URLを生成
    const calendarUrls = this.calendarService.generateCalendarUrlsForSlots({
      title: data.jobTitle ? `面接：${data.jobTitle}` : '面接',
      slots,
      durationMinutes: 60,
      description: `候補者: ${data.candidateName}`,
      location: 'オンライン（詳細は後日お知らせします）',
    });

    const schedule = await this.prisma.schedule.create({
      data: {
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        inquiryId: data.inquiryId,
        status: 'PROPOSED',
        slots: {
          create: slots.map((slot) => ({
            slotTime: slot,
          })),
        },
      },
      include: {
        slots: true,
      },
    });

    return {
      scheduleId: schedule.id,
      slots: schedule.slots.map((s, index) => ({
        slotId: s.id,
        slotTime: s.slotTime,
        calendarUrl: calendarUrls[index].calendarUrl,
      })),
    };
  }

  async confirm(scheduleId: string, slotId: string, jobTitle?: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) throw new Error('Schedule not found');

    const slot = await this.prisma.scheduleSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) throw new Error('Slot not found');

    // Google Calendar URL を生成
    const startTime = slot.slotTime;
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1時間後

    const calendarUrl = this.calendarService.generateGoogleCalendarUrl({
      title: jobTitle ? `面接：${jobTitle}` : '面接',
      startTime,
      endTime,
      description: `候補者: ${schedule.candidateName}\nメール: ${schedule.candidateEmail}`,
      location: 'オンライン（詳細は後日お知らせします）',
    });

    // スケジュールを確定に更新
    await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CONFIRMED',
        confirmedSlot: slot.slotTime,
        externalEventId: calendarUrl, // Calendar URLを保存
      },
    });

    // 選択されたスロットをマーク
    await this.prisma.scheduleSlot.update({
      where: { id: slotId },
      data: { isSelected: true },
    });

    return {
      confirmedSlot: slot.slotTime,
      calendarUrl,
      message:
        'スケジュールが確定しました。Google Calendarに追加するにはリンクをクリックしてください。',
    };
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        slots: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
