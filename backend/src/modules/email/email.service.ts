import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    try {
      console.log('🔧 Initializing EmailService...');

      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.warn(
          '⚠️ RESEND_API_KEY is not set. Email features will use mock responses.',
        );
      }

      this.resend = new Resend(apiKey || 'dummy-key');
      this.fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';

      console.log('✅ EmailService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize EmailService:', error);
      throw error;
    }
  }

  /**
   * 問い合わせ返信メールを送信
   */
  async sendInquiryResponse(params: {
    to: string;
    applicantName: string;
    jobTitle?: string;
    responseContent: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const { to, applicantName, jobTitle, responseContent } = params;

    const subject = jobTitle
      ? `【${jobTitle}】お問い合わせへの回答`
      : 'お問い合わせへの回答';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
    .response-box { background-color: white; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>お問い合わせへの回答</h2>
    </div>
    <div class="content">
      <p>${applicantName}様</p>
      ${jobTitle ? `<p><strong>【求人】${jobTitle}</strong></p>` : ''}
      <div class="response-box">
${responseContent}
      </div>
      <p>引き続きよろしくお願いいたします。</p>
    </div>
    <div class="footer">
      <p>このメールは自動送信されています。</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * 日程調整メールを送信
   */
  async sendScheduleProposal(params: {
    to: string;
    candidateName: string;
    slots: Array<{ slotTime: Date; calendarUrl?: string }>;
    scheduleId: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const { to, candidateName, slots, scheduleId } = params;

    const subject = '面接日程のご案内';

    const slotsHtml = slots
      .map(
        (slot, index) =>
          `<li>
            <strong>候補${index + 1}:</strong> ${slot.slotTime.toLocaleString('ja-JP')}
            ${slot.calendarUrl ? `<br><a href="${slot.calendarUrl}" style="color: #10B981; text-decoration: none;">📅 Googleカレンダーに追加</a>` : ''}
          </li>`,
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
    .slots { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>面接日程のご案内</h2>
    </div>
    <div class="content">
      <p>${candidateName}様</p>
      <p>この度はご応募いただき、誠にありがとうございます。</p>
      <p>面接の日程につきまして、以下の候補日時をご提案させていただきます。</p>
      <div class="slots">
        <ul>
${slotsHtml}
        </ul>
      </div>
      <p>ご都合の良い日時がございましたら、ご返信ください。</p>
      <p style="text-align: center;">
        <strong>Schedule ID: ${scheduleId}</strong>
      </p>
    </div>
    <div class="footer">
      <p>このメールは自動送信されています。</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * 承認通知メールを送信
   */
  async sendApprovalNotification(params: {
    to: string;
    userName: string;
    jobTitle: string;
    action: 'approved' | 'rejected';
    comment?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const { to, userName, jobTitle, action, comment } = params;

    const isApproved = action === 'approved';
    const subject = isApproved
      ? `【承認完了】${jobTitle}`
      : `【差し戻し】${jobTitle}`;

    const statusColor = isApproved ? '#10B981' : '#EF4444';
    const statusText = isApproved ? '承認されました' : '差し戻されました';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
    .job-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .comment { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${statusText}</h2>
    </div>
    <div class="content">
      <p>${userName}様</p>
      <div class="job-info">
        <h3>${jobTitle}</h3>
        <p>上記の求人が<strong>${statusText}</strong>。</p>
      </div>
      ${comment ? `<div class="comment"><strong>コメント:</strong><br>${comment}</div>` : ''}
      <p>${isApproved ? '掲載準備を進めてください。' : '内容を修正して再度申請してください。'}</p>
    </div>
    <div class="footer">
      <p>このメールは自動送信されています。</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * 汎用メール送信
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const { to, subject, html } = params;

    // API Keyが設定されていない場合はモック
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Mock email sent:');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('❌ Failed to send email:', error);
        return { success: false };
      }

      console.log(`✅ Email sent: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false };
    }
  }
}
