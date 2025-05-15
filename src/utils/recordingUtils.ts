
export const startRecording = async (
  stream: MediaStream | null,
  startTimer: () => void,
  setIsRecording: (recording: boolean) => void,
  autoStopTime: number = 10000
): Promise<{ recorder: MediaRecorder | null, recordingStream: MediaStream | null }> => {
  if (!stream) return { recorder: null, recordingStream: null };
  
  setIsRecording(true);
  let recordingStream: MediaStream;
  
  try {
    // Add audio track only for recording
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const videoTracks = stream.getVideoTracks();
    const audioTracks = audioStream.getAudioTracks();
    
    recordingStream = new MediaStream([...videoTracks, ...audioTracks]);
  } catch (err) {
    console.warn("Could not get audio permission, recording without audio", err);
    recordingStream = stream;
  }

  const recorder = new MediaRecorder(recordingStream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(blob);
    return { blob, videoUrl };
  };

  recorder.start();
  startTimer();

  // Auto-stop recording after specified time
  setTimeout(() => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setIsRecording(false);
      
      // Stop audio tracks if they were added just for recording
      if (recordingStream !== stream) {
        recordingStream.getAudioTracks().forEach(track => track.stop());
      }
    }
  }, autoStopTime);

  return { recorder, recordingStream };
};

export const stopRecording = (
  recorder: MediaRecorder | null, 
  recordingStream: MediaStream | null,
  stream: MediaStream | null,
  setIsRecording: (recording: boolean) => void,
  stopTimer: () => void,
  handleVideoData: (videoUrl: string) => void
): void => {
  if (recorder && recorder.state === "recording") {
    const chunks: BlobPart[] = [];
    
    const originalOnStop = recorder.onstop;
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      handleVideoData(videoUrl);
      
      // Stop audio tracks if they were added just for recording
      if (recordingStream && recordingStream !== stream) {
        recordingStream.getAudioTracks().forEach(track => track.stop());
      }
    };
    
    recorder.stop();
    setIsRecording(false);
    stopTimer();
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
