<template>
  <iframe
    ref="playerRef"
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
import { ref, onMounted, computed, toRefs, watch } from "vue";
import { MessageToIframe, ChangeState, PlayerMessageType } from "./types";

interface Props {
  src?: string;
  videoId?: string;
  width?: string;
  height?: string;
  frameborder?: string;
  loop?: boolean;
  autoplay?: boolean;
  mute?: boolean;
}

const props = defineProps<Props>();

const { src, loop, autoplay, mute } = toRefs(props);

const emit = defineEmits<{
  (e: "playComplete"): void;
  (e: "ready", state: boolean): void;
  (e: "currentTime", time: number): void;
  (e: "changeVideo", id: string, quality: 1 | 0): void;
  (e: `${ChangeState}`, state: boolean): void;
}>();

const isReady = ref<boolean>(false);
const isPlaying = ref<boolean>(false);

const currentTime = ref<number>(0);
const playerRef = ref<HTMLIFrameElement | null>(null);

onMounted(() => {
  onHandleEvent();

  if (mute.value) onMute();
});

watch(
  mute,
  (value) => {
    if (value) onMute();
    else unMute();
  },
  { immediate: true }
);

watch(
  autoplay,
  (value) => {
    if (value) {
      onPlay();
      onMute();
    } else {
      onPause();
      unMute();
    }
  },
  { immediate: true }
);

const sourceUrl = computed(() => src?.value);

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
  sendPostMessage("setVolume", { volume });
}

function onSetSkinColor(color: string) {
  sendPostMessage("setSkinColor", { params: { color } });
}

function onRemove() {
  sendPostMessage("remove", {});
}

function onHandleEvent() {
  window.addEventListener("message", (event: MessageEvent<MessageToIframe>) => {
    const message = JSON.parse(event.data as unknown as string);
    onEmitEvent(message);
  });
}

function onEmitEvent(message: MessageToIframe) {
  switch (message.type) {
    case "player:init": {
      if (autoplay.value) {
        // Костыль, чтобы потом отловить в событие `player:currentTime` и запустить видео
        isPlaying.value = true;
      }
      break;
    }
    case "player:ready":
      isReady.value = true;
      emit("ready", isReady.value);
      break;
    case "player:changeState":
      emit(message.data.state, message.data.isLicensed);
      break;

    case "player:playComplete": {
      if (loop.value && src?.value) {
        const temp = src.value;
        src.value = temp;
        onPlay();
      }

      emit("playComplete");
      break;
    }
    case "player:currentTime":
      if (autoplay.value && isPlaying.value) {
        onPlay();
        onMute();

        isPlaying.value = false;
      }
      currentTime.value = message.data.time;
      emit("currentTime", message.data.time);
  }
}

defineExpose({
  playerRef,

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
