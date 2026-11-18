import React, { useEffect, useMemo, useState } from "react";
import {
  Search, MapPin, Wind, Droplets, Thermometer, Sun, Sunrise, Sunset,
  CalendarDays, Plane, Hotel, Compass, Umbrella, ArrowUpRight, Sparkles,
  Map, CloudSun, ChevronRight, LoaderCircle, RefreshCw, Globe2, Clock3
} from "lucide-react";
import { searchCities, getWeather, getCityStory, getAttractions } from "./api";
import { weatherLabel, weatherEmoji, weatherMood, dayName, packingTips, formatDate } from "./utils";

const DEFAULT_CITY = {
  id: "pune-demo", name: "Pune", admin: "Maharashtra", country: "India",
  latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata"
};

function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [story, setStory] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [tab, setTab] = useState("today");
  const [busy, setBusy] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const [error, setError] = useState("");
  const [attractionError, setAttractionError] = useState("");
  const [unit, setUnit] = useState("C");

  useEffect(() => { loadCity(DEFAULT_CITY); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSearchBusy(true);
      try { setSuggestions(await searchCities(query.trim())); }
      catch { setSuggestions([]); }
      finally { setSearchBusy(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadCity(nextCity) {
    setCity(nextCity);
    setQuery("");
    setSuggestions([]);
    setBusy(true);
    setError("");
    setAttractionError("");
    setWeather(null);
    setStory(null);
    setAttractions([]);
    try {
      const [w, s, a] = await Promise.allSettled([
        getWeather(nextCity), getCityStory(nextCity), getAttractions(nextCity)
      ]);
      if (w.status === "fulfilled") setWeather(w.value);
      else throw w.reason;
      if (s.status === "fulfilled") setStory(s.value);
      if (a.status === "fulfilled") setAttractions(a.value);
      else setAttractionError("We couldn't load nearby attractions. Please try refreshing.");
    } catch (e) {
      setError(e.message || "Something went wrong while loading this city.");
    } finally { setBusy(false); }
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const mood = current ? weatherMood(current.weather_code) : "cloud";
  const temp = (value) => unit === "C" ? Math.round(value) : Math.round(value * 9 / 5 + 32);
  const nextSeven = useMemo(() => daily ? daily.time.slice(0, 7).map((date, i) => ({ date, i })) : [], [daily]);
  const rainDays = useMemo(() => daily ? daily.time.slice(0, 16).filter((_, i) => (daily.precipitation_probability_max?.[i] || 0) >= 40).length : 0, [daily]);
  const avgMax = useMemo(() => daily?.temperature_2m_max?.length ? Math.round(daily.temperature_2m_max.slice(0, 16).reduce((a,b)=>a+b,0) / Math.min(16,daily.temperature_2m_max.length)) : null, [daily]);
  const avgMin = useMemo(() => daily?.temperature_2m_min?.length ? Math.round(daily.temperature_2m_min.slice(0, 16).reduce((a,b)=>a+b,0) / Math.min(16,daily.temperature_2m_min.length)) : null, [daily]);

  const flightsUrl = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${city.name}`)}`;
  const skyscannerUrl = `https://www.skyscanner.co.in/transport/flights-to/${encodeURIComponent(city.name.toLowerCase().replaceAll(" ","-"))}/`;
  const hotelsUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city.name + ", " + city.country)}`;
  const placesUrl = `https://www.google.com/maps/search/tourist+attractions+in+${encodeURIComponent(city.name)}`;

  const backdrop = story?.landmark?.image || story?.cityInfo?.image;
  const isRainy = mood === "rain";
  const heroStyle = backdrop ? { backgroundImage: `linear-gradient(90deg, rgba(8,17,31,.88) 0%, rgba(8,17,31,.63) 55%, rgba(8,17,31,.30) 100%), url("${backdrop}")` } : {};

  return (
    <main className={`app mood-${mood}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#" onClick={(e)=>e.preventDefault()}>
          <span className="brand-mark"><CloudSun size={22}/></span>
          <span>Wander<span>Weather</span></span>
        </a>
        <div className="top-note"><Globe2 size={15}/> Weather meets travel</div>
        <button className="unit-toggle" onClick={()=>setUnit(unit==="C"?"F":"C")} aria-label="Change temperature unit">
          °{unit} <span className="toggle-dot"/>
        </button>
      </header>

      <section className="search-section">
        <div className="eyebrow"><Sparkles size={14}/> YOUR WORLD, WEATHER-READY</div>
        <h1>Where to <em>next?</em></h1>
        <p className="intro">Discover the forecast, find your next favourite place, and pack smart.</p>
        <div className="search-wrap">
          <Search size={20}/>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && suggestions[0] && loadCity(suggestions[0])} placeholder="Search any city in the world…" aria-label="Search city"/>
          {searchBusy && <LoaderCircle className="spin" size={18}/>}
          {suggestions.length>0 && <div className="suggestions">{suggestions.map((s)=><button key={s.id} onClick={()=>loadCity(s)}><MapPin size={16}/><span><b>{s.name}</b><small>{[s.admin,s.country].filter(Boolean).join(", ")}</small></span><ChevronRight size={16}/></button>)}</div>}
        </div>
        <div className="popular-cities"><span>TRY</span>{["Tokyo","Paris","London","Dubai","Singapore"].map((name)=><button key={name} onClick={()=>{setQuery(name); searchCities(name).then(r=>r[0]&&loadCity(r[0]));}}>{name}</button>)}</div>
      </section>

      {error && <div className="error-banner">{error} <button onClick={()=>loadCity(city)}><RefreshCw size={14}/> Retry</button></div>}
      {busy && <div className="loading"><LoaderCircle className="spin" size={30}/><span>Gathering the latest for {city.name}…</span></div>}

      {weather && current && daily && <>
        <section className={`hero-card ${isRainy ? "rain-hero" : ""}`} style={heroStyle}>
          <div className="hero-shade"/>
          {isRainy && <div className="rain-lines" aria-hidden="true"/>}
          <div className="hero-content">
            <div className="location-line"><MapPin size={16}/>{city.name}, {city.country}<span className="live-pill"><i/> LIVE WEATHER</span></div>
            <div className="hero-main">
              <div>
                <div className="current-temp">{temp(current.temperature_2m)}°<small>{unit}</small></div>
                <div className="condition">{weatherLabel(current.weather_code)}</div>
                <div className="feels">Feels like {temp(current.apparent_temperature)}° · H: {temp(daily.temperature_2m_max[0])}° L: {temp(daily.temperature_2m_min[0])}°</div>
              </div>
              <div className="weather-symbol">{weatherEmoji(current.weather_code, current.is_day)}</div>
            </div>
            <div className="hero-bottom">
              <div><Droplets/><span><b>{current.relative_humidity_2m}%</b><small>Humidity</small></span></div>
              <div><Wind/><span><b>{Math.round(current.wind_speed_10m)} km/h</b><small>Wind</small></span></div>
              <div><Sunrise/><span><b>{daily.sunrise[0]?.slice(11,16)}</b><small>Sunrise</small></span></div>
              <div><Sunset/><span><b>{daily.sunset[0]?.slice(11,16)}</b><small>Sunset</small></span></div>
            </div>
          </div>
          <div className="hero-caption">
            <span>{story?.landmark?.title || `Discover ${city.name}`}</span>
            {story?.landmark?.url && <a href={story.landmark.url} target="_blank" rel="noreferrer">Explore city story <ArrowUpRight size={13}/></a>}
          </div>
          <div className="hero-date"><Clock3 size={14}/>{new Intl.DateTimeFormat("en",{weekday:"long",day:"numeric",month:"long"}).format(new Date())}</div>
        </section>

        <nav className="tabs">
          {[["today","Today"],["weekly","7-day forecast"],["monthly","Monthly outlook"]].map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}
        </nav>

        {tab==="today" && <section className="content-grid">
          <div className="main-column">
            <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Today's forecast</h2></div><span className="muted">Updated live</span></div>
            <div className="hourly-strip">
              {weather.hourly.time.map((time,i)=>({time,i})).filter(({time})=>time.slice(0,10)===daily.time[0] && Number(time.slice(11,13))%3===0).slice(0,8).map(({time,i})=><div className="hour-item" key={time}><small>{time.slice(11,16)}</small><span>{weatherEmoji(weather.hourly.weather_code[i],1)}</span><b>{temp(weather.hourly.temperature_2m[i])}°</b><i>{weather.hourly.precipitation_probability[i]}%</i></div>)}
            </div>
            <div className="section-heading attractions-heading"><div><span className="eyebrow">GO BEYOND THE FORECAST</span><h2>Places worth discovering</h2></div><a href={placesUrl} target="_blank" rel="noreferrer">View map <ArrowUpRight size={14}/></a></div>
            {attractionError && <p className="muted">{attractionError}</p>}
            <div className="attraction-grid">
              {attractions.slice(0,6).map((a,i)=><a className="attraction-card" href={a.url} target="_blank" rel="noreferrer" key={a.id}>
                <div className={`attraction-art art-${i%4}`}><Compass size={25}/><span>{String(i+1).padStart(2,"0")}</span></div>
                <div><b>{a.name}</b><small>{a.category}</small></div><ArrowUpRight size={15}/>
              </a>)}
              {attractions.length===0 && <div className="empty-card">Exploring local highlights… If no places appear, try the city map link above.</div>}
            </div>
          </div>
          <aside className="side-column">
            <div className="panel packing-panel">
              <div className="panel-title"><div className="panel-icon"><Umbrella size={18}/></div><div><span className="eyebrow">TRAVEL SMART</span><h3>What to pack</h3></div></div>
              <p className="panel-sub">A few essentials based on today's conditions.</p>
              {packingTips(current,daily).map(([title,desc,emoji])=><div className="tip-row" key={title}><span>{emoji}</span><div><b>{title}</b><small>{desc}</small></div></div>)}
            </div>
            <div className="panel quick-panel">
              <span className="eyebrow">PLAN YOUR STAY</span><h3>Make the trip happen</h3>
              <p>Compare options for your dates. Prices and availability are shown by the booking providers.</p>
              <a href={flightsUrl} target="_blank" rel="noreferrer" className="travel-link"><span className="travel-icon"><Plane size={17}/></span><span><b>Compare flights</b><small>Google Flights</small></span><ArrowUpRight size={16}/></a>
              <a href={skyscannerUrl} target="_blank" rel="noreferrer" className="travel-link"><span className="travel-icon"><Plane size={17}/></span><span><b>Explore flight deals</b><small>Skyscanner</small></span><ArrowUpRight size={16}/></a>
              <a href={hotelsUrl} target="_blank" rel="noreferrer" className="travel-link"><span className="travel-icon"><Hotel size={17}/></span><span><b>Find a hotel</b><small>Booking.com</small></span><ArrowUpRight size={16}/></a>
            </div>
          </aside>
        </section>}

        {tab==="weekly" && <section className="forecast-section">
          <div className="section-heading"><div><span className="eyebrow">PLAN THE WEEK</span><h2>Next 7 days in {city.name}</h2></div><span className="muted">Local forecast</span></div>
          <div className="weekly-list">{nextSeven.map(({date,i})=><div className="weekly-row" key={date}>
            <div className="week-day"><b>{i===0?"Today":dayName(date,{weekday:"long"})}</b><small>{formatDate(date,{day:"numeric",month:"short"})}</small></div>
            <span className="week-icon">{weatherEmoji(daily.weather_code[i])}</span>
            <div className="week-condition">{weatherLabel(daily.weather_code[i])}<small><Droplets size={12}/> {daily.precipitation_probability_max[i] ?? 0}% rain chance</small></div>
            <div className="week-range"><b>{temp(daily.temperature_2m_max[i])}°</b><span>{temp(daily.temperature_2m_min[i])}°</span></div>
            <div className="week-rain"><div><span style={{width:`${daily.precipitation_probability_max[i] ?? 0}%`}}/></div></div>
          </div>)}</div>
          <div className="weekly-note"><Sparkles size={17}/><span>Pack for the wettest day: {rainDays>0 ? `${rainDays} of the next 16 days show a meaningful chance of rain.` : "No significant rain signal in the available outlook."}</span></div>
        </section>}

        {tab==="monthly" && <section className="monthly-section">
          <div className="section-heading"><div><span className="eyebrow">THINK AHEAD</span><h2>Your monthly travel outlook</h2></div><span className="muted">{new Intl.DateTimeFormat("en",{month:"long",year:"numeric"}).format(new Date())}</span></div>
          <div className="monthly-cards">
            <div className="month-card"><span className="month-icon">🌡️</span><small>Average daytime high*</small><strong>{avgMax!==null?`${temp(avgMax)}°${unit}`:"—"}</strong><p>Based on the available forecast window.</p></div>
            <div className="month-card"><span className="month-icon">🌙</span><small>Average overnight low*</small><strong>{avgMin!==null?`${temp(avgMin)}°${unit}`:"—"}</strong><p>Use layers to stay comfortable.</p></div>
            <div className="month-card"><span className="month-icon">🌧️</span><small>Rain-watch days*</small><strong>{rainDays}</strong><p>Days with 40% or higher rain probability.</p></div>
          </div>
          <div className="monthly-advice"><div className="advice-symbol">{weatherEmoji(current.weather_code)}</div><div><span className="eyebrow">TRAVEL PLANNER NOTE</span><h3>{isRainy?"Keep flexible plans and a rain-ready layer.":"Build your itinerary around the local conditions."}</h3><p>{isRainy?"Consider museums, galleries and indoor experiences as alternatives to outdoor sightseeing. Keep an umbrella and waterproof shoes handy.":"Check the 7-day forecast closer to departure, and plan outdoor attractions for the clearest days. Booking flexible stays can help if plans change."}</p></div></div>
          <p className="disclaimer">*Monthly outlook is a planning snapshot calculated from the available 16-day forecast, not a guaranteed 30-day forecast. Weather beyond the provider's forecast horizon can change.</p>
          <div className="month-cta"><div><b>Planning a trip to {city.name}?</b><small>Compare transport and accommodation before you go.</small></div><a href={hotelsUrl} target="_blank" rel="noreferrer">Explore stays <ArrowUpRight size={15}/></a></div>
        </section>}

        <footer className="footer"><div className="brand mini"><span className="brand-mark"><CloudSun size={17}/></span>Wander<span>Weather</span></div><span>Weather data by Open-Meteo · Attractions via OpenStreetMap · City imagery via Wikimedia</span><span>Made for curious travellers ✦</span></footer>
      </>}
    </main>
  );
}

export default App;
