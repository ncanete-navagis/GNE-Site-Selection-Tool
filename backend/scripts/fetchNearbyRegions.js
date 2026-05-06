import { fetchRestaurantTypesForRegion } from "../services/placesService.js";

async function test() {
    try {
        const result = await fetchRestaurantTypesForRegion("cebu");
        console.log("Returned types:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();