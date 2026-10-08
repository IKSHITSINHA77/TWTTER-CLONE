# VoiceTwitter Clone (45-Day Capstone Project)

A feature-complete Twitter/X clone built with Next.js App Router, featuring strict IST-based time gates, audio tweet uploads, multilingual inline translation, email OTP verification, creator analytics, and curated bookmarks.

## Core Features & Business Constraints

1. **Audio Tweets & Verification:**
   - 100MB file size limit & 5-minute audio duration constraint.
   - Time-gated uploads: Strictly permitted between **2:00 PM and 7:00 PM IST**.
   - Email OTP authentication for audio posting and non-default spoken language tagging.

2. **Posting Limits & Gated Subscription Payments:**
   - Free (1 tweet), Bronze (₹100/mo, 3 tweets), Silver (₹300/mo, 5 tweets), Gold (₹1000/mo, unlimited).
   - Payment Gateway strictly open between **10:00 AM and 11:00 AM IST**.
   - Automated invoice generation and email dispatch.

3. **Multilingual Content Engine:**
   - In-feed translation supporting Hindi, Spanish, French, German, Tamil, and Bengali.
   - Per-tweet on-demand language switcher.

4. **Advanced Discovery & Analytics:**
   - Multi-filter search drawer (media type, date ranges, relevance sorting).
   - Sentiment classification (`positive`, `neutral`, `critical`) and trending topic chips.
   - Creator Analytics: 24-hour interaction heatmap, audio completion rates, and impression telemetry.

5. **Bookmarks & Curation:**
   - Custom folder categorization.
   - Markdown research digests and JSON data exports.

## Tech Stack
- **Framework:** Next.js (App Router, Server Actions, Route Handlers)
- **Styling:** Tailwind CSS, Lucide Icons, Radix UI
- **Networking:** Axios, Fetch API