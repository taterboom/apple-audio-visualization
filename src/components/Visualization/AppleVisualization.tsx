import { getEnergy, map } from "@/lib/audio"
import { useEffect, useRef, useState } from "react"
import { Slider } from "../ui/slider"

// const BASS = [20, 140]
// const LOWMID = [140, 400]
// const MID = [400, 2600]
// const HIGHMID = [2600, 5200]
// const TREBLE = [5200, 14000]

// const FREQUENCIES_BALANCER = [
//   [170, 255],
//   [190, 255],
//   [100, 210],
//   [60, 160],
//   [40, 180],
// ]

const SUB_BASS = [20, 60]
const BASS = [60, 250]
const LOW_MID = [250, 500]
const MID = [500, 2000]
const UPPER_MID = [2000, 4000]
const HIGH = [4000, 20000]

const FREQUENCIES = [SUB_BASS, BASS, LOW_MID, MID, UPPER_MID, HIGH]

const FREQUENCIES_BALANCERS: [number, number][] = [
  [190, 255],
  [200, 254],
  [170, 240],
  [130, 220],
  [80, 190],
  [40, 170],
]

export default function AppleVisualization(props: { source: string | MediaStream }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [frequenciesBalancers, setFrequenciesBalancers] = useState(FREQUENCIES_BALANCERS)
  const frequenciesBalancersRef = useRef(frequenciesBalancers)
  frequenciesBalancersRef.current = frequenciesBalancers

  useEffect(() => {
    function main() {
      let closeSource: () => void = () => {}
      const audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.connect(audioCtx.destination)
      if (props.source instanceof MediaStream) {
        const source = audioCtx.createMediaStreamSource(props.source)
        source.connect(analyser)
        closeSource = () => {
          if (!(props.source instanceof MediaStream)) {
            return
          }
          props.source.getTracks().forEach(function (track) {
            track.stop()
          })
        }
      } else {
        const audioEl = new Audio(props.source)
        audioEl.play()
        const source = audioCtx.createMediaElementSource(audioEl)
        source.connect(analyser)
        closeSource = () => {
          audioEl.pause()
          audioEl.remove()
        }
      }

      analyser.fftSize = 2048
      const bufferLength = analyser.frequencyBinCount
      const frequencyData = new Uint8Array(bufferLength)

      const containerEl = containerRef.current!
      const children = Array.from({ length: FREQUENCIES.length }, () =>
        document.createElement("div")
      )
      children.forEach((el) => {
        el.style.width = "84px"
        el.style.backgroundImage = "linear-gradient(180deg, hsl(0, 10%, 5%), hsl(0, 100%, 50%))"
        el.style.backgroundSize = "100% 255px"
      })
      containerEl.append(...children)

      let animateId: number

      function draw() {
        animateId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(frequencyData)

        for (let i = 0; i < FREQUENCIES.length; i++) {
          const el = children[i]
          const [f1, f2] = FREQUENCIES[i]
          const balance = frequenciesBalancersRef.current[i]
          const energy = map(getEnergy(frequencyData, f1, f2), balance[0], balance[1], 0, 255)
          el.style.height = `${map(energy, 0, 255, 0, 100)}%`
        }
      }

      draw()

      return () => {
        cancelAnimationFrame(animateId)
        audioCtx.close()
        closeSource()
        containerEl.innerHTML = ""
      }
    }

    return main()
  }, [props.source])

  return (
    <div className="group">
      <div ref={containerRef} className="h-[255px] flex items-start -scale-y-100"></div>
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
          max={255}
          step={1}
          orientation="vertical"
          value={props.value}
          onValueChange={props.onChange}
        ></Slider>
      </div>
      <div className="text-center">{props.value.join()}</div>
    </div>
  )
}
