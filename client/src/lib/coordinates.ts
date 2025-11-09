export function parseDMSCoordinate(dmsString: string): { latitude: number; longitude: number } | null {
  try {
    const regex = /(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])/;
    const match = dmsString.trim().match(regex);
    
    if (!match) {
      return null;
    }

    const latDeg = parseInt(match[1]);
    const latMin = parseInt(match[2]);
    const latSec = parseFloat(match[3]);
    const latDir = match[4];

    const lonDeg = parseInt(match[5]);
    const lonMin = parseInt(match[6]);
    const lonSec = parseFloat(match[7]);
    const lonDir = match[8];

    let latitude = latDeg + latMin / 60 + latSec / 3600;
    if (latDir === 'S') latitude = -latitude;

    let longitude = lonDeg + lonMin / 60 + lonSec / 3600;
    if (lonDir === 'W') longitude = -longitude;

    return { latitude, longitude };
  } catch (error) {
    return null;
  }
}

export function formatCoordinatesToDMS(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  const absLat = Math.abs(latitude);
  const absLon = Math.abs(longitude);
  
  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg) * 60 - latMin) * 60;
  
  const lonDeg = Math.floor(absLon);
  const lonMin = Math.floor((absLon - lonDeg) * 60);
  const lonSec = ((absLon - lonDeg) * 60 - lonMin) * 60;
  
  return `${latDeg}°${latMin}'${latSec.toFixed(1)}"${latDir} ${lonDeg}°${lonMin}'${lonSec.toFixed(1)}"${lonDir}`;
}
