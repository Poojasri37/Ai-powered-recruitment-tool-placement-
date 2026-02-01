import nodemailer from 'nodemailer';

// Configure your email service (using Gmail or any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

export async function sendInterviewScheduledEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  scheduledTime: Date,
  sessionLink: string,
  recruiterName: string
): Promise<boolean> {
  try {
    const interviewDate = new Date(scheduledTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'recruitment-tool@example.com',
      to: candidateEmail,
      subject: `Interview Scheduled for ${jobTitle} Position`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Scheduled! 🎉</h2>
          <p>Dear ${candidateName},</p>
          
          <p>Congratulations! Your interview for the <strong>${jobTitle}</strong> position has been scheduled.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p><strong>Interview Details:</strong></p>
            <p>📅 <strong>Date & Time:</strong> ${interviewDate}</p>
            <p>👤 <strong>Conducted by:</strong> ${recruiterName}</p>
            <p>💼 <strong>Position:</strong> ${jobTitle}</p>
          </div>

          <p><strong>How to Join:</strong></p>
          <p>Click the button below to join your interview session. Make sure you have:</p>
          <ul>
            <li>A working camera and microphone</li>
            <li>A quiet environment</li>
            <li>A stable internet connection</li>
            <li>Google Chrome or Firefox browser</li>
          </ul>

          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${sessionLink}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Join Interview
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions or need to reschedule, please contact us immediately.
          </p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br/>
            AI Recruitment Tool Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Interview scheduled email sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendApplicationReceivedEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  recruiterName: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'recruitment-tool@example.com',
      to: candidateEmail,
      subject: `Application Received for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Received ✓</h2>
          <p>Dear ${candidateName},</p>
          
          <p>Thank you for applying for the <strong>${jobTitle}</strong> position!</p>
          
          <p>We have received your application and resume. Our team will review it carefully, and we'll be in touch within 3-5 business days.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p><strong>What to Expect:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Initial resume screening</li>
              <li>Phone/Video interview (if shortlisted)</li>
              <li>Technical assessment (if applicable)</li>
              <li>Final round with team</li>
            </ul>
          </div>

          <p>You can log in to your account to track the status of your application anytime.</p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br/>
            ${recruiterName}<br/>
            Hiring Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Application received email sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendApplicationStatusUpdateEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  status: string,
  message: string
): Promise<boolean> {
  try {
    const statusColors: { [key: string]: string } = {
      reviewing: '#f59e0b',
      interview_scheduled: '#2563eb',
      rejected: '#ef4444',
      accepted: '#10b981',
    };

    const statusColor = statusColors[status] || '#6b7280';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'recruitment-tool@example.com',
      to: candidateEmail,
      subject: `Application Status Update - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Status Update</h2>
          <p>Dear ${candidateName},</p>
          
          <div style="background-color: ${statusColor}20; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0;">
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${status.replace('_', ' ')}</span></p>
            <p><strong>Position:</strong> ${jobTitle}</p>
          </div>

          <p>${message}</p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br/>
            Recruitment Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Status update email sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
