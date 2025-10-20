import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        console.log("MapUpdater đang cập nhật:", position);
        if (position && map) {
            map.setView(position, 15);
        }
    }, [position, map]);

    return null;
};

export default MapUpdater;