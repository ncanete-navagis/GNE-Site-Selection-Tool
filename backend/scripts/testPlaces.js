// /backend/scripts/testPlaces.js
import { fetchPlacesByText } from "../services/placesService.js";

async function test() {
    try {
        const results = await fetchPlacesByText("restaurants in Cebu City");
        console.log("RESULTS:\n", JSON.stringify(results, null, 2));
    } catch (err) {
        console.error(
            "ERROR:",
            err.response?.data || err.message
        );
    }
}

test();