import { map, normalizeUint8 } from "@/lib/audio"
import { useEffect, useRef } from "react"

export default function Visualization(props: {
  frequencyDataRef: React.MutableRefObject<Uint8Array | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function main() {
      const containerEl = containerRef.current!
      const children = Array.from({ length: props.frequencyDataRef.current!.length }, () =>
        document.createElement("div")
      )
      children.forEach((el) => {
        el.style.width = "1px"
        el.style.backgroundImage = "linear-gradient(180deg, hsl(0, 10%, 5%), hsl(0, 100%, 50%))"
        el.style.backgroundSize = "100% 255px"
      })
      containerEl.append(...children)

      let animateId: number

      // let max = -Infinity
      // let min = 0
      // const a = new Float32Array(bufferLength)
      function draw() {
        animateId = requestAnimationFrame(draw)
        // analyser.getFloatFrequencyData(frequencyData)
        // console.log("frequencyData", max, min, frequencyData)
        // for (let i = 0; i < frequencyData.length; i++) {
        //   if (frequencyData[i] > max) {
        //     max = frequencyData[i]
        //   }
        //   if (frequencyData[i] !== -Infinity && frequencyData[i] < min) {
        //     min = frequencyData[i]
        //   }
        //   const el = children[i]
        //   el.style.height = `${map(frequencyData[i], 0, 255, 0, 100)}%`
        // }
        const frequencyData = props.frequencyDataRef.current
        if (!frequencyData) return
        for (let i = 0; i < frequencyData.length; i++) {
          const magnitude = normalizeUint8(frequencyData[i])
          const el = children[i]
          el.style.height = `${map(magnitude, 0, 1, 0, 100)}%`
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
    <div
      ref={containerRef}
      style={{ height: 255, display: "flex", alignItems: "flex-start", transform: "scaleY(-1)" }}
    ></div>
  )
}
