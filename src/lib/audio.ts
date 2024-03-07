export function map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return Math.max(
    Math.min(((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min, out_max),
    out_min
  )
}

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
