// testRestaurants.js

import dotenv from "dotenv";
import { discoverRestaurants } from "../services/restaurantService.js";

dotenv.config();

async function runTest() {
    try {
        // Change region depending on your REGION_CONFIG keys
        const region = "Cebu";

        // Optional filters:
        // Examples:
        // "japanese_restaurant"
        // "cafe"
        // "seafood_restaurant"
        // Leave empty/null for all restaurants
        const filters = "";

        console.log(`Testing Places API for region: ${region}`);

        const restaurants = await discoverRestaurants(region, filters);

        console.log(`Found ${restaurants.length} restaurants\n`);

        restaurants.forEach((r, index) => {
            console.log(`${index + 1}. ${r.name}`);
            console.log(`   Rating: ${r.rating ?? "N/A"}`);
            console.log(`   Address: ${r.address}`);
            console.log(`   Types: ${r.types.join(", ")}`);
            console.log(`   Coordinates: ${r.lat}, ${r.lng}`);
            console.log(`   Place ID: ${r.id}`);
            console.log("-----------------------------------");
        });

    } catch (error) {
        console.error("Error testing Places API:");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

runTest();