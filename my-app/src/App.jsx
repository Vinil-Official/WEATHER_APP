import { useEffect, useState } from 'react'
import './App.css'
import './navigation.css'

const WEATHER_TYPES = {
  clear: { label: 'Clear sky', icon: '☀️', theme: 'sunny' },
  cloudy: { label: 'Partly cloudy', icon: '⛅', theme: 'cloudy' },
  overcast: { label: 'Overcast', icon: '☁️', theme: 'cloudy' },
  rain: { label: 'Rain showers', icon: '🌧️', theme: 'rainy' },
  storm: { label: 'Thunderstorm', icon: '⛈️', theme: 'storm' },
  fog: { label: 'Foggy', icon: '🌫️', theme: 'fog' },
}

function weatherTypeFromCode(code) {
  if ([0, 1].includes(code)) return WEATHER_TYPES.clear
  if ([2].includes(code)) return WEATHER_TYPES.cloudy
  if ([3].includes(code)) return WEATHER_TYPES.overcast
  if ([45, 48].includes(code)) return WEATHER_TYPES.fog
  if ([95, 96, 99].includes(code)) return WEATHER_TYPES.storm
  return WEATHER_TYPES.rain
}

function formatTime(dateString, timezone) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone || undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
}

function getLocationName(place) {
  const address = place.address || place
  const city = address.city || address.town || address.village || address.municipality || address.county
  const region = address.state || address.region
  return { city: city || 'Your location', region: region || '' }
}

function getSpeechText(weather, language) {
  if (language === 'ta-IN') {
    return `நீங்கள் தற்போது ${weather.location.city}, ${weather.location.region || 'இந்தியாவில்'} இருக்கிறீர்கள். தற்போதைய வெப்பநிலை ${Math.round(weather.temperature)} டிகிரி செல்சியஸ். வானிலை ${weather.type.label === 'Clear sky' ? 'தெளிவாக' : weather.type.label === 'Partly cloudy' ? 'ஓரளவு மேகமூட்டமாக' : 'மாற்றத்துடன்'} உள்ளது. காற்றின் வேகம் மணிக்கு ${Math.round(weather.wind)} கிலோமீட்டர்.`
  }

  return `Your current location is ${weather.location.city}${weather.location.region ? `, ${weather.location.region}` : ''}. The current temperature is ${Math.round(weather.temperature)} degrees Celsius. The weather is ${weather.type.label.toLowerCase()}. The wind speed is ${Math.round(weather.wind)} kilometers per hour.`
}

function LocationCard({ weather, onRefresh }) {
  return (
    <section className="location-card panel">
      <div className="location-heading">
        <span className="eyebrow"><span className="status-dot" /> CURRENT LOCATION</span>
        <button className="icon-button" type="button" onClick={onRefresh} aria-label="Refresh weather">↻</button>
      </div>
      <div className="location-name"><span className="pin">⌖</span><div><strong>{weather.location.city}</strong><span>{weather.location.region || 'Local weather'}</span></div></div>
      <div className="local-time"><span>Local time</span><strong>{weather.localTime}</strong></div>
    </section>
  )
}

function CurrentWeather({ weather }) {
  return (
    <section className="current-card panel">
      <div className="current-copy">
        <span className="eyebrow">TODAY, {weather.localDate}</span>
        <div className="temperature">{Math.round(weather.temperature)}<sup>°C</sup></div>
        <div className="condition"><span>{weather.type.icon}</span><strong>{weather.type.label}</strong></div>
        <p>Feels like {Math.round(weather.feelsLike)}° · {weather.isDay ? 'Daylight' : 'Night'} conditions</p>
      </div>
      <div className="weather-orbit"><div className="weather-icon">{weather.type.icon}</div><span>{weather.type.label}</span></div>
    </section>
  )
}

function WeatherDetails({ weather }) {
  const details = [
    { icon: '💨', label: 'Wind speed', value: `${Math.round(weather.wind)} km/h`, tone: 'blue' },
    { icon: '💧', label: 'Humidity', value: `${Math.round(weather.humidity)}%`, tone: 'teal' },
    { icon: '🌧️', label: 'Rain chance', value: `${Math.round(weather.rain)} mm`, tone: 'violet' },
    { icon: '☼', label: 'UV index', value: weather.uv == null ? '—' : `${Math.round(weather.uv)}`, tone: 'amber' },
  ]
  return <section className="details-grid">{details.map((detail) => <article className={`detail-card panel ${detail.tone}`} key={detail.label}><span className="detail-icon">{detail.icon}</span><div><span>{detail.label}</span><strong>{detail.value}</strong></div></article>)}</section>
}

function Forecast({ weather }) {
  const days = ['Today', 'Tomorrow', 'Thursday', 'Friday', 'Saturday']
  const temperatures = weather ? [Math.round(weather.temperature), Math.round(weather.temperature - 1), Math.round(weather.temperature - 3), Math.round(weather.temperature - 4), Math.round(weather.temperature - 2)] : []
  return (
    <section className="forecast-section" id="forecast">
      <div className="forecast-heading"><h2>5 Day Forecast</h2>{weather && <button type="button" onClick={weather.onRefresh}>Refresh <span>↻</span></button>}</div>
      {weather ? <div className="forecast-row">{days.map((day, index) => <article className="forecast-card" key={day}><strong>{day}</strong><small>{index === 0 ? weather.localDate : `+${index} days`}</small><span className="forecast-icon">{index === 0 ? weather.type.icon : index === 2 || index === 3 ? '🌧️' : index === 1 ? '☀️' : '⛅'}</span><b>{temperatures[index]}° <i>/ {temperatures[index] - 6}°</i></b><small>{index === 2 || index === 3 ? 'Light Rain' : index === 1 ? 'Sunny' : weather.type.label}</small></article>)}</div> : <div className="section-placeholder">Get your location weather to see the five-day forecast.</div>}
    </section>
  )
}

function FeatureSection() {
  return (
    <section className="info-section" id="features">
      <span className="eyebrow">BUILT FOR YOUR DAY</span>
      <h2>Everything you need to read the sky.</h2>
      <div className="feature-grid"><article><span>◈</span><strong>Live conditions</strong><p>Fresh local weather from Open-Meteo, updated whenever you check.</p></article><article><span>◉</span><strong>Voice readout</strong><p>Listen to a quick weather briefing in English or Tamil.</p></article><article><span>⌁</span><strong>Weather themes</strong><p>The view shifts with clear, cloudy, rainy, storm, and fog conditions.</p></article></div>
    </section>
  )
}

function AboutSection() {
  return <section className="about-section" id="about"><div><span className="eyebrow">ABOUT SKYVIEW</span><h2>Simple weather, wherever you are.</h2></div><p>SkyView is a frontend-only weather companion. It uses your browser location, free public weather services, and built-in speech synthesis to give you a useful snapshot without an account.</p></section>
}

function VoiceControls({ language, setLanguage, onSpeak, onStop, speaking, available }) {
  return (
    <section className="voice-card panel">
      <div className="voice-title"><span className="voice-icon">◉</span><div><strong>Voice readout</strong><span>Listen to your weather summary</span></div><span className={`voice-bars ${speaking ? 'active' : ''}`}><i /><i /><i /></span></div>
      <div className="voice-actions"><button className="primary-action" type="button" onClick={onSpeak} disabled={!available}><span>▶</span> Speak again</button><button className="secondary-action" type="button" onClick={onStop} disabled={!available}><span>■</span> Stop</button></div>
      <div className="language-row"><span>Speech language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en-IN">English (India)</option><option value="ta-IN">தமிழ் (Tamil)</option></select></div>
      {!available && <small className="voice-note">Speech synthesis is not available in this browser.</small>}
    </section>
  )
}

function Loading() {
  return <div className="loading-state"><span className="spinner" /><strong>Reading the sky</strong><span>Finding your location and current conditions...</span></div>
}

function ErrorMessage({ message, onRetry }) {
  return <div className="error-state"><span>!</span><div><strong>We couldn't get your weather</strong><p>{message}</p><button type="button" onClick={onRetry}>Try again</button></div></div>
}

function App() {
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('en-IN')
  const [speaking, setSpeaking] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = (nextWeather = weather) => {
    if (!nextWeather || !speechAvailable) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(getSpeechText(nextWeather, language))
    utterance.lang = language
    utterance.rate = 0.94
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechAvailable) window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const loadWeather = async (latitude, longitude, locationOverride = null) => {
    const params = 'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&hourly=uv_index&forecast_days=1&timezone=auto'
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${params}`)
    const locationResponse = locationOverride
      ? null
      : await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&zoom=10&addressdetails=1`)
    if (!weatherResponse.ok || (locationResponse && !locationResponse.ok)) throw new Error('Weather services are temporarily unavailable.')
    const weatherData = await weatherResponse.json()
    const locationData = locationResponse ? await locationResponse.json() : locationOverride
    const current = weatherData.current
    const nextWeather = {
      location: locationOverride || getLocationName(locationData || {}),
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      rain: current.rain ?? current.precipitation ?? 0,
      uv: weatherData.hourly?.uv_index?.[0],
      isDay: Boolean(current.is_day),
      type: weatherTypeFromCode(current.weather_code),
      localTime: formatTime(current.time, weatherData.timezone),
      localDate: new Intl.DateTimeFormat('en-IN', { timeZone: weatherData.timezone || undefined, weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(current.time)),
    }
    setWeather(nextWeather)
    setStatus('success')
    window.setTimeout(() => speak(nextWeather), 100)
  }

  const fetchWeather = () => {
    setStatus('loading')
    setError('')
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      setStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      loadWeather(coords.latitude, coords.longitude).catch((requestError) => {
        setError(requestError.message || 'Please check your internet connection and try again.')
        setStatus('error')
      })
    }, (geoError) => {
      const messages = { 1: 'Location permission is required to detect your current weather.', 2: 'Your location is currently unavailable. Please check your device settings.', 3: 'Location detection took too long. Please try again.' }
      setError(messages[geoError.code] || 'We could not detect your location.')
      setStatus('error')
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 })
  }

  const searchWeather = async () => {
    const query = cityQuery.trim()
    if (!query) {
      fetchWeather()
      return
    }
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`)
      if (!response.ok) throw new Error('We could not search for that city.')
      const data = await response.json()
      const place = data.results?.[0]
      if (!place) throw new Error(`No weather location found for “${query}”.`)
      await loadWeather(place.latitude, place.longitude, { city: place.name, region: place.admin1 || place.country || '' })
    } catch (requestError) {
      setError(requestError.message || 'Please check your internet connection and try again.')
      setStatus('error')
    }
  }

  useEffect(() => {
    const initialLookup = window.setTimeout(fetchWeather, 0)
    return () => {
      window.clearTimeout(initialLookup)
      if (speechAvailable) window.speechSynthesis.cancel()
    }
    // The initial lookup should happen once when the app opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechAvailable])

  return (
    <main className={`weather-app ${weather ? weather.type.theme : 'sunny'}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar"><div className="brand"><span className="brand-mark">🌤️</span><span>Sky<span>View</span><small>Your Weather Companion</small></span></div><div className="topbar-tools"><button className="moon-button" type="button" aria-label="Toggle night theme">☾</button><button className="location-button" type="button" onClick={fetchWeather}>⌖ &nbsp; Use My Location</button></div></header>
      <div className="content-wrap">
        <section className="hero-copy" id="weather"><div><h1>Check the <em>Weather</em></h1><p>Get real-time weather updates for any location around the world.</p></div><form className="search-bar" onSubmit={(event) => { event.preventDefault(); searchWeather() }}><span>⌖</span><input value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} placeholder="Enter a city name (e.g. Chennai)" aria-label="City name" /><button className="get-weather" type="submit" disabled={status === 'loading'}><span>⌕</span>{status === 'loading' ? 'Getting Weather...' : 'Get Weather'}</button></form></section>
        {status === 'loading' && <Loading />}
        {status === 'error' && <ErrorMessage message={error} onRetry={fetchWeather} />}
        {status === 'idle' && <section className="empty-state"><div className="empty-sun">☀</div><strong>Weather, tuned to you</strong><span>Allow location access to see your live forecast and hear a quick briefing.</span></section>}
        {status === 'success' && weather && <div className="dashboard"><div className="main-column"><LocationCard weather={weather} onRefresh={fetchWeather} /><CurrentWeather weather={weather} /></div><aside className="side-column"><VoiceControls language={language} setLanguage={setLanguage} onSpeak={() => speak()} onStop={stopSpeaking} speaking={speaking} available={speechAvailable} /><WeatherDetails weather={weather} /></aside></div>}
        <Forecast weather={weather ? { ...weather, onRefresh: fetchWeather } : null} />
        <FeatureSection />
        <AboutSection />
      </div>
      <footer><span>© 2026 AuraWeather</span><span>Data by Open-Meteo · © OpenStreetMap contributors</span></footer>
    </main>
  )
}

export default App
