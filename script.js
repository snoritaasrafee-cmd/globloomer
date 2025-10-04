// =========================
// 🌍 NASA API + Locations
// =========================
const NASA_API_KEY = "G8Gas1lsJXauEbFuavZraSr6ivd0awV9g13zGrxU";

let locations = [
  {name:"Dhaka, Bangladesh", lat:23.8103, lon:90.4125},
  {name:"Chittagong, Bangladesh", lat:22.3569, lon:91.7832},
  {name:"New York, USA", lat:40.7128, lon:-74.0060},
  {name:"Paris, France", lat:48.8566, lon:2.3522},
  {name:"Sydney, Australia", lat:-33.8688, lon:151.2093}
];

// =========================
// 🌏 Initialize Map
// =========================
const map = L.map('map').setView([23.8103, 90.4125], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// =========================
// 🇧🇩 Highlight Bangladesh
// =========================
const bangladeshPolygon = [
  [26.446525, 88.084422],
  [26.652409, 92.672721],
  [20.708314, 92.672721],
  [20.708314, 88.084422]
];
L.polygon(bangladeshPolygon, {color:'green', fillOpacity:0.1}).addTo(map).bindPopup("Bangladesh");

// =========================
// 🌱 Add markers + heatmap points
// =========================
let heatPoints = [];
locations.forEach(async loc => {
  const bloomData = simulateBloomPrediction();
  const ndvi = await fetchNDVI(loc.lat, loc.lon);

  const marker = L.circleMarker([loc.lat, loc.lon], {
    radius: 12,
    fillColor: getColorByProbability(bloomData.prob),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(map);

  marker.bindPopup(`<b>${loc.name}</b><br>NDVI: ${ndvi}<br>${bloomData.probText}`);
  heatPoints.push([loc.lat, loc.lon, bloomData.prob/100]);
});

// =========================
// 🔥 Heatmap Layer
// =========================
const heat = L.heatLayer(heatPoints, {
  radius: 25,
  blur: 20,
  gradient: {0.4:'blue',0.6:'lime',0.8:'orange',1:'red'}
}).addTo(map);

// =========================
// 🛰 Fetch NDVI with fallback
// =========================
async function fetchNDVI(lat, lon){
  try{
    const url = `https://api.nasa.gov/planetary/earth/assets?lat=${lat}&lon=${lon}&api_key=${NASA_API_KEY}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("NASA API Error");
    const data = await res.json();
    return data.date || (Math.random().toFixed(2));
  }catch(err){
    console.warn("NDVI fetch failed, using simulated value", err);
    return Math.random().toFixed(2);
  }
}

// =========================
// 🌸 Bloom Prediction Simulation
// =========================
function simulateBloomPrediction(){
  const prob = Math.floor(Math.random()*100);
  const date = new Date(); date.setDate(date.getDate()+7);
  return {prob, probText:`Bloom Probability: ${prob}% | Predicted Bloom: ${date.toDateString()}`};
}

// =========================
// 🎨 Helper: marker color
// =========================
function getColorByProbability(p){
  if(p<33) return 'green';
  if(p<66) return 'yellow';
  return 'red';
}

// =========================
// 📊 Chart.js Trend Graph
// =========================
const ctx = document.getElementById('bloomChart').getContext('2d');
const chart = new Chart(ctx,{
  type:'line',
  data:{
    labels:['Day 1','Day 2','Day 3','Day 4','Day 5'],
    datasets:[{
      label:'Bloom Probability (%)',
      data:[20,40,55,70,65],
      borderColor:'green',
      backgroundColor:'rgba(0,255,0,0.2)',
      fill:true,
      tension:0.3,
      pointRadius:6
    }]
  },
  options:{
    responsive:true,
    plugins:{title:{display:true,text:'Bloom Trend Prediction',font:{size:18}}},
    scales:{y:{beginAtZero:true,max:100}}
  }
});

// =========================
// 📝 Citizen Science Submission
// =========================
const form = document.getElementById('submissionForm');
form.addEventListener('submit', e=>{
  e.preventDefault();
  const lat = parseFloat(document.getElementById('lat').value);
  const lon = parseFloat(document.getElementById('lon').value);
  const species = document.getElementById('species').value;

  const bloomData = simulateBloomPrediction();
  const marker = L.circleMarker([lat, lon], {
    radius:12,
    fillColor:'#ff69b4',
    color:'#000',
    weight:1,
    opacity:1,
    fillOpacity:0.8
  }).addTo(map);
  marker.bindPopup(`<b>${species}</b><br>NDVI: Simulated<br>${bloomData.probText}`).openPopup();

  document.getElementById('submissionMsg').innerText = `Observation submitted: ${species} at [${lat}, ${lon}]`;
  form.reset();
});
