import { getEnergy, map, normalizeUint8 } from "@/lib/audio"
import { useEffect, useRef, useState } from "react"
import { Slider } from "../ui/slider"

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

export default function AppleVisualization(props: {
  frequencyDataRef: React.MutableRefObject<Uint8Array | null>
  style?: React.CSSProperties
}) {
  const [frequenciesBalancers, setFrequenciesBalancers] = useState(FREQUENCIES_BALANCERS)
  const frequenciesBalancersRef = useRef(frequenciesBalancers)
  frequenciesBalancersRef.current = frequenciesBalancers

  useEffect(() => {
    function main() {
      const containerEl = document.getElementById(
        "apple-visualization-mask"
      ) as unknown as SVGMaskElement
      const children = Array.from({ length: FREQUENCIES.length }, () =>
        document.createElementNS("http://www.w3.org/2000/svg", "rect")
      )
      children.forEach((el, i) => {
        el.setAttribute("width", "32")
        el.setAttribute("height", "255")
        el.setAttribute("fill", "white")
        el.setAttribute("rx", "16")
        el.setAttribute("x", `${i * (32 + 8)}`)
        el.style.transition = "all 0.07s"
      })
      containerEl.append(...children)

      let animateId: number

      function draw() {
        animateId = requestAnimationFrame(draw)
        const frequencyData = props.frequencyDataRef.current
        if (!frequencyData) return

        for (let i = 0; i < FREQUENCIES.length; i++) {
          const el = children[i]
          const [f1, f2] = FREQUENCIES[i]
          const balance = frequenciesBalancersRef.current[i]
          const energy = normalizeUint8(getEnergy(frequencyData, f1, f2))
          const amplitude = map(energy, balance[0], balance[1], 32, 255, { process: (v) => v ** 3 })
          el.setAttribute("height", `${amplitude}`)
          el.setAttribute("y", `${(255 - amplitude) / 2}`)
        }
      }

      draw()

      return () => {
        cancelAnimationFrame(animateId)
        containerEl.innerHTML = ""
      }
    }

    return main()
  }, [props.frequencyDataRef])

  return (
    <div className="group">
      <svg viewBox="0 0 600 255" className="w-0 h-0">
        <mask id="apple-visualization-mask"></mask>
      </svg>
      <div
        className="w-96 h-[255px]"
        style={{
          mask: `url(#apple-visualization-mask)`,
          // background: `linear-gradient(to right bottom, rgb(254, 240, 138), rgb(187, 247, 208), rgb(34, 197, 94))`,
          background: `hsl(0, 80%, 35%)`,
          ...props.style,
        }}
      ></div>
      <div className="flex mt-4 opacity-0 transition-opacity group-hover:opacity-100">
        {frequenciesBalancers.map((item, i) => (
          <div key={i} style={{ width: 84 }}>
            <Balancer
              value={item}
              onChange={(value) => {
                setFrequenciesBalancers((prev) => {
                  const next = [...prev]
                  next[i] = value
                  return next
                })
              }}
            ></Balancer>
          </div>
        ))}
      </div>
    </div>
  )
}

function Balancer(props: { value: [number, number]; onChange: (value: [number, number]) => void }) {
  return (
    <div>
      <div className="h-[255px] ml-[32px]">
        <Slider
          max={1}
          step={0.01}
          orientation="vertical"
          value={props.value}
          onValueChange={props.onChange}
        ></Slider>
      </div>
      <div className="text-center">{props.value.join()}</div>
    </div>
  )
}
