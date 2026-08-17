# Apptitude

A simple aptitude quiz for students, built with Next.js and Cloud Firestore.

## Run it

1. Create a Firebase project, open **Build > Firestore Database**, and create a database.
2. In **Project settings > Service accounts**, generate a private key. Copy `.env.example` to `.env.local` and fill in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from that key.
3. Add a Firebase Web App and copy its values into the `NEXT_PUBLIC_FIREBASE_*` variables. To use Google sign-in, enable Google in **Authentication > Sign-in method**.
4. Create an NVIDIA API key at `build.nvidia.com` and add it as `NVIDIA_API_KEY` in `.env.local` to enable AI question generation.
5. Install and start the app:

   ```bash
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. Sign up with your name, email and password, then begin the quiz. The app stores users, questions, and results in the Firestore `users`, `questions`, and `results` collections.

The server uses the Firebase Admin SDK, so browser clients do not need direct Firestore access. Keep the service-account variables server-side and never prefix them with `NEXT_PUBLIC_`. The included Firestore rules deny direct browser reads and writes; deploy them with the Firebase CLI before production use.

## Features

- Student sign up and login
- Google sign-in through Firebase Authentication
- Four options per question
- Previous, Next and Submit controls
- Result and score history saved for each student
- AI-generated question sets by topic (10, 20, or 50 questions) using NVIDIA Nemotron
- Admin question imports and result exports
