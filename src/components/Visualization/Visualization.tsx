import { map } from "@/lib/audio"
import { useEffect, useRef } from "react"

export default function Visualization(props: { source: string | MediaStream }) {
  const containerRef = useRef<HTMLDivElement>(null)

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
          props.source.getTracks().forEach((track) => {
            console.log("track", track)
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
      const children = Array.from({ length: frequencyData.length }, () =>
        document.createElement("div")
      )
      children.forEach((el) => {
        el.style.width = "1px"
        el.style.backgroundImage = "linear-gradient(180deg, hsl(0, 10%, 5%), hsl(0, 100%, 50%))"
        el.style.backgroundSize = "100% 255px"
      })
      containerEl.append(...children)

      let animateId: number

      function draw() {
        animateId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(frequencyData)
        for (let i = 0; i < frequencyData.length; i++) {
          const el = children[i]
          el.style.height = `${map(frequencyData[i], 0, 255, 0, 100)}%`
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
    <div
      ref={containerRef}
      style={{ height: 255, display: "flex", alignItems: "flex-start", transform: "scaleY(-1)" }}
    ></div>
  )
}
