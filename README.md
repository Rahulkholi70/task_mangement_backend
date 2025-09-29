# Backend

This is the backend for the application, built with Node.js, Express, and MongoDB.

## Local Development

1. Install dependencies: `npm install`
2. Create a `.env` file in the backend directory with your environment variables (see `.env` for example).
3. Run the development server: `npm run dev`
4. The server will run on `http://localhost:5000` (or the PORT specified in .env).

## Deployment on Vercel

1. Ensure `vercel.json` is present in the backend directory (it configures Vercel to deploy the full Express app).
2. Push your code to a Git repository.
3. Connect the repository to Vercel (set the root directory to `backend` if the repo root is the project root).
4. In the Vercel dashboard, go to your project settings and add the following environment variables:
   - `PORT`: 5000 (or your desired port)
   - `MONGODB_URI`: Your MongoDB connection string
5. Deploy or redeploy the project.

The backend is configured to use environment variables and is ready for deployment. If you encounter 404 errors, ensure `vercel.json` is committed and redeploy.
