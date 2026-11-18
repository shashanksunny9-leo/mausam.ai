# mausum.ai — Global Weather & Travel

A responsive weather-and-travel web app. Search cities worldwide to see current conditions, daily and weekly forecasts, a monthly planning overview, weather-based packing tips, tourist attractions, a city landmark backdrop, and links to compare flights and hotels.

## Stack
- React + Vite
- Open-Meteo Geocoding and Forecast APIs (no API key)
- OpenStreetMap Overpass API for nearby attractions
- Wikipedia API for city/landmark descriptions and images
- Lucide React icons

## Run locally
1. Install Node.js 18+.
2. Extract this ZIP and open the project folder in a terminal.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL printed by Vite (usually http://localhost:5173).

## Deploy with GitHub + Vercel
1. Create a new GitHub repository.
2. Upload/commit all files from this folder.
3. In Vercel, choose **Add New → Project**, import the GitHub repository.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
5. Deploy. No environment variables are required.

## Data and limitations
- Weather is fetched from Open-Meteo. Its standard forecast endpoint provides up to 16 days, so the app's **Weekly** view shows the next 7 days. The **Monthly** tab is a travel-planning overview based on the available forecast plus seasonal packing guidance; it is not a precise 30-day daily forecast.
- Flight and hotel cards open comparison/search pages (Google Flights, Skyscanner and Booking.com). They are search links, not live fare/hotel inventory or guaranteed cheapest offers. Add a commercial travel API/affiliate provider later for live prices and availability.
- Attractions are fetched from OpenStreetMap's Overpass service. Results depend on community map coverage and API availability.
- City/landmark imagery and descriptions use Wikipedia/Wikimedia. Images are attributed where an image credit is available.
- Public APIs can occasionally rate-limit or be unavailable. The app displays fallback messages in that case.

## Suggested next improvements
- Add a backend/cache layer to protect public APIs from rate limits.
- Integrate a flight/hotel provider (e.g. Amadeus or a licensed affiliate API) for live prices.
- Add saved cities, unit preferences, route planning and user accounts.
