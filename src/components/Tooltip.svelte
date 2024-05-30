<script>
  import {
    media_store_filtered,
    ui_store,
    platform_config_store,
  } from "../stores/store";

  import {
    sync_time,
    sync_paused,
    sync_time_origin_UAR
  } from "../stores/sync_time_store";

  export let mouse_xy;
  let tooltip, hovered_UAR, hovered_media, hovered_corrected_time, mediumVideoComponent;

  // replace this with a properly done import from MediumVideo
  function outside_current_sync(medium) {
    if ($ui_store.media_in_view.length == 0 || 
      ($ui_store.media_in_view.length == 1 && $ui_store.media_in_view.includes(medium.UAR))) {
      return false;
    } else {
      return $sync_time.getTime() < medium.start.getTime() ||
        $sync_time.getTime() > medium.end.getTime();
    }
  }

  $: {
    hovered_UAR = $ui_store.media_hovered[0];
    hovered_media = $media_store_filtered[hovered_UAR];
    if (hovered_media) {
      const dateOptions = {
        timeZone: "UTC",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      const dateFormatter = new Intl.DateTimeFormat("en-UK", dateOptions);
      try {
        hovered_media.start_string_utc = dateFormatter.format(
          hovered_media.start
        );
      } catch {
        hovered_media.start_string_utc = "not available";
      }
    }
  }

  let overflow_compensate_class = "";
  $: {
    let tooltip_will_overflow_vertical =
      tooltip?.clientHeight + mouse_xy.y > document.body.clientHeight;
    let tooltip_will_overflow_horizontal =
      tooltip?.clientWidth + mouse_xy.x > document.body.clientWidth;
    let tooltip_will_overflow_both =
      tooltip_will_overflow_vertical && tooltip_will_overflow_horizontal;

    if (tooltip_will_overflow_both) {
      overflow_compensate_class = "translate_left_up";
    } else if (tooltip_will_overflow_horizontal) {
      overflow_compensate_class = "translate_left";
    } else if (tooltip_will_overflow_vertical) {
      overflow_compensate_class = "translate_up";
    } else {
      overflow_compensate_class = "";
    }
  }
</script>

{#if hovered_media}
  <table
    id="tooltip"
    style="top:{mouse_xy.y}px; left:{mouse_xy.x}px"
    bind:this={tooltip}
    class={"box text_level2 " + overflow_compensate_class}
  >
    <tr>
      <td>UAR</td>
      <td>{hovered_UAR}</td>
    </tr>
    <tr>
      <td>duration</td>
      <td
        >{hovered_media[
          $platform_config_store["Title of column used for duration"]
        ]}</td
      >
    </tr>
    <tr>
      <td>date</td>
      <td
        >{hovered_media[
          $platform_config_store["Title of column used for chronolocation"]
        ].slice(0, 11)}</td
      >
    </tr>
    <tr>
      <td>time estimate</td>
      <td>{hovered_media.start_string_utc}</td>
    </tr>
    <tr>
      <td>latitude</td>
      <td>{hovered_media.lat}</td>
    </tr>
    <tr>
      <td>longitude</td>
      <td>{hovered_media.long}</td>
    </tr>
    {#if outside_current_sync(hovered_media)}
      <div class="overlay">
        <div class="overlay_text"> Can't open, outside current sync time. </div>
      </div>
    {/if}
  </table>

{/if}

<style>
  #tooltip {
    z-index: 3;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background: black;
    width: 250px;
    color: white;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3;
  }

  tr > td:first-child {
    color: var(--grey2);
    text-transform: uppercase;
  }

  .translate_left {
    transform: translateX(-100%);
  }

  .translate_up {
    transform: translateY(-100%);
  }

  .translate_left_up {
    transform: translate(-100%, -100%);
  }
</style>
