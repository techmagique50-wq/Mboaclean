import { useEffect } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { Link } from 'react-router-dom'
import type { Report } from '../domain/types'
import { STATUS_LABEL, WASTE_LABEL } from '../domain/types'
import { URGENCY_COLOR, urgency } from '../domain/engine'

interface Props {
  reports: Report[]
  showHeat?: boolean
  route?: { points: Report[]; depot: { lat: number; lng: number } }
  center?: [number, number]
  zoom?: number
}

const YAOUNDE: [number, number] = [3.866, 11.516]

export function MapView({ reports, showHeat, route, center = YAOUNDE, zoom = 13 }: Props) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showHeat && <HeatLayer reports={reports} />}

      {!showHeat &&
        reports.map((r) => {
          const u = urgency(r, reports)
          const color = r.status === 'resolu' ? STATUS_LABEL.resolu.color : URGENCY_COLOR[u.level]
          return (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={r.volume === 'enorme' ? 13 : r.volume === 'grand' ? 11 : r.volume === 'moyen' ? 9 : 7}
              pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.9 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {WASTE_LABEL[r.wasteType].emoji} {r.quartier} · {STATUS_LABEL[r.status].label}
              </Tooltip>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">
                    {WASTE_LABEL[r.wasteType].emoji} {WASTE_LABEL[r.wasteType].label}
                  </div>
                  <div className="text-xs text-muted">
                    {r.quartier}, {r.ville} · urgence {u.score}
                  </div>
                  <Link to={`/signalement/${r.id}`} className="text-brand underline">
                    Voir le détail →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

      {route && route.points.length > 0 && (
        <>
          <Polyline
            positions={[
              [route.depot.lat, route.depot.lng],
              ...route.points.map((r) => [r.lat, r.lng] as [number, number]),
              [route.depot.lat, route.depot.lng],
            ]}
            pathOptions={{ color: '#0fa3a3', weight: 3, dashArray: '6 6' }}
          />
          <CircleMarker
            center={[route.depot.lat, route.depot.lng]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#0f4d2a', fillOpacity: 1 }}
          >
            <Tooltip permanent direction="right">🏭 Dépôt</Tooltip>
          </CircleMarker>
          {route.points.map((r, i) => (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={11}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#0fa3a3', fillOpacity: 0.95 }}
            >
              <Tooltip permanent direction="top">{i + 1}</Tooltip>
            </CircleMarker>
          ))}
        </>
      )}
    </MapContainer>
  )
}

function HeatLayer({ reports }: { reports: Report[] }) {
  const map = useMap()
  useEffect(() => {
    const points = reports
      .filter((r) => r.status !== 'resolu')
      .map((r) => {
        const u = urgency(r, reports)
        return [r.lat, r.lng, Math.min(1, u.score / 100)] as [number, number, number]
      })
    // @ts-expect-error leaflet.heat n'a pas de types
    const layer = L.heatLayer(points, { radius: 30, blur: 22, maxZoom: 16 })
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, reports])
  return null
}
