import * as SparkPost from "sparkpost";

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recepient : string, url : string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confrimation Email",
      html: `<html>
                <body>
                    <p>Hi, use this link to confirm your account:</p></br>
                    <a href="${url}">Confrim Email</a>
                </body>
            </html>`
    },
    recipients: [
      {
        address: recepient
      }
    ]
  });

  console.log(response);
};
