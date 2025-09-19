// utils/geo.js
import polyline from "@mapbox/polyline";

/**
 * Haversine distance in meters between two lat/lng
 */
export function haversineMeters([lat1, lng1], [lat2, lng2]) {
  const R = 6371000; // m
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Project point P onto segment AB and return the closest point on segment
 * Uses equirectangular approx for small distances.
 * Inputs: arrays [lat, lng]
 */
function closestPointOnSegment(A, B, P) {
  // convert to cartesian-like x = lon*cos(meanLat), y = lat (radians not needed because we keep in degrees)
  const meanLat = ((A[0] + B[0]) / 2) * (Math.PI / 180);
  const cosMean = Math.cos(meanLat);

  const Ax = A[1] * cosMean, Ay = A[0];
  const Bx = B[1] * cosMean, By = B[0];
  const Px = P[1] * cosMean, Py = P[0];

  const vx = Bx - Ax, vy = By - Ay;
  const wx = Px - Ax, wy = Py - Ay;

  const vLen2 = vx * vx + vy * vy;
  if (vLen2 === 0) return { point: A, t: 0 };

  const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / vLen2));
  const closestX = Ax + t * vx;
  const closestY = Ay + t * vy;

  // Convert back to lat/lng
  const closestLat = closestY;
  const closestLng = closestX / cosMean;

  return { point: [closestLat, closestLng], t };
}

/**
 * Given encoded polyline and a rider point [lat,lng], returns:
 * { nearestPoint: [lat,lng], distanceMeters, segmentIndex }
 */
export function findNearestPointOnPolyline(encodedPolyline, riderPoint) {
  const coords = polyline.decode(encodedPolyline); // returns [[lat, lng], ...]
  let best = { distance: Infinity, point: null, idx: -1 };

  for (let i = 0; i < coords.length - 1; i++) {
    const A = coords[i], B = coords[i + 1];
    const { point } = closestPointOnSegment(A, B, riderPoint);
    const d = haversineMeters(point, riderPoint);
    if (d < best.distance) {
      best = { distance: d, point, idx: i };
    }
  }

  // as fallback check vertices
  for (let i = 0; i < coords.length; i++) {
    const d = haversineMeters(coords[i], riderPoint);
    if (d < best.distance) {
      best = { distance: d, point: coords[i], idx: i };
    }
  }

  return {
    nearestPoint: best.point,
    distanceMeters: Math.round(best.distance),
    segmentIndex: best.idx
  };
}
