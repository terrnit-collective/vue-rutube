# vue-rutube
Integrate the Rutube Iframe player into your Vue 3 app



Here's a README document based on the provided TypeScript types for the Rutube player messaging system. This document includes sections on the usage of each message type, along with examples:

---

## Table of Contents

- [Player Message Types](#player-message-types)
- [Base Message Structure](#base-message-structure)
- [Message Types](#message-types)
  - [Initialization and Readiness](#initialization-and-readiness)
  - [Playback Control messages](#playback-control-messages)
  - [Volume and Current Time Messages](#volume-and-current-time-messages)
  - [Video Change Messages](#video-change-messages)
  - [Seeking Messages](#seeking-messages)
  - [Fullscreen Change Message](#fullscreen-change-message)
  - [Error Messages](#error-messages)
  - [Roll State Messages](#roll-state-messages)
  - [Duration Change Messages](#duration-change-messages)
  - [State Change Messages](#state-change-messages)
- [Usage Guidelines](#usage-guidelines)

## Player Message Types

The following types represent the different message types that can be sent to and from the player:

```typescript
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
```

## Base Message Structure

Each message follows the same base structure defined by the `PlayerMessageFabric` interface. Here's the structure:

```typescript
interface PlayerMessageFabric<T = any, M extends PlayerMessageType = null> {
  type: PlayerMessageTypeBuilder<M>;
  data: T;
}
```

## Message Types

### Initialization and Readiness

#### Init Message
- **Type:** `init`
- **Data:** An empty object.
  
```typescript
type InitMessage = PlayerMessageFabric<{}, "init">;
```

#### Ready Message
- **Type:** `ready`
- **Data:** An empty object.

```typescript
type ReadyMessage = PlayerMessageFabric<{}, "ready">;
```

### Playback Control Messages

#### Play Message
- **Type:** `play`
- **Data:** An empty object.

```typescript
type PlayMessage = PlayerMessageFabric<{}, "play">;
```

#### Pause Message
- **Type:** `pause`
- **Data:** An empty object.

```typescript
type PauseMessage = PlayerMessageFabric<{}, "pause">;
```

#### Stop Message
- **Type:** `stop`
- **Data:** An empty object.

```typescript
type StopMessage = PlayerMessageFabric<{}, "stop">;
```

#### Mute Message
- **Type:** `mute`
- **Data:** An empty object.

```typescript
type MuteMessage = PlayerMessageFabric<{}, "mute">;
```

#### Unmute Message
- **Type:** `unMute`
- **Data:** An empty object.

```typescript
type UnmuteMessage = PlayerMessageFabric<{}, "unMute">;
```

### Volume and Current Time Messages

#### Set Volume Message
- **Type:** `setVolume`
- **Data:** Contains a `volume` field (0 to 1).

```typescript
interface VolumeChangeData {
  volume: number; // 0 to 1
}
type VolumeChangeMessage = PlayerMessageFabric<VolumeChangeData, "setVolume">;
```

#### Set Current Time Message
- **Type:** `currentTime`
- **Data:** Contains a `time` field in seconds.

```typescript
interface CurrentTimeData {
  time: number; // time in seconds to set
}
type CurrentTimeMessage = PlayerMessageFabric<CurrentTimeData, "currentTime">;
```

### Video Change Messages

#### Change Video Message
- **Type:** `changeVideo`
- **Data:** Includes `id` and optional parameters such as `hash`, `p` (private key), and `quality`.

```typescript
interface ChangeVideoData {
  id: string;
  params?: {
    hash?: string;
    p?: string; // private key
    quality?: number; // 1 for highest, -2 for lowest
  };
}
type ChangeVideoMessage = PlayerMessageFabric<ChangeVideoData, "changeVideo">;
```

### Seeking Messages

#### Relatively Seek Message
- **Type:** `relativelySeek`
- **Data:** Contains `time` in seconds to seek.

```typescript
interface RelativelySeekData {
  time: number; // seconds to seek
}
type RelativelySeekMessage = PlayerMessageFabric<RelativelySeekData, "relativelySeek">;
```

### Fullscreen Change Message

#### Change Fullscreen Message
- **Type:** `changeFullscreen`
- **Data:** Contains `isFullscreen` (true or false).

```typescript
interface ChangeFullscreenData {
  isFullscreen: boolean; // true or false
}
type ChangeFullscreenMessage = PlayerMessageFabric<ChangeFullscreenData, "changeFullscreen">;
```

### Error Messages

#### Error Message
- **Type:** `error`
- **Data:** Contains an error code and text.

```typescript
interface ErrorData {
  code: string; // error code
  text: string; // error message
}
type ErrorMessage = PlayerMessageFabric<ErrorData, "error">;
```

### Roll State Messages

#### Roll State Message
- **Type:** `rollState`
- **Data:** Contains `rollState`, `state`, and `guid`.

```typescript
interface RollStateData {
  rollState: "preRoll" | "pauseBanner" | "postRoll" | "midRoll" | "pauseRoll" | "overlay";
  state: "play" | "complete";
  guid: string;
}
type RollStateMessage = PlayerMessageFabric<RollStateData, "rollState">;
```

### Duration Change Messages

#### Duration Change Message
- **Type:** `durationChange`
- **Data:** Contains the duration of the video in seconds.

```typescript
interface DurationChangeData {
  duration: number; // duration in seconds
}
type DurationChangeMessage = PlayerMessageFabric<DurationChangeData, "durationChange">;
```

### State Change Messages

#### Change State Message
- **Type:** `changeState`
- **Data:** Contains the new state and whether it's licensed.

```typescript
export type ChangeState = "playing" | "paused" | "stopped" | "lockScreenOn" | "lockScreenOff";

interface ChangeStateData {
  state: ChangeState;
  isLicensed: boolean;
}
type ChangeStateMessage = PlayerMessageFabric<ChangeStateData, "changeState">;
```

## Usage Guidelines

These message types are meant to facilitate communication with the Rutube player. When sending a message, ensure that you format the `data` field according to the specific type you've chosen. Here's an example of sending a play message:

```typescript
const playMessage: PlayMessage = {
  type: "player:play",
  data: {}
};

// Send the message to the player
player.postMessage(JSON.stringify(playMessage), '*');
```

Customize the implementation according to your project's requirements, ensuring that you handle responses appropriately.

---

Feel free to adjust any sections to better match your project's style or details! 
