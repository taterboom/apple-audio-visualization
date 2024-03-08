import { useEffect, useRef, useState } from "react"

export default function VisualizationProvider(props: {
  source: string | MediaStream
  children: (frequencyDataRef: React.MutableRefObject<Uint8Array | null>) => React.ReactNode
}) {
  const frequencyDataRef = useRef<Uint8Array | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [ready, setReady] = useState(false)

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
        const audioEl = audioRef.current!
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
      analyser.smoothingTimeConstant = 0.9
      const bufferLength = analyser.frequencyBinCount
      const frequencyData = new Uint8Array(bufferLength)
      frequencyDataRef.current = frequencyData

      let animateId: number

      function fetchFrequencyData() {
        animateId = requestAnimationFrame(fetchFrequencyData)
        analyser.getByteFrequencyData(frequencyData)
      }

      fetchFrequencyData()

      setReady(true)

      return () => {
        cancelAnimationFrame(animateId)
        audioCtx.close()
        closeSource()
      }
    }

    return main()
  }, [props.source])

  return (
    <>
      {typeof props.source === "string" && (
        <audio ref={audioRef} key={props.source} src={props.source} controls></audio>
      )}
      {ready && props.children(frequencyDataRef)}
    </>
  )
}
