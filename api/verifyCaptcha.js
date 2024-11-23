// api/verifyCaptcha.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { captchaValue } = req.body;
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${captchaValue}`,
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  