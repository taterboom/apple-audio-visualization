import ReactDOM from "react-dom/client"
import { Player } from "@remotion/player"
import { Audio, useCurrentFrame, useVideoConfig } from "remotion"
import { useAudioData, visualizeAudio } from "@remotion/media-utils"
import "./globals.css"
import { AppleVisualization } from "./remotion-visualizations/AppleVisualization"
import "./remotion.css"

const Scene = () => {
  const videoConfig = useVideoConfig()
  const frame = useCurrentFrame()
  const audioData = useAudioData("/example-music.mp3")

  if (!audioData) {
    return null
  }

  const frequencyData = visualizeAudio({
    fps: videoConfig.fps,
    frame,
    audioData,
    numberOfSamples: 2048,
  })

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Audio src="/example-music.mp3" />
      <div className="movie-with-audio-visualization__title">
        <div className="movie-with-audio-visualization__title__cover">
          <img src="/feixingting-cover.jpeg" width={144} height={144}></img>
        </div>
        <div className="movie-with-audio-visualization__title__info">
          <h1>飛行艇</h1>
        </div>
        <div className="movie-with-audio-visualization__title__av">
          <AppleVisualization frequencyData={frequencyData} image="/feixingting-cover.jpeg" />
        </div>
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <>
      <h1 className="mt-4 px-4 text-lg font-semibold">
        Apple Audio Visualization based on Remotion
      </h1>
      <div className="absolute top-[18px] left-[500px] space-x-4 text-blue-400 text-sm underline">
        <a href="https://github.com/taterboom/apple-audio-visualization">Github</a>
        <a href="/">Web version</a>
      </div>
      <Player
        component={Scene}
        durationInFrames={29 * 30}
        compositionWidth={400}
        compositionHeight={300}
        fps={30}
        controls
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
