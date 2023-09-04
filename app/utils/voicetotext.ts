import {
  SpeechRecognizer,
  AudioConfig,
  SpeechConfig,
  ResultReason,
  SpeechSynthesizer,
  PushAudioOutputStream,
} from "microsoft-cognitiveservices-speech-sdk";
import { Stream } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Stream";

const subscriptionKey = "8712c1ca52c945cfa43a3f2cd1042c02";
const region = "eastasia";
const language = "zh-CN"; // 多种语言的语言代码，以逗号分隔

export const startSpeechToText = async (): Promise<string> => {
  const speechConfig: SpeechConfig = SpeechConfig.fromSubscription(
    subscriptionKey,
    region,
  );
  // 增加中文的识别
  speechConfig.speechRecognitionLanguage = language;
  const audioConfig: AudioConfig = AudioConfig.fromDefaultMicrophoneInput();

  const recognizer: SpeechRecognizer = new SpeechRecognizer(
    speechConfig,
    audioConfig,
  );

  return new Promise<string>((resolve, reject) => {
    recognizer.recognizeOnceAsync((result) => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        const { text } = result;
        console.log("Recognized speech:", text);
        resolve(text);
      } else {
        console.log("Speech recognition error:", result.errorDetails);
        reject(result.errorDetails);
      }

      recognizer.close();
    });
  });
};

export const convertTextToSpeech = async (text: string): Promise<void> => {
  const speechConfig: SpeechConfig = SpeechConfig.fromSubscription(
    subscriptionKey,
    region,
  );

  speechConfig.speechSynthesisLanguage = language;

  const audioConfig: AudioConfig = AudioConfig.fromDefaultSpeakerOutput();

  const synthesizer: SpeechSynthesizer = new SpeechSynthesizer(
    speechConfig,
    audioConfig,
  );

  return new Promise<any>((resolve, reject) => {
    const handler = (result: any) => {
      if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        console.log("Audio synthesized successfully");
        resolve(Buffer.from(result.audioData));
      } else {
        console.log("Speech synthesis error:", result.errorDetails);
        reject(result.errorDetails);
      }
    };

    synthesizer.speakTextAsync(text, handler);

    return synthesizer;
  });
};
