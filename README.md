```markdown
# Save The World With Art™ Art Prize

Welcome to the 9th **Save The World With Art™ Art Prize**! Participate by submitting your unique 1/1 on-chain art and vote for your favorite artworks to help save the world through creativity and community support.

## 🌟 Features

- **Submit Entry**: Connect your wallet and submit your unique art entry securely.
- **Voting Gallery**: Browse through all submissions and vote for your favorite artworks.
- **Top 3 Showcase**: View the top three artworks based on the highest votes.
- **Responsive Design**: Fully optimized for all devices and screen sizes.
- **Performance Optimizations**:
  - **Image Lazy Loading**: Images load only when they enter the viewport, enhancing load times.
  - **Code Splitting**: Components are loaded dynamically, reducing the initial bundle size.
- **Security Enhancements**:
  - **reCAPTCHA v2**: Protects forms and actions from spam and abuse with user-friendly CAPTCHA challenges.

## 🚀 Technologies Used

- **React** with **Create React App**: Building a dynamic and interactive user interface.
- **Material-UI (MUI)**: Implementing consistent and responsive styling across components.
- **Thin Backend**: Managing backend services and database interactions seamlessly.
- **Tezos Beacon Wallet**: Facilitating secure blockchain interactions and wallet connectivity.
- **reCAPTCHA v2**: Enhancing security by preventing automated submissions and voting.
- **CRACO**: Customizing Create React App configurations without ejecting.
- **Webpack 5**: Bundling assets efficiently with necessary polyfills.
- **React.lazy & Suspense**: Implementing code splitting for optimized performance.

## 🛠 Getting Started

Follow these instructions to set up and run the project locally.

### 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** v18.x
- **npm** v10.x
- **Git** for version control
- **Vercel Account** for deployment

### 🧰 Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/jams2blues/STWWAartprize.git
   cd STWWAartprize
   ```

2. **Install Dependencies**

   Install all necessary packages using npm:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_v2_site_key
   REACT_APP_RECAPTCHA_SECRET_KEY=your_recaptcha_v2_secret_key
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```

   - **REACT_APP_RECAPTCHA_SITE_KEY**: Your Google reCAPTCHA v2 site key.
   - **REACT_APP_RECAPTCHA_SECRET_KEY**: Your Google reCAPTCHA v2 secret key.
   - **REACT_APP_BACKEND_URL**: The URL of your Thin Backend instance.

4. **Run the Application Locally**

   Start the development server:

   ```bash
   npm start
   ```

   The application should now be running at `http://localhost:3000`.

### 🛠 Deployment

Deploying the application to Vercel ensures it is accessible globally with optimized performance.

1. **Push Changes to GitHub**

   Ensure all your changes are committed and pushed to the repository:

   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

   > **Note:** Ensure you are pushing to the branch that Vercel is monitoring (commonly `main`).

2. **Connect GitHub Repository to Vercel**

   - Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click on **"New Project"** and select your GitHub repository (`STWWAartprize`).
   - Follow the prompts to configure the project settings.

3. **Set Environment Variables in Vercel**

   - In your Vercel project dashboard, navigate to **Settings** > **Environment Variables**.
   - Add the following variables:

     | Key                        | Value                          |
     | -------------------------- | ------------------------------ |
     | `REACT_APP_RECAPTCHA_SITE_KEY` | Your reCAPTCHA v2 site key    |
     | `REACT_APP_RECAPTCHA_SECRET_KEY` | Your reCAPTCHA v2 secret key |
     | `REACT_APP_BACKEND_URL`    | Your Thin Backend URL          |

4. **Trigger a Deployment**

   - Vercel automatically deploys on pushes to the connected branch.
   - If automatic deployment doesn't trigger, manually trigger one:
     - Go to the **Deployments** tab in your Vercel project.
     - Click on **"New Deployment"** and follow the instructions.

5. **Verify Deployment**

   - Once deployed, visit your Vercel-provided URL to ensure the application is live and functioning as expected.

## 🔧 Usage

1. **Submit an Art Entry**

   - Navigate to the **Submit Entry** page.
   - Connect your Tezos wallet using the **Connect Wallet** button.
   - Enter your ZeroContract address and Token ID.
   - Complete the reCAPTCHA challenge and submit your entry.

2. **Vote for Artworks**

   - Go to the **Voting Gallery**.
   - Browse through the submitted artworks.
   - Connect your wallet if not already connected.
   - Complete the reCAPTCHA challenge and vote for your favorite artworks.

3. **View Top 3 Artworks**

   - Visit the **Top 3** page to see the artworks with the highest votes.
   - After the competition ends, winners will receive Tezos rewards and on-chain certificates.

## 📂 Project Structure

```
STWWAartprize/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   └── Header.js
│   ├── routes/
│   │   ├── SubmitEntry.js
│   │   ├── VotingGallery.js
│   │   ├── TopThree.js
│   │   └── NotFound.js
│   ├── contexts/
│   │   └── WalletContext.js
│   ├── utils/
│   │   ├── tezosUtils.js
│   │   └── thinBackendUtils.js
│   ├── App.js
│   ├── index.js
│   ├── theme.js
│   └── index.css
├── .env
├── craco.config.js
├── package.json
├── vercel.json
└── README.md
```

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Acknowledgements

- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Thin Backend](https://thin-backend.com/)
- [Tezos Beacon Wallet](https://taquito.io/)
- [reCAPTCHA](https://www.google.com/recaptcha/)
- [Vercel](https://vercel.com/)

---

Thank you for participating in the **Save The World With Art™ Art Prize**! Your creativity and support make a difference in saving our world through art.

```