module.exports = (full_name, token) => `
  <div style="font-family: Arial, sans-serif; background-color:#f7f9fc; padding:20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="text-align:center; padding:30px 20px; background:#dc2626; border-radius:8px 8px 0 0; color:#fff;">
          <h1 style="margin:0; font-size:24px;">Password Reset Request 🔐</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 20px; color:#333; font-size:16px; line-height:1.5;">
          <h2 style="margin-top:0;">Hi ${full_name},</h2>
          <p>
            We received a request to reset your password.  
            Click the button below to set up a new one:
          </p>
          <div style="text-align:center; margin:30px 0;">
            <a href="https://yourplatform.com/reset-password?token=${token}" 
               style="background:#dc2626; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block; font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p>
            If you didn’t request this, you can safely ignore this email.  
            This link will expire in <strong>15 min</strong> for your security.
          </p>
          <p style="margin-top:30px;">Stay safe,<br>The Team at Our Platform</p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center; padding:15px; font-size:12px; color:#777; background:#f1f3f8; border-radius:0 0 8px 8px;">
          © ${new Date().getFullYear()} Our Platform. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
`;
