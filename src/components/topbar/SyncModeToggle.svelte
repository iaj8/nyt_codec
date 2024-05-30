<script>
  import { sync_mode } from "../../stores/sync_time_store";
</script>

<button
    id="sync_mode_toggle"
    class="box text_level1 noselect {$sync_mode ? 'module_button_in_view' : '' }"
    style="color:{$sync_mode ? 'white' : ''}"
    on:click={() => {
        $sync_mode = !$sync_mode;
        console.log($sync_mode);
    }}>
    <span> 
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
        border: 1px solid white;
    }
</style>
