<template>
  <iframe
    id="rutube-player"
    :width="width"
    :height="height"
    :src="sourceUrl"
    :frameborder="frameborder"
    webkitAllowFullScreen
    mozallowfullscreen
    allowFullScreen
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

interface Props {
  src?: string;
  videoId: string;
  width: string;
  height: string;
  frameborder: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "ready", state: boolean): void;
  (e: "currentTime", time: number): void;
  (e: "changeVideo", id: string, quality: 1 | 0): void;
  (e: `${ChangeState}`, state: boolean): void;
}>();

const isReady = ref<boolean>(false);
const currentTime = ref<number>(0);
const playerRef = ref<HTMLIFrameElement | null>(null);

const DEFAULT_VIDEO_ID = "7163336";

onMounted(() => {
  playerRef.value = document.getElementById(
    "rutube-player"
  ) as HTMLIFrameElement;

  onHandleEvent();
});

const sourceUrl = computed(() => {
  if (!props.src) {
    return `https://rutube.ru/play/embed/${
      props.videoId ?? DEFAULT_VIDEO_ID
    }?quality=1`;
  }
  return props.src;
});

function sendPostMessage(type: PlayerMessageType, data: unknown) {
  if (!isReady.value) return;
  if (!playerRef.value) return;

  playerRef.value.contentWindow?.postMessage(
    JSON.stringify({
      type: `player:${type}`,
      data: data,
    }),
    "*"
  );
}

function onPlay() {
  sendPostMessage("play", {});
}

function onPause() {
  sendPostMessage("pause", {});
}

function onStop() {
  sendPostMessage("stop", {});
}

function onMute() {
  sendPostMessage("mute", {});
}

function unMute() {
  sendPostMessage("unMute", {});
}

function setCurrentTime(seconds: number) {
  sendPostMessage("setCurrentTime", { time: seconds });
}

function getCurrentTime() {
  return currentTime.value;
}

function relativelySeek(seconds: string) {
  sendPostMessage("relativelySeek", { time: seconds });
}

function onChangeVideo(id: string, quality: 1 | 0 = 1) {
  sendPostMessage("changeVideo", {
    params: { hash: id, quality: quality },
  });
}

function onSetVolume(volume: number) {
  sendPostMessage("setVolume", { volume: volume });
}

function onSetSkinColor(color: string) {
  sendPostMessage("setSkinColor", { params: { color: color } });
}

function onRemove() {
  sendPostMessage("remove", {});
}

type PlayerMessageType =
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
type ChangeState =
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

type MessageToIframe =
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

function onHandleEvent() {
  window.addEventListener("message", (event: MessageEvent<MessageToIframe>) => {
    const message = JSON.parse(event.data as unknown as string);
    console.log(message, "MESSAGE AFTER PARSE");
    onEmitEvent(message);
  });
}

function onEmitEvent(message: MessageToIframe) {
  switch (message.type) {
    case "player:ready":
      isReady.value = true;
      emit("ready", isReady.value);
      break;
    case "player:changeState":
      emit(message.data.state, message.data.isLicensed);
      break;
    case "player:currentTime":
      currentTime.value = message.data.time;
      emit("currentTime", message.data.time);
  }
}

defineExpose({
  onPlay,
  onPause,
  onStop,
  onMute,
  unMute,
  setCurrentTime,
  getCurrentTime,
  relativelySeek,
  onChangeVideo,
  onSetVolume,
  onSetSkinColor,
  onRemove,
});
</script>
