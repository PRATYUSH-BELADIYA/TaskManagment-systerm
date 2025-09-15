module.exports = (full_name) => `
  <div style="font-family: Arial, sans-serif; background-color:#f7f9fc; padding:20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="text-align:center; padding:30px 20px; background:#4f46e5; border-radius:8px 8px 0 0; color:#fff;">
          <h1 style="margin:0; font-size:24px;">Welcome to Our Platform 🎉</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 20px; color:#333; font-size:16px; line-height:1.5;">
          <h2 style="margin-top:0;">Hi ${full_name},</h2>
          <p>
            Congratulations on joining our platform! We’re excited to have you on board.  
            Explore new opportunities, stay connected, and make the most of what we offer.
          </p>
          <div style="text-align:center; margin:30px 0;">
            <a href="https://yourplatform.com/login" 
               style="background:#4f46e5; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block; font-weight:bold;">
              Get Started
            </a>
          </div>
          <p style="margin-top:30px;">Cheers,<br>The Team at Our Platform</p>
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
