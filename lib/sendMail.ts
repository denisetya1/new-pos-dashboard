import { Client, SendEmailV3_1, LibraryResponse }  from 'node-mailjet'; // another possible importing option

const mailjet = new Client({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY
});

type NameEmail = {
  name: string
  email: string
}

const sendMail = async ({
  sender,
  to,
  subject,
  htmlContent
}: {
  sender: NameEmail,
  to: NameEmail[],
  subject: string,
  htmlContent: string
}) => {

  const data: SendEmailV3_1.Body = {
    Messages:[
      {
        From: {
            Email: sender.email,
            Name: sender.name
        },
        To: to.map((t) => ({
          Email: t.email,
          Name: t.name
        })),
        Subject: subject,
        TextPart: htmlContent,
        HTMLPart: htmlContent
      }
    ],
  };

  const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
          .post('send', { version: 'v3.1' })
          .request(data);

  const { Status } = result.body.Messages[0];
}

export default sendMail