import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(data: { candidateName: string; candidateEmail: string; inquiryId?: string }) {
    // ルールベースで候補日時3つを生成（モック）
    const now = new Date();
    const slots = [
      new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2日後
      new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3日後
      new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4日後
    ];

    const schedule = await this.prisma.schedule.create({
      data: {
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        inquiryId: data.inquiryId,
        status: 'PROPOSED',
        slots: {
          create: slots.map(slot => ({
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
      slots: schedule.slots.map(s => s.slotTime),
    };
  }

  async confirm(scheduleId: string, slotId: string) {
    const slot = await this.prisma.scheduleSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) throw new Error('Slot not found');

    // カレンダー登録（モック）
    const mockEventId = `MOCK-EVENT-${Date.now()}`;

    await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CONFIRMED',
        confirmedSlot: slot.slotTime,
        externalEventId: mockEventId,
      },
    });

    await this.prisma.scheduleSlot.update({
      where: { id: slotId },
      data: { isSelected: true },
    });

    return { externalEventId: mockEventId };
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
