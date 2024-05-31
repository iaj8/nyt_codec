<script>
    import {
    ui_store
  } from "../../stores/store";
  import {
    init_sync_range_start,
    init_sync_range_end,
    sync_range_start,
    sync_range_end,
    sync_mode
  } from "../../stores/sync_time_store";
</script>

<button
    id="sync_mode_toggle"
    class="box text_level1 noselect {$sync_mode ? 'module_button_in_view' : '' }"
    style="color:{$sync_mode ? 'blue' : ''}"
    on:click={() => {
        $sync_mode = !$sync_mode;
        $sync_range_start = $init_sync_range_start;
        $sync_range_end = $init_sync_range_end;
        $ui_store.media_in_view = [];
    }}>
    <span
        style="color:{$sync_mode ? 'blue' : ''}"
    > 
        sync mode
    </span>
</button>

<style>
    span {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
    }

    button {
        margin-right: var(--font-size);
    }

    .module_button_in_view {
        color: white;
        border: 1px solid blue;
    }
</style>
