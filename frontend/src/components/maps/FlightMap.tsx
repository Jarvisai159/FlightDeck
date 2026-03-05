import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FlightStatus } from '../../data/demoData'

// Fix missing marker icons in Leaflet + bundlers
const iconDefault = L.divIcon({
  className: '',
  html: `<div style="background:#06b6d4;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(6,182,212,0.5)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const iconPlane = L.divIcon({
  className: '',
  html: `<div style="font-size:22px;filter:drop-shadow(0 0 4px rgba(6,182,212,0.6))">✈️</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

// Coordinates for known airports (subset for demo)
const airportCoords: Record<string, [number, number]> = {
  DXB: [25.2532, 55.3657],
  LIS: [38.7813, -9.1359],
  IST: [41.2753, 28.7519],
  LHR: [51.4700, -0.4543],
  STN: [51.885, 0.235],
  SHJ: [25.3286, 55.5172],
  BGY: [45.6739, 9.7042],
  BCN: [41.2974, 2.0833],
  OPO: [41.2481, -8.6814],
  FAO: [37.0144, -7.9659],
  CDG: [49.0097, 2.5479],
  AUH: [24.4539, 54.6513],
}

interface Props {
  flight: FlightStatus
}

export default function FlightMap({ flight }: Props) {
  const depCoords = airportCoords[flight.departure_airport] || [25.25, 55.36]
  const arrCoords = airportCoords[flight.arrival_airport] || [38.78, -9.13]
  const planePos: [number, number] | null =
    flight.latitude && flight.longitude ? [flight.latitude, flight.longitude] : null

  // Center map on the midpoint, or on the plane if in air
  const center: [number, number] = planePos || [
    (depCoords[0] + arrCoords[0]) / 2,
    (depCoords[1] + arrCoords[1]) / 2,
  ]

  // Generate arc points for great circle-ish path
  const pathPoints: [number, number][] = []
  const steps = 50
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lat = depCoords[0] + t * (arrCoords[0] - depCoords[0])
    const lng = depCoords[1] + t * (arrCoords[1] - depCoords[1])
    pathPoints.push([lat, lng])
  }

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Flight path */}
      <Polyline
        positions={pathPoints}
        pathOptions={{ color: '#06b6d4', weight: 2, opacity: 0.6, dashArray: '8 6' }}
      />

      {/* Departure airport */}
      <Marker position={depCoords} icon={iconDefault}>
        <Popup>
          <div className="text-xs">
            <strong>{flight.departure_airport}</strong><br />
            {flight.departure_airport_name}
          </div>
        </Popup>
      </Marker>

      {/* Arrival airport */}
      <Marker position={arrCoords} icon={iconDefault}>
        <Popup>
          <div className="text-xs">
            <strong>{flight.arrival_airport}</strong><br />
            {flight.arrival_airport_name}
          </div>
        </Popup>
      </Marker>

      {/* Plane marker */}
      {planePos && (
        <Marker position={planePos} icon={iconPlane}>
          <Popup>
            <div className="text-xs">
              <strong>{flight.flight_number}</strong><br />
              {flight.altitude ? `${(flight.altitude / 1000).toFixed(0)}k ft · ` : ''}
              {flight.speed ? `${flight.speed} kts` : ''}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
