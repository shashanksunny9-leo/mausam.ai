const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";
const WIKI = "https://en.wikipedia.org/w/api.php";
const OVERPASS = "https://overpass-api.de/api/interpreter";

export async function searchCities(query) {
  const url = `${GEO}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City search is temporarily unavailable.");
  const data = await res.json();
  return (data.results || []).map((x) => ({
    id: `${x.id}-${x.latitude}-${x.longitude}`,
    name: x.name,
    admin: x.admin1 || x.admin2 || "",
    country: x.country || "",
    latitude: x.latitude,
    longitude: x.longitude,
    timezone: x.timezone || "auto"
  }));
}

export async function getWeather(city) {
  const params = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone || "auto",
    forecast_days: "16",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh"
  });
  const res = await fetch(`${FORECAST}?${params}`);
  if (!res.ok) throw new Error("Weather data could not be loaded.");
  return res.json();
}

async function wikiSearch(query) {
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: query, gsrlimit: "1",
    prop: "pageimages|extracts|info", exintro: "1", explaintext: "1",
    piprop: "original|thumbnail", pithumbsize: "1400", inprop: "url",
    format: "json", origin: "*"
  });
  const res = await fetch(`${WIKI}?${params}`);
  if (!res.ok) throw new Error("Wikipedia lookup failed");
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  if (!page) return null;
  return {
    title: page.title,
    extract: page.extract || "",
    image: page.original?.source || page.thumbnail?.source || "",
    url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
  };
}

export async function getCityStory(city) {
  const candidates = [
    `${city.name} ${city.country}`,
    `${city.name} landmark`,
    `${city.name} tourist attractions`
  ];
  let cityInfo = null;
  let landmark = null;
  try { cityInfo = await wikiSearch(candidates[0]); } catch {}
  try { landmark = await wikiSearch(candidates[1]); } catch {}
  if (!landmark || !landmark.image) landmark = cityInfo;
  return { cityInfo, landmark };
}

export async function getAttractions(city) {
  const query = `[out:json][timeout:20];
    (
      node(around:7000,${city.latitude},${city.longitude})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];
      way(around:7000,${city.latitude},${city.longitude})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];
      relation(around:7000,${city.latitude},${city.longitude})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];
    );
    out center tags 35;`;
  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: `data=${encodeURIComponent(query)}`
  });
  if (!res.ok) throw new Error("Attractions are unavailable right now.");
  const data = await res.json();
  const seen = new Set();
  return (data.elements || []).map((el) => {
    const t = el.tags || {};
    const name = t.name || t["name:en"];
    if (!name || seen.has(name)) return null;
    seen.add(name);
    return {
      id: `${el.type}-${el.id}`,
      name,
      category: (t.tourism || t.amenity || "place").replaceAll("_", " "),
      description: t.description || t.wikipedia || "",
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
      url: t.website || (t.wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(t.wikipedia.split(":").pop())}` : `https://www.google.com/search?q=${encodeURIComponent(name + " " + city.name)}`)
    };
  }).filter(Boolean).slice(0, 12);
}
