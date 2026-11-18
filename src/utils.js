export function weatherLabel(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Mostly clear";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed conditions";
}
export function weatherEmoji(code, isDay = 1) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌥️";
}
export function weatherMood(code) {
  if ([61,63,65,66,67,80,81,82,95,96,99].includes(code)) return "rain";
  if ([71,73,75,77,85,86].includes(code)) return "snow";
  if ([0,1].includes(code)) return "sun";
  return "cloud";
}
export function dayName(date, options = { weekday: "short" }) {
  return new Intl.DateTimeFormat("en", options).format(new Date(`${date}T12:00:00`));
}
export function packingTips(current, daily) {
  const code = current.weather_code;
  const temp = current.apparent_temperature;
  const tips = [];
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code) ||
      (daily?.precipitation_probability_max?.[0] ?? 0) >= 45) {
    tips.push(["Umbrella or rain jacket", "Rain is possible — keep a waterproof layer handy.", "☂️"]);
    tips.push(["Waterproof footwear", "Useful for wet pavements and unexpected showers.", "🥾"]);
  }
  if (temp >= 29) {
    tips.push(["Light, breathable clothing", "Choose cotton or moisture-wicking fabrics.", "👕"]);
    tips.push(["Sunscreen and sunglasses", "Protect yourself during the brighter hours.", "🕶️"]);
    tips.push(["Reusable water bottle", "Stay hydrated while exploring.", "💧"]);
  } else if (temp <= 12) {
    tips.push(["Warm layers", "A sweater or insulated jacket will help.", "🧥"]);
    tips.push(["Comfortable closed shoes", "Keep your feet warm while walking.", "👟"]);
  } else {
    tips.push(["Light layers", "A light jacket is useful for changing conditions.", "🧢"]);
    tips.push(["Comfortable walking shoes", "Ideal for a full day of sightseeing.", "👟"]);
  }
  if (current.wind_speed_10m >= 25) tips.push(["Windproof outer layer", "Wind speeds may make it feel cooler.", "🌬️"]);
  return tips.slice(0, 5);
}
export function formatDate(date, options = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en", options).format(new Date(`${date}T12:00:00`));
}
