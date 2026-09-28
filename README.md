<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1z0k0sVGh2iloU_Kpwtwcfa7A7o8vqvTc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Atomic Scheme IDs

Before deploying the updated app, run [`supabase/atomic_scheme_ids.sql`](supabase/atomic_scheme_ids.sql) in the Supabase SQL Editor. The KHSS and DSS create functions allocate the next ID and insert the row in one database transaction, preventing two devices from receiving the same new ID.

The existing KHSS table currently contains duplicate IDs. This change does not modify those existing records; new KHSS IDs continue from `GSM-KHSS-005`, and new DSS IDs continue from `GSM-DSS-003` based on the current data.
