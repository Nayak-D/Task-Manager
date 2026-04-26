const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

/**
 * Email Service for sending notice notifications
 * Uses environment variables for configuration
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Gmail configuration (recommended for testing/development)
        if (process.env.EMAIL_SERVICE === 'gmail') {
            const gmailPassword = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: gmailPassword, // Use app-specific password for Gmail
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        // Custom SMTP configuration (for production)
        else if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        // Fallback to test account (Ethereal - for development only)
        else {
            this.setupTestAccount();
        }
    }

    async setupTestAccount() {
        // Create test account for development
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    /**
     * Send email notification for a notice
     * @param {string[]} recipients - Array of email addresses
     * @param {Object} noticeData - Notice details
     * @returns {Promise<Object>} - Result with message info and preview URL
     */
    async sendNoticeAlert(recipients, noticeData) {
        if (!recipients || recipients.length === 0) {
            console.warn('⚠️  No email recipients provided');
            return { success: false, message: 'No recipients provided' };
        }

        if (!this.transporter) {
            console.error('❌ Email service not configured');
            return { success: false, message: 'Email service not configured' };
        }

        const {
            title,
            description,
            category,
            author,
            expiryDate,
            noticeId,
            baseUrl = 'http://localhost:5173',
        } = noticeData;

        // Create HTML email template
        const htmlContent = this.generateEmailTemplate({
            title,
            description,
            category,
            author,
            expiryDate,
            noticeId,
            baseUrl,
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@noticeboard.com',
            to: recipients.join(', '),
            subject: `🔔 New Notice: ${title}`,
            html: htmlContent,
            text: this.generatePlainTextEmail({ title, description, category, author, expiryDate }),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);

            // For test/development emails, generate preview URL
            const previewUrl = process.env.NODE_ENV === 'development'
                ? nodemailer.getTestMessageUrl(info)
                : null;

            console.log(`✅ Email sent to ${recipients.length} recipients`);
            if (previewUrl) {
                console.log(`📧 Preview: ${previewUrl}`);
            }

            return {
                success: true,
                message: `Email sent to ${recipients.length} recipients`,
                messageId: info.messageId,
                previewUrl,
                recipientCount: recipients.length,
            };
        } catch (error) {
            console.error('❌ Email sending error:', error.message);
            return {
                success: false,
                message: error.message,
                error: error.message,
            };
        }
    }

    /**
     * Generate HTML email template
     */
    generateEmailTemplate({ title, description, category, author, expiryDate, noticeId, baseUrl }) {
        const formattedDate = new Date(expiryDate).toLocaleString();
        const viewNoticeLink = `${baseUrl}/notice/${noticeId}`;

        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Notice Alert</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .notice-title {
          font-size: 20px;
          font-weight: 600;
          color: #222;
          margin-bottom: 10px;
        }
        .category-badge {
          display: inline-block;
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .description {
          color: #555;
          line-height: 1.8;
          margin: 15px 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .meta-info {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
        }
        .meta-info p {
          margin: 5px 0;
        }
        .meta-label {
          font-weight: 600;
          color: #333;
        }
        .cta-button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
          font-size: 14px;
        }
        .cta-button:hover {
          background-color: #5568d3;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e0e0e0;
        }
        .timestamp {
          color: #999;
          font-size: 11px;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Notice Alert</h1>
        </div>
        <div class="content">
          <div class="notice-title">${this.escapeHtml(title)}</div>
          <div class="category-badge">${this.escapeHtml(category)}</div>
          
          <div class="description">${this.escapeHtml(description)}</div>
          
          <div class="meta-info">
            <p><span class="meta-label">Author:</span> ${this.escapeHtml(author)}</p>
            <p><span class="meta-label">Category:</span> ${this.escapeHtml(category)}</p>
            <p><span class="meta-label">Expires:</span> ${formattedDate}</p>
          </div>

          <a href="${viewNoticeLink}" class="cta-button">View Full Notice</a>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This is an automated notification from the Digital Notice Board. Please do not reply to this email.
          </p>
        </div>
        <div class="footer">
          <p>📬 Digital Notice Board</p>
          <div class="timestamp">Sent at ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
    `;
    }

    /**
     * Generate plain text version of email
     */
    generatePlainTextEmail({ title, description, category, author, expiryDate }) {
        return `
New Notice Alert
================

Title: ${title}
Category: ${category}
Author: ${author}
Expires: ${new Date(expiryDate).toLocaleString()}

${description}

Please log in to the Digital Notice Board to view more details.
    `.trim();
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Verify transporter connection
     */
    async verifyConnection() {
        if (!this.transporter) {
            return false;
        }
        try {
            await this.transporter.verify();
            console.log('✅ Email service verified');
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
