import { useRef, useState } from "react";
import { socket } from "./socket";

function App() {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startScreenSharing = async () => {
    try {
      // Request display media (screen sharing)
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm; codecs=vp8",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit("video-data", event.data);
        }
      };

      mediaRecorder.start(1000); //interval to send data

      socket.on("connect", () => {
        console.log("Socket.IO connection established.");
      });

      socket.on("disconnect", () => {
        console.log("Socket.IO connection closed.");
      });

      socket.on("error", (error) => {
        console.error("Socket.IO error: ", error);
      });

      socket.on("received", (data) => {
        console.log("Server received data:", data);
      });

      // Set the media stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Save the media stream in state
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing display media.", error);
    }
  };

  const stopScreenSharing = () => {
    if (stream) {
      // Stop all tracks in the stream
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);

      socket.disconnect();
    }
  };

  console.log(stream);

  return (
    <div className="h-screen bg-green-300">
      <h1 className="text-3xl font-semibold text-center pt-6">
        Let AI assist you fix that bug by sharing your screen (in real time !)
      </h1>
      <div className="flex justify-center">
        <button
          className="bg-green-700 px-6 text-white rounded-3xl"
          onClick={startScreenSharing}
        >
          Start Screen Sharing
        </button>
        {/* <button onClick={stopScreenSharing}>Stop Screen Sharing</button> */}
      </div>
      <div className="relative mx-6">
        {stream && (
          <button
            onClick={stopScreenSharing}
            className="bg-green-700 text-xs px-2 text-white rounded-3xl absolute top-2 right-2 z-50"
          >
            Stop sharing
          </button>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", height: "auto", border: "1px solid black" }}
        />
      </div>
    </div>
  );
}

export default App;
