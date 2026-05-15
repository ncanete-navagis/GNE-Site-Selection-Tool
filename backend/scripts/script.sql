-- first

-- ── ph_barangays ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ph_barangays_geometry_gist
ON ph_barangays USING GIST (geometry);

-- ── combined_flood_hazards ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geometry_gist
ON combined_flood_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geog_gist
ON combined_flood_hazards USING GIST ((geometry::geography));

-- ── combined_landslide_hazards ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geometry_gist
ON combined_landslide_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geog_gist
ON combined_landslide_hazards USING GIST ((geometry::geography));

-- ── combined_storm_surge_hazards ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geometry_gist
ON combined_storm_surge_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geog_gist
ON combined_storm_surge_hazards USING GIST ((geometry::geography));

-- ── cebu_buildings ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geom_gist
ON cebu_buildings USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geog_gist
ON cebu_buildings USING GIST ((geom::geography));

CREATE INDEX IF NOT EXISTS idx_cebu_buildings_amenity
ON cebu_buildings USING btree (amenity);

-- ── manila_buildings ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_manila_buildings_geom_gist
ON manila_buildings USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_manila_buildings_geog_gist
ON manila_buildings USING GIST ((geom::geography));

CREATE INDEX IF NOT EXISTS idx_manila_buildings_amenity
ON manila_buildings USING btree (amenity);

-- second
    