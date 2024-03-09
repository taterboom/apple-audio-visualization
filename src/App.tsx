import { useEffect, useState } from "react"
import Visualization from "./components/Visualization/Visualization"
import AppleVisualization from "./components/Visualization/AppleVisualization"
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import VisualizationProvider from "./components/Visualization/VisualizationProvider"

function App() {
  const [inputType, setInputType] = useState<"songs" | "upload" | "record">("songs")
  const [source, setSource] = useState<string | MediaStream | null>(null)
  const [type, setType] = useState<Array<"normal" | "apple">>(["normal", "apple"])

  useEffect(() => {
    if (inputType === "record") {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        setSource(stream)
      })
    }
  }, [inputType])

  return (
    <>
      <h1 className="mt-4 px-4 text-lg font-semibold">Apple Audio Visualization</h1>
      <div className="absolute top-[18px] left-[400px] text-blue-400 text-sm underline">
        <a href="https://github.com/taterboom/apple-audio-visualization">Github</a>
        <a href="/remotion" className="ml-4">
          Remotion version
        </a>
      </div>
      <main className="p-4 space-y-4">
        <div>
          <ToggleGroup
            type="single"
            className="justify-start"
            value={inputType}
            onValueChange={(v: never) => setInputType(v)}
          >
            <ToggleGroupItem value="songs">Songs</ToggleGroupItem>
            <ToggleGroupItem value="record">Record</ToggleGroupItem>
            <ToggleGroupItem value="upload">Upload</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {inputType === "songs" && (
          <>
            <Select onValueChange={(v) => setSource(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a song" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Songs</SelectLabel>
                  <SelectItem value="/drum.mp3">Drum Demo</SelectItem>
                  <SelectItem value="/example-music.mp3">Music</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        )}
        {inputType === "upload" && (
          <input
            type="file"
            onChange={(e) => {
              e.target.files && setSource(URL.createObjectURL(e.target.files[0]))
            }}
          />
        )}
        <div>
          <ToggleGroup
            type="multiple"
            className="justify-start"
            value={type}
            onValueChange={(v: never) => setType(v)}
          >
            <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
            <ToggleGroupItem value="apple">Apple</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {!!source && (
          <VisualizationProvider source={source}>
            {(frequencyDataRef) => (
              <div>
                {type.includes("normal") && (
                  <Visualization frequencyDataRef={frequencyDataRef}></Visualization>
                )}
                {type.includes("apple") && (
                  <AppleVisualization
                    frequencyDataRef={frequencyDataRef}
                    style={
                      source === "/example-music.mp3"
                        ? {
                            background: "url(/feixingting-cover.jpeg) no-repeat",
                            filter: "blur(32px) brightness(1.2) contrast(0.8)",
                          }
                        : {}
                    }
                  ></AppleVisualization>
                )}
              </div>
            )}
          </VisualizationProvider>
        )}
      </main>
    </>
  )
}

export default App
