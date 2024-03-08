function clamp(x: number, min: number, max: number) {
  return Math.max(Math.min(x, max), min)
}

export function map(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  options?: { process?: (v: number) => number }
) {
  const { process = (v: number) => v } = options || {}
  return clamp(process((x - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin, outMin, outMax)
}

export const normalizeUint8 = (uint8: number) => map(uint8, 0, 255, 0, 1)

// https://github.dev/processing/p5.sound.js/blob/b21a9de0d69a0b8871f4dcc7557f4fcb0a51bccf/src/AnalyzerFFT.js#L348-L349
export function getEnergy(
  frenquencyData: Uint8Array,
  frequency1: number,
  frequency2: number,
  options?: { sampleRate?: number }
) {
  const { sampleRate = 44100 } = options || {}
  const bufferLength = frenquencyData.length
  const nyquist = sampleRate / 2
  const lowIndex = Math.round((frequency1 / nyquist) * bufferLength)
  const highIndex = Math.round((frequency2 / nyquist) * bufferLength)

  let total = 0
  let numFrequencies = 0
  // add up all of the values for the frequencies
  for (let i = lowIndex; i <= highIndex; i++) {
    total += frenquencyData[i]
    numFrequencies += 1
  }
  // divide by total number of frequencies
  const toReturn = total / numFrequencies
  return toReturn
}
