import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarService {
  /**
   * Google Calendar予定作成URLを生成
   */
  generateGoogleCalendarUrl(params: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    location?: string;
  }): string {
    const { title, startTime, endTime, description, location } = params;

    // Google Calendar URL用に日時をフォーマット (YYYYMMDDTHHmmssZ)
    const formatDateTime = (date: Date): string => {
      return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    };

    const dates = `${formatDateTime(startTime)}/${formatDateTime(endTime)}`;

    const urlParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: dates,
    });

    if (description) {
      urlParams.append('details', description);
    }

    if (location) {
      urlParams.append('location', location);
    }

    return `https://calendar.google.com/calendar/render?${urlParams.toString()}`;
  }

  /**
   * 複数の候補日時からGoogle Calendar URLを生成
   */
  generateCalendarUrlsForSlots(params: {
    title: string;
    slots: Date[];
    durationMinutes?: number;
    description?: string;
    location?: string;
  }): Array<{ slotTime: Date; calendarUrl: string }> {
    const {
      title,
      slots,
      durationMinutes = 60,
      description,
      location,
    } = params;

    return slots.map((slot) => {
      const startTime = slot;
      const endTime = new Date(slot.getTime() + durationMinutes * 60 * 1000);

      const calendarUrl = this.generateGoogleCalendarUrl({
        title,
        startTime,
        endTime,
        description,
        location,
      });

      return {
        slotTime: slot,
        calendarUrl,
      };
    });
  }
}
