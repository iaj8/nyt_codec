<script>
    import {
        ui_store,
        media_store_filtered
    } from "../../stores/store";

    function createKML(data) {
        const header = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
            <Document>
                <name>Exported KML</name>`;
                
        const footer = `</Document>
        </kml>`;
        
        const placemarks = Object.keys(data).filter(key => {
            const point = data[key];
            return point.lat !== undefined && point.long !== undefined;
        }).map(key => {
            const point = data[key];
            return `
            <Placemark>
                <name>${key}</name>
                <Point>
                    <coordinates>${point.long},${point.lat},0</coordinates>
                </Point>
            </Placemark>`;
        }).join('');
        
        return header + placemarks + footer;
    }

    function exportToKML(data) {
        const kmlContent = createKML(data);
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);


        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const dateTime = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

        const filename = `placemarks_${dateTime}.kml`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
</script>

<button
    id="download_kml_button"
    class="box text_level1 noselect module_button_in_view"
    on:click={() => {
        exportToKML($media_store_filtered);
    }}>
    <span> 
        Download KML
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
