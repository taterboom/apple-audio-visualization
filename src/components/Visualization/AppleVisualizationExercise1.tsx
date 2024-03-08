import { getEnergy, map } from "@/lib/audio"
import { useEffect, useRef, useState } from "react"
import { Slider } from "../ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
  [190, 245],
  [120, 215],
  [100, 200],
  [70, 170],
  [30, 130],
  // [190, 255],
  // [200, 254],
  // [170, 240],
  // [130, 220],
  // [80, 190],
  // [40, 170],
]

export default function AppleVisualization(props: { source: string | MediaStream }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [frequenciesBalancers, setFrequenciesBalancers] = useState(FREQUENCIES_BALANCERS)
  const [placement, setPlacement] = useState<"bottom" | "middle">("middle")
  const placementRef = useRef(placement)
  placementRef.current = placement
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
        const audioEl = document.getElementById("audio") as HTMLAudioElement
        const source = audioCtx.createMediaElementSource(audioEl)
        source.connect(analyser)
        audioEl.play()
        closeSource = () => {
          audioEl.pause()
          source.disconnect()
        }
      }

      analyser.fftSize = 2048
      analyser.maxDecibels = -25
      analyser.minDecibels = -100
      const bufferLength = analyser.frequencyBinCount
      const frequencyData = new Uint8Array(bufferLength)

      const containerEl = containerRef.current!
      const children = Array.from({ length: FREQUENCIES.length }, () =>
        document.createElement("div")
      )
      children.forEach((el) => {
        el.style.width = "32px"
        el.style.borderRadius = "16px"
        el.style.backgroundImage = "linear-gradient(180deg, hsl(0, 10%, 5%), hsl(0, 100%, 50%))"
        el.style.backgroundSize = "100% 255px"
        el.style.transition = "height 0.07s"
      })
      containerEl.append(...children)

      let animateId: number

      function draw() {
        animateId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(frequencyData)

        for (let i = 0; i < FREQUENCIES.length; i++) {
          const el = children[i]
          if (placementRef.current === "middle") {
            el.style.background = "hsl(0, 100%, 30%)"
          }
          const [f1, f2] = FREQUENCIES[i]
          const balance = frequenciesBalancersRef.current[i]
          const energy = getEnergy(frequencyData, f1, f2)
          const amplitude = map(energy, balance[0], balance[1], 0, 255)
          el.style.height = `${map(amplitude, 0, 255, 0, 100)}%`
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
      <div>
        <ToggleGroup
          type="single"
          className="justify-start"
          value={placement}
          onValueChange={(v: never) => setPlacement(v)}
        >
          <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
          <ToggleGroupItem value="middle">Middle</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        ref={containerRef}
        className={
          "border h-[255px] flex gap-1 -scale-y-100 " +
          (placement === "middle" ? "items-center" : "items-start")
        }
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
