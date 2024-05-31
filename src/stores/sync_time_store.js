import { writable } from "svelte/store";

export const init_sync_range_start = writable(new Date());
export const init_sync_range_end = writable(new Date());
export const init_sync_time = writable(new Date());

export const sync_range_start = writable(new Date());
export const sync_range_end = writable(new Date());
export const sync_time = writable(new Date());
export const sync_paused = writable(true);
export const sync_time_origin_UAR = writable(null);
export const sync_mode = writable(true);
export const sync_time_origin_type = writable("");