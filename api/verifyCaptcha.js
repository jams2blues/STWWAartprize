// api/verifyCaptcha.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { token } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Use environment variable

  if (!token) {
    res.status(400).json({ success: false, message: 'No token provided.' });
    return;
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: 'POST',
      }
    );

    const data = await response.json();

    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
