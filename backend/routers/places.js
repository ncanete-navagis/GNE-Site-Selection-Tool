import express from "express";
import { fetchRestaurantTypesForRegion } from "../services/placesService.js";

const router = express.Router();

router.get("/restaurant-types", async (req, res) => {
    let region = req.query.region;
    
    if (!region) {
        region = "Cebu";
    }

    const normalizedRegion = region.toLowerCase();

    if (normalizedRegion !== "cebu" && normalizedRegion !== "manila") {
        return res.status(400).json({ error: "Invalid region. Only 'Cebu' or 'Manila' are accepted." });
    }

    try {
        const types = await fetchRestaurantTypesForRegion(normalizedRegion);
        res.json({
            region: normalizedRegion.charAt(0).toUpperCase() + normalizedRegion.slice(1),
            types: types
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;