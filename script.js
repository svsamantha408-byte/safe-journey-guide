// ===== MAP =====
const map = L.map('map').setView([20.5937, 78.9629], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
  maxZoom: 19
}).addTo(map);

let currentLayers = [];
let markers = [];

// Geocode using Nominatim (free, no key)
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await r.json();
  if (!data.length) throw new Error(`Couldn't find "${query}"`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
}

// Fetch routes from OSRM public server (returns alternatives)
async function getRoutes(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?alternatives=true&overview=full&geometries=geojson&steps=false`;
  const r = await fetch(url);
  const data = await r.json();
  if (!data.routes || !data.routes.length) throw new Error('No routes found');
  return data.routes;
}

// Heuristic risk scoring: longer + slower routes scored worse; first route = safest baseline
function classifyRoutes(routes) {
  const sorted = [...routes].sort((a, b) => a.duration - b.duration);
  const classes = ['safe', 'moderate', 'risky'];
  const labels = ['Safe Route', 'Moderate Route', 'Risky Route'];
  return sorted.slice(0, 3).map((r, i) => ({
    route: r,
    class: classes[i] || 'risky',
    label: labels[i] || 'Alternate',
    reason: [
      'Highways, low congestion, well-lit',
      'Mixed roads, moderate traffic',
      'Narrow roads, sharp turns or congestion'
    ][i] || 'Less optimal path'
  }));
}

const colorFor = { safe: '#16a34a', moderate: '#f59e0b', risky: '#dc2626' };

function clearMap() {
  currentLayers.forEach(l => map.removeLayer(l));
  markers.forEach(m => map.removeLayer(m));
  currentLayers = []; markers = [];
}

function drawRoutes(classified, from, to) {
  clearMap();
  classified.forEach(c => {
    const layer = L.geoJSON(c.route.geometry, {
      style: { color: colorFor[c.class], weight: 6, opacity: 0.75 }
    }).addTo(map);
    currentLayers.push(layer);
  });
  const a = L.marker([from.lat, from.lon]).addTo(map).bindPopup('Start');
  const b = L.marker([to.lat, to.lon]).addTo(map).bindPopup('Destination');
  markers.push(a, b);
  const group = L.featureGroup(currentLayers);
  map.fitBounds(group.getBounds().pad(0.1));
}

function renderResults(classified) {
  const box = document.getElementById('routeResults');
  box.innerHTML = classified.map(c => `
    <div class="route-pill ${c.class}">
      <div>
        <div class="label">${c.label}</div>
        <div class="meta">${c.reason}</div>
      </div>
      <div style="text-align:right">
        <div class="label">${(c.route.distance/1000).toFixed(1)} km</div>
        <div class="meta">${Math.round(c.route.duration/60)} min</div>
      </div>
    </div>
  `).join('');
}

// ===== WEATHER (Open-Meteo, free, no key) =====
async function fetchWeather(lat, lon, placeName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`;
  const r = await fetch(url);
  const data = await r.json();
  const c = data.current;
  const codeInfo = weatherCodeMap(c.weather_code);
  const card = document.getElementById('weatherCard');
  const risky = c.precipitation > 0.5 || c.wind_speed_10m > 40 || [95,96,99,75,82].includes(c.weather_code);
  card.innerHTML = `
    <div class="weather-data">
      <div class="weather-icon">${codeInfo.icon}</div>
      <div class="weather-info">
        <h3>${placeName.split(',')[0]}</h3>
        <div class="temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="desc">${codeInfo.text} · Humidity ${c.relative_humidity_2m}% · Wind ${c.wind_speed_10m} km/h</div>
        ${risky ? `<div class="weather-warning">⚠️ Hazardous driving conditions — drive with extra caution.</div>` : ''}
      </div>
    </div>`;
}

function weatherCodeMap(code) {
  const m = {
    0:{icon:'☀️',text:'Clear sky'},1:{icon:'🌤️',text:'Mainly clear'},2:{icon:'⛅',text:'Partly cloudy'},3:{icon:'☁️',text:'Overcast'},
    45:{icon:'🌫️',text:'Fog'},48:{icon:'🌫️',text:'Rime fog'},
    51:{icon:'🌦️',text:'Light drizzle'},53:{icon:'🌦️',text:'Drizzle'},55:{icon:'🌧️',text:'Heavy drizzle'},
    61:{icon:'🌧️',text:'Light rain'},63:{icon:'🌧️',text:'Rain'},65:{icon:'🌧️',text:'Heavy rain'},
    71:{icon:'🌨️',text:'Light snow'},73:{icon:'🌨️',text:'Snow'},75:{icon:'❄️',text:'Heavy snow'},
    80:{icon:'🌦️',text:'Rain showers'},81:{icon:'🌧️',text:'Showers'},82:{icon:'⛈️',text:'Violent showers'},
    95:{icon:'⛈️',text:'Thunderstorm'},96:{icon:'⛈️',text:'Thunderstorm w/ hail'},99:{icon:'⛈️',text:'Severe storm'}
  };
  return m[code] || {icon:'🌥️',text:'Unknown'};
}

// ===== PLAN BUTTON =====
document.getElementById('planBtn').addEventListener('click', async () => {
  const fromQ = document.getElementById('fromInput').value.trim();
  const toQ = document.getElementById('toInput').value.trim();
  const box = document.getElementById('routeResults');
  if (!fromQ || !toQ) { box.innerHTML = '<div style="color:#dc2626">Please enter both locations.</div>'; return; }
  box.innerHTML = '<div style="color:#5b6b85">🔍 Finding safest routes…</div>';
  try {
    const [from, to] = await Promise.all([geocode(fromQ), geocode(toQ)]);
    const routes = await getRoutes(from, to);
    const classified = classifyRoutes(routes);
    drawRoutes(classified, from, to);
    renderResults(classified);
    fetchWeather(to.lat, to.lon, to.name);
    document.getElementById('weather').scrollIntoView({behavior:'smooth',block:'nearest'});
  } catch (e) {
    box.innerHTML = `<div style="color:#dc2626">${e.message}</div>`;
  }
});

// ===== CHATBOT =====
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatToggle.addEventListener('click', () => {
  chatPanel.hidden = false;
  if (!chatMessages.children.length) {
    addMsg("Hi! I'm Officer Riley 👮. Ask me about road safety, weather risks, or how to plan a safer trip!", 'bot');
  }
});
chatClose.addEventListener('click', () => chatPanel.hidden = true);

function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

const knowledge = [
  { keys:['hello','hi','hey'], a:"Hello there! 👋 Ready to plan a safer drive? Try the Route Planner above." },
  { keys:['seatbelt','belt'], a:"Always buckle up — seatbelts cut fatal injury risk by 45%. Every seat, every trip." },
  { keys:['rain','wet','storm'], a:"In rain, reduce speed by 30%, keep low beams on, and double your following distance." },
  { keys:['fog','foggy'], a:"In fog: use low beams (not high), follow lane markings, slow down, and avoid sudden braking." },
  { keys:['snow','ice','icy'], a:"On snow/ice: accelerate and brake gently, use winter tyres, and increase distance from the car ahead." },
  { keys:['speed','fast','limit'], a:"Stick to posted speed limits. Every 1% increase in speed raises crash risk by ~2%." },
  { keys:['drunk','alcohol','drink'], a:"Never drink and drive. Even small amounts impair judgment — use a cab or designated driver." },
  { keys:['phone','text','texting','mobile'], a:"Phones quadruple your crash risk. Use hands-free or pull over to text." },
  { keys:['tired','sleep','drowsy','fatigue'], a:"Drowsy driving = drunk driving. Rest every 2 hours; never push through fatigue." },
  { keys:['route','safe route','plan'], a:"Use the Route Planner above — green = safest, yellow = moderate, red = risky." },
  { keys:['weather','climate','forecast'], a:"After planning a route, scroll to Destination Weather to see conditions before you go." },
  { keys:['helmet','bike','motorcycle','two-wheeler'], a:"Helmets cut fatal head-injury risk by 42%. Always wear an ISI-certified full-face helmet." },
  { keys:['child','kid','baby'], a:"Children under 12 belong in the back seat with an age-appropriate restraint." },
  { keys:['night','dark'], a:"At night: clean your windshield, dim dashboard lights, and watch for pedestrians at crossings." },
  { keys:['accident','crash','emergency'], a:"In an emergency: switch on hazards, call 112 (India) or local emergency number, do not move the injured unless in danger." },
  { keys:['thanks','thank you'], a:"You're welcome! Drive safe out there 🚗💨" },
];

function botReply(text) {
  const t = text.toLowerCase();
  for (const k of knowledge) {
    if (k.keys.some(key => t.includes(key))) return k.a;
  }
  return "Great question! I can help with topics like seatbelts, weather driving, speed limits, fatigue, phones, and route planning. What would you like to know?";
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addMsg(text, 'user');
  chatInput.value = '';
  setTimeout(() => addMsg(botReply(text), 'bot'), 400);
});
