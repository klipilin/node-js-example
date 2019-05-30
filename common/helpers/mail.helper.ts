import * as Koa from 'koa';
const nodeMailer = require('nodemailer');

class MailHelper {

  /**
   */
  public send = async ( email: string, subject: string, text: string, ctx: Koa.Context ) =>  {

    const transporter = nodeMailer.createTransport({
      host: process.env.COMMON_SMTP_SERVER,
      port: process.env.COMMON_SMTP_PORT,
      auth: {
        user: process.env.COMMON_SMTP_USER,
        pass: process.env.COMMON_SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.COMMON_APP_NAME + ' ' + process.env.COMMON_SMTP_EMAIL,
      to: email,
      subject: subject,
      html:  text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  };

  /**
   */
  public signUpEmailText = async ( jwtStringLink: string ): Promise<string> =>  {
    const url       = '<a href="' + jwtStringLink + '">' + jwtStringLink + '</a>' ;
    return '<h3>SignUp Link: </h3><br> ' + url;
  };

  /**
   */
  public resetPasswordEmailText = ( email: string ): string =>  {
    const link      = this.generateJWTStringLink( { user: {email: email}}, 'user/sign-up/' );
    const url       = '<a href="' + link + '">' + link + '</a>' ;
    return '<h3>Reset Password Link: </h3><br> ' + url;
  };

  /**
   */
  public generateJWTStringLink = ( payload: object, action: string ): string =>  {
    return process.env.COOMON_APP_LINK + action + payload;
  };

}

export default new MailHelper;

