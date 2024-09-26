export type PlayerMessageType =
  | "init"
  | "buffering"
  | "ready"
  | "changeState"
  | "currentTime"
  | "play"
  | "pause"
  | "stop"
  | "mute"
  | "unMute"
  | "setVolume"
  | "setCurrentTime"
  | "relativelySeek"
  | "changeVideo"
  | "setSkinColor"
  | "remove"
  | "error"
  | "changeFullscreen"
  | "rollState"
  | "playComplete"
  | "durationChange"
  | null;

type PlayerMessageTypeBuilder<T extends PlayerMessageType> = T extends null
  ? null
  : `player:${T}`;

// Base Message Type
interface PlayerMessageFabric<T = any, M extends PlayerMessageType = null> {
  type: PlayerMessageTypeBuilder<M>;
  data: T;
}

type InitMessage = PlayerMessageFabric<{}, "init">;

// // Playback Control Messages
type PlayMessage = PlayerMessageFabric<{}, "play">;
type PauseMessage = PlayerMessageFabric<{}, "pause">;
type StopMessage = PlayerMessageFabric<{}, "stop">;
type MuteMessage = PlayerMessageFabric<{}, "mute">;
type UnmuteMessage = PlayerMessageFabric<{}, "unMute">;

// Volume and CurrentTime Messages
interface VolumeChangeData {
  volume: number; // 0 to 1
}

interface SetSkinColorData {
  params: {
    color: string;
  };
}

type SetSkinColorMessage = PlayerMessageFabric<
  SetSkinColorData,
  "setSkinColor"
>;

type VolumeChangeMessage = PlayerMessageFabric<VolumeChangeData, "setVolume">;

// Change Video Messages
interface ChangeVideoData {
  id: string;
  params?: {
    hash?: string;
    p?: string; // private key
    quality?: number; // 1 for highest quality, -2 for lowest
  };
}
type ChangeVideoMessage = PlayerMessageFabric<ChangeVideoData, "changeVideo">;

// Seek and SetCurrentTime Messages
interface RelativelySeekData {
  time: number; // seconds to seek
}
type RelativelySeekMessage = PlayerMessageFabric<
  RelativelySeekData,
  "relativelySeek"
>;

interface CurrentTimeData {
  time: number; // time in seconds to set
}
type CurrentTimeMessage = PlayerMessageFabric<CurrentTimeData, "currentTime">;

// Fullscreen Change Message
interface ChangeFullscreenData {
  isFullscreen: boolean; // true or false
}
type ChangeFullscreenMessage = PlayerMessageFabric<
  ChangeFullscreenData,
  "changeFullscreen"
>;

// Error Message
interface ErrorData {
  code: string; // error code
  text: string; // error message
}
type ErrorMessage = PlayerMessageFabric<ErrorData, "error">;

// Roll State Message
interface RollStateData {
  rollState:
    | "preRoll"
    | "pauseBanner"
    | "postRoll"
    | "midRoll"
    | "pauseRoll"
    | "overlay";
  state: "play" | "complete";
  guid: string;
}
type RollStateMessage = PlayerMessageFabric<RollStateData, "rollState">;

// Play Complete Message
type PlayCompleteMessage = PlayerMessageFabric<{}, "playComplete">;

// Change State Message
export type ChangeState =
  | "playing"
  | "paused"
  | "stopped"
  | "lockScreenOn"
  | "lockScreenOff";

interface ChangeStateData {
  state: ChangeState;
  isLicensed: boolean;
}
type ChangeStateMessage = PlayerMessageFabric<ChangeStateData, "changeState">;

// Duration Change Message
interface DurationChangeData {
  duration: number; // duration of the video in seconds
}
type DurationChangeMessage = PlayerMessageFabric<
  DurationChangeData,
  "durationChange"
>;

// Ready Message
type ReadyMessage = PlayerMessageFabric<{}, "ready">;

export type MessageToIframe =
  | InitMessage
  | ReadyMessage
  | ChangeStateMessage
  | DurationChangeMessage
  | PlayCompleteMessage
  | RollStateMessage
  | ChangeFullscreenMessage
  | CurrentTimeMessage
  | RelativelySeekMessage
  | ChangeVideoMessage
  | VolumeChangeMessage
  | MuteMessage
  | UnmuteMessage
  | StopMessage
  | PauseMessage
  | PlayMessage
  | ErrorMessage
  | SetSkinColorMessage
  | CurrentTimeMessage;
