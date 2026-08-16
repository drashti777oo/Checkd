export function isValidHeartRate(bpm: number): boolean {
  return bpm >= 30 && bpm <= 240;
}

export function isValidOxygenSaturation(spo2: number): boolean {
  return spo2 >= 70 && spo2 <= 100;
}
