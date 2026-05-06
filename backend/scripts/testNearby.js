import { fetchNearbyPlaces } from "../services/placesService.js";

async function test() {
    try {
        // Cebu City center
        const lat = 10.3157;
        const lng = 123.8854;

        const results = await fetchNearbyPlaces(lat, lng);
        console.log("NEARBY RESULTS:\n", JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);
    }
}

test();