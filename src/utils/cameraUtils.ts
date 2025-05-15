
export const startCamera = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  setCameraReady: (ready: boolean) => void
): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' },
      audio: false
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraReady(true);
    }
    
    return stream;
  } catch (err) {
    console.error("Error accessing camera:", err);
    return null;
  }
};

export const stopCamera = (stream: MediaStream | null) => {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
};
