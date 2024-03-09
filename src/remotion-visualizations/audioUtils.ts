export const getRMS = (spectrum: number[]) => {
  let rms = 0

  // sum the squared amplitudes
  for (let i = 0; i < spectrum.length; i++) {
    rms += spectrum[i] * spectrum[i]
  }

  // divide by number of amplitudes to get average
  rms = rms / spectrum.length

  // take square root of average to get rms
  rms = Math.sqrt(rms)

  return rms
}

export const toDecibel = (v: number) => 20 * Math.log10(v)

export const range = (v: number, min: number, max: number) => (v - min) / (max - min)

export const clamp = (v: number, min: number, max: number) => {
  return Math.max(Math.min(v, max), min)
}

// Default scaling factors from W3C getByteFrequencyData
const DEFAULT_MIN_DB = -100
const DEFAULT_MAX_DB = -25

export const processAudioFftValue: (
  v: number,
  options?: {
    minDb?: number
    maxDb?: number
  }
) => number = (v, options = {}) => {
  const { minDb = DEFAULT_MIN_DB, maxDb = DEFAULT_MAX_DB } = options

  // convert to decibels (will be in range [-Infinity, 0])
  const db = toDecibel(v)

  // scale to fit between min and max
  const scaled = clamp(range(db, minDb, maxDb), 0, 1)

  return scaled
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

// https://github.dev/processing/p5.sound.js/blob/b21a9de0d69a0b8871f4dcc7557f4fcb0a51bccf/src/AnalyzerFFT.js#L348-L349
export function getEnergy(
  frenquencyData: number[],
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
