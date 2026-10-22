# Mochi: Maths & CS Study Buddy (standalone)

## Deploy in about 10 minutes (free hosting on Vercel)
1. Get an API key at https://console.anthropic.com and set a monthly spend limit there.
2. Install Node.js (https://nodejs.org), then in this folder run:
       npm i -g vercel
       vercel            (log in, accept the defaults; "public" is served automatically)
       vercel env add ANTHROPIC_API_KEY      (paste your key, choose Production)
       vercel --prod
3. Vercel prints your live URL. Send it to your friends.

Alternative: push this folder to GitHub, import it at vercel.com, and add ANTHROPIC_API_KEY under Settings > Environment Variables.

## Settings (optional environment variables)
- DAILY_LIMIT: requests per visitor per day (default 40). Each lesson, follow-up or quiz is one request.
- MODEL: defaults to claude-sonnet-4-6.

## Notes
- The limit is best-effort (kept in memory), so also keep a spend cap on your API account.
- Never put your API key inside index.html.
- Custom domain: add it in the Vercel project's Domains tab.
