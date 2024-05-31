<script>
  import { 
    local_file_store,
    platform_config_store,
    ui_store
  } from "../../stores/store";
  import {
    init_sync_range_start,
    init_sync_range_end,
    init_sync_time,
    sync_range_start,
    sync_range_end,
    sync_time,
    sync_paused,
    sync_time_origin_UAR,
    sync_mode
  } from "../../stores/sync_time_store";

  import { onMount } from "svelte";
  import WaveSurfer from "wavesurfer.js";

  export let medium;

  let src;
  let used_filepath;
  let video_time = 0;
  let video_duration = 0;
  let video_seek_value = 0;
  let paused = true;
  let muted = false;
  let volume = 0.2;
  let wavesurfer;
  let waveformContainer;

  if (outside_current_sync(medium)) {
    block_opening(medium);
  } else {
    // 1: update sync time, when loading new media file
    update_sync_time(medium);
    update_sync_bounds(medium);
  }

  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      used_filepath = $local_file_store[medium.UAR].name;
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    used_filepath =
      medium[$platform_config_store["Title of column used for url"]];
    src = used_filepath;
  }

  let handleOnPlayButton = () => {
    console.log("play button");
    paused = !paused;

    if (paused !== $sync_paused) {
      console.log("--------------");
      console.log("sending pause/play", {
        origin: medium.UAR,
        sync_paused: false,
      });
      $sync_paused = paused;
      $sync_time_origin_UAR = medium.UAR;
    }

    // 2: update sync time, when play button on any media file is pressed
    update_sync_time(medium);

    // if (paused) {
    //   wavesurfer.pause();
    // } else {
    //   wavesurfer.play();
    // }
  };

  let handleOnSeekInteract = () => {
    console.log('handleOnSeekInteract');
    var vidTime = (video_duration * video_seek_value) / 100.0;
    video_time = vidTime;

    // 3: update sync time, when any media file is seeked
    update_sync_time(medium);

    // if (wavesurfer) {
    //   wavesurfer.seekTo(vidTime / video_duration);
    // }
  };

  let handleVideoOnTimeUpdate = () => {
    console.log('handleVideoOnTimeUpdate');
    video_seek_value = (video_time / video_duration) * 100;
    // 4: update sync time, when any media file is playing
    update_sync_time(medium);
  };

  let handleOnMuteButtonClick = () => {
    muted = !muted;
    if (wavesurfer) {
      if (muted) {
        wavesurfer.setVolume(0);
      } else {
        wavesurfer.setVolume(volume);
      }
    }
  };

  export function update_sync_time(medium) {
    let new_time = new Date(
      medium.start.getTime() + Math.floor(video_time * 1000)
    );
    if (new_time !== $sync_time) {
      // console.log("--------------");
      // console.log("sending seek", {
      //   origin: medium.UAR,
      //   sync_time: new_time,
      // });
      $sync_time = new_time;
      $sync_time_origin_UAR = medium.UAR;
      // $sync_paused = paused;
    }
  }

  export function update_sync_bounds(medium) {
    $sync_range_start = Math.min(medium.start.getTime(), $sync_range_start);
    $sync_range_end = Math.max(medium.end.getTime(), $sync_range_end);
  }

  function block_opening(medium) {
    $ui_store.media_in_view = $ui_store.media_in_view.filter(
      (exist_UAR) => exist_UAR !== medium.UAR
    );
    if (wavesurfer) {
      wavesurfer.destroy();
    }
  }

  export function outside_current_sync(medium) {
    if ($ui_store.media_in_view.length == 0 || 
      ($ui_store.media_in_view.length == 1 && $ui_store.media_in_view.includes(medium.UAR))) {
      return false;
    } else {
      // if any part of the duration of the media falls within current sync range it is inside the current sync,
      // so for it to be outside the current sync, return the negation of this condition
      return !(medium.start.getTime() < $sync_range_end && $sync_range_start < medium.end.getTime())
    }
  }

  sync_time.subscribe((sync_time) => {
    // if (
    //   $sync_time_origin_UAR !== medium.UAR &&
    //   sync_time.getTime() > medium.start.getTime() &&
    //   sync_time.getTime() < medium.end.getTime()
    // ) {
    //   // console.log("receiving seek", {
    //   //   origin: $sync_time_origin_UAR,
    //   //   receiver: medium.UAR,
    //   //   sync_time: sync_time,
    //   // });
    //   video_time = (sync_time.getTime() - medium.start.getTime()) / 1000;
    // }

    // update_custom_time(sync_time);
  });

  sync_paused.subscribe((sync_paused) => {
    if (
      $sync_time_origin_UAR !== medium.UAR &&
      $sync_time.getTime() > medium.start.getTime() &&
      $sync_time.getTime() < medium.end.getTime()
    ) {
      console.log("receiving pause", {
        origin: $sync_time_origin_UAR,
        receiver: medium.UAR,
        sync_paused: sync_paused,
      });
      paused = sync_paused;
    }
  });

  onMount(() => {
    if (waveformContainer) {
      // Initialize WaveSurfer
      console.log("Start wavesurfer");
      wavesurfer = WaveSurfer.create({
        container: waveformContainer,
        waveColor: "violet",
        progressColor: "purple",
        backend: 'MediaElement',
        mediaControls: true,
        responsive: true
      });

      wavesurfer.load(src);

      if (muted) {
        wavesurfer.setVolume(0);
      }

      wavesurfer.on('audioprocess', () => {
        video_time = wavesurfer.getCurrentTime();
      });

      wavesurfer.on('interaction', () => {
        // console.log("sync_time", $sync_time);
        video_time = wavesurfer.getCurrentTime();
      });
      
      wavesurfer.on('play', handleOnPlayButton);
      wavesurfer.on('pause', handleOnPlayButton);

    }
  });
</script>

{#if src !== null}
  {#if used_filepath.toLowerCase().includes("mp4") || used_filepath
      .toLowerCase()
      .includes("mov") || used_filepath.toLowerCase().includes("webm")}
    <div class="medium_video" id={medium.id}>
      <div class="video_wrapper">
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          {src}
          type="video/mp4"
          bind:currentTime={video_time}
          bind:duration={video_duration}
          bind:paused
          bind:muted
          bind:volume
          on:timeupdate={handleVideoOnTimeUpdate}
        />
        <div class="controls_bar">
          <button class="box text_level1" on:click={handleOnPlayButton}
            >{paused ? "Play" : "Pause"}</button
          >
          <input
            type="range"
            min="0"
            max="100"
            bind:value={video_seek_value}
            class="slider"
            on:input={handleOnSeekInteract}
          />
          <button class="box text_level1" on:click={handleOnMuteButtonClick}
            >{muted ? "Unmute" : "Mute"}</button
          >
          <input
            type="range"
            min="0"
            step="0.001"
            max="1"
            bind:value={volume}
            class="slider"
          />
        </div>
      </div>
    </div>
  {:else if used_filepath.includes("png") || used_filepath.includes("jpeg") || used_filepath.includes("jpg") || used_filepath.includes("webp")}
    <div class="medium_image" id={medium.id}>
      <!-- svelte-ignore a11y-missing-attribute -->
      <img {src} />
    </div>
  
  {:else if used_filepath.includes("mp3")}

  <div class="audio_wrapper">
    <div 
      bind:this="{waveformContainer}"
      id="waveform"
      wavesurfer
    >
    </div>
  </div>

  {/if}
{/if}

<style>
  .video_wrapper {
    width: 100%;
    max-height: 40vh;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  .audio_wrapper {
    width: 100%;
    max-height: 40vh;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  .medium_image {
    height: 40vh;
    display: flex;
    flex-flow: column;
    flex-direction: row;
    justify-content: center;
  }

  video {
    height: 30vh;
  }

  button {
    height: 10%;
  }

  #waveform {
    width: 100%;
    /* height: 100%; */
  }

  .controls_bar {
    display: flex;
    flex-flow: row nowrap;
  }

  :root {
    --seekbar-pre-color: rgb(80, 80, 80);
    --seekbar-post-color: rgb(201, 201, 201);
  }

  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    input[type="range"] {
      overflow: hidden;
      width: 80px;
      -webkit-appearance: none;
      background-color: var(--seekbar-post-color);
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 10px;
      -webkit-appearance: none;
      color: var(--seekbar-pre-color);
    }

    input[type="range"]::-webkit-slider-thumb {
      width: 10px;
      -webkit-appearance: none;
      height: 10px;
      cursor: ew-resize;
      background: #434343;
      box-shadow: -80px 0 0 80px var(--seekbar-pre-color);
    }
  }
  /** FF*/
  input[type="range"]::-moz-range-progress {
    background-color: var(--seekbar-pre-color);
  }
  input[type="range"]::-moz-range-track {
    background-color: var(--seekbar-post-color);
  }
  /* IE*/
  input[type="range"]::-ms-fill-lower {
    background-color: var(--seekbar-pre-color);
  }
  input[type="range"]::-ms-fill-upper {
    background-color: var(--seekbar-post-color);
  }

  /* .alert-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1rem;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    animation: flash 1s ease-in-out;
    z-index: 9999;
  } */
</style>
