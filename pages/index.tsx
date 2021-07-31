import { useRef, useEffect } from "react";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { Rendering } from "./models/rendering";
import * as posenet from "@tensorflow-models/posenet";
import {PoseNet, ModelConfig} from "@tensorflow-models/posenet";

export default function App() {
  const webcam = useRef<Webcam>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const videoConstraints = {
    width: 360,
    height: 270,
    facingMode: "user"
  };
  
  const runPoseDetect = async () => {
    const posenet_model: PoseNet = await posenet.load();
    detect(posenet_model);
  };

  const detect = async (detector: PoseNet) => {
    if (webcam.current && canvas.current) {
      const webcamCurrent = webcam.current as any;
      // go next step only when the video is completely uploaded.
      if (webcamCurrent.video.readyState === 4) {
        const video = webcamCurrent.video;
        const videoWidth = webcamCurrent.video.videoWidth;
        const videoHeight = webcamCurrent.video.videoHeight;
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;
        console.log(`videoWidth: ${videoWidth}, videoHeight: ${videoHeight}`);

        const prediction = await detector.estimateSinglePose(video, {
          flipHorizontal: false,
        });
        console.log(prediction);

        const ctx = canvas.current.getContext("2d") as CanvasRenderingContext2D;
        requestAnimationFrame(() => {
          const rendering = new Rendering(ctx);
          rendering.drawResult(prediction);
        });
        detect(detector);
      } else {
        setTimeout(() => {
          detect(detector);
        }, 100);
      };
    };
  };

  useEffect(() => {
    runPoseDetect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="App">
      <header className="header">
        <div className="title">PICTOGRAM SAN</div>
      </header>
      <Webcam
        audio={false}
        videoConstraints={videoConstraints}
        ref={webcam}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 100,
          left: 0,
          right: 0,
          zIndex: 9,
        }}
      />
      <canvas
        ref={canvas}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 100,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      />
    </div>
  )
}