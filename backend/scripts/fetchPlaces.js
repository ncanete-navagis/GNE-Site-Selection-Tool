import dotenv from "dotenv";
import { fetchNearbyPlaces } from "../services/placesService.js";

dotenv.config();

const CEBU = {
    lat: 10.3157,
    lng: 123.8854,
};

async function run() {
    const places = await fetchNearbyPlaces(CEBU.lat, CEBU.lng);

    const typesSet = new Set();

    places.forEach((place) => {
        place.types?.forEach((t) => typesSet.add(t));
    });

    console.log([...typesSet]);
}

run();