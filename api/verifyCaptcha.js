// api/verifyCaptcha.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token.' });
    }

    try {
      const params = new URLSearchParams();
      params.append('secret', secretKey);
      params.append('response', token);

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (!data.success) {
        return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
