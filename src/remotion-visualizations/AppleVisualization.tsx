import { getEnergy, map, processAudioFftValue } from "./audioUtils"

const SIZE = 100
const GAP = 6

const SUB_BASS = [20, 60]
const BASS = [60, 250]
const LOW_MID = [250, 500]
const MID = [500, 2000]
const UPPER_MID = [2000, 4000]
const HIGH = [4000, 20000]

const FREQUENCIES = [SUB_BASS, BASS, LOW_MID, MID, UPPER_MID, HIGH]

const FREQUENCIES_BALANCERS: [number, number][] = [
  [0.5, 1],
  [0.5, 0.96],
  [0.35, 0.83],
  [0.28, 0.74],
  [0.19, 0.66],
  [0.03, 0.37],
]

export const getBars = ({ frequencyData }: { frequencyData: number[] }) => {
  const defaultFrequencyData = frequencyData.map(
    (v, i) => processAudioFftValue(v) - map(i, 0, frequencyData.length, 0.4, 1) * 0.26
  )
  const bars = Array.from({ length: FREQUENCIES.length }).map((_, i) => {
    const energy = getEnergy(defaultFrequencyData, FREQUENCIES[i][0], FREQUENCIES[i][1])
    const amplitude = map(energy, FREQUENCIES_BALANCERS[i][0], FREQUENCIES_BALANCERS[i][1], 0, 1, {
      process: (v) => v ** 3,
    })
    return amplitude
  })

  return bars
}

export const AppleVisualization: React.FC<{
  frequencyData: number[]
  image: string
}> = ({ frequencyData, image }) => {
  const bars = getBars({ frequencyData })
  const barWidth = (SIZE - bars.length * GAP) / bars.length

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
      <mask id="apple-visualization-mask">
        {bars.map((item, i) => {
          const barHeight = Math.max(item * SIZE, barWidth)
          return (
            <rect
              x={(SIZE / bars.length) * i + (SIZE / bars.length - barWidth) / 2}
              y={(SIZE - barHeight) / 2}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill="white"
            ></rect>
          )
        })}
      </mask>
      <filter id="apple-visualization-filter">
        <feGaussianBlur stdDeviation="24" edgeMode="duplicate" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.2" />
          <feFuncG type="linear" slope="1.2" />
          <feFuncB type="linear" slope="1.2" />
        </feComponentTransfer>
      </filter>
      <image
        href={image}
        height="100%"
        width="100%"
        filter="url(#apple-visualization-filter)"
        mask="url(#apple-visualization-mask)"
      />
    </svg>
  )
}
