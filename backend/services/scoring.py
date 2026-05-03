"""
services/scoring.py — GNE Site Selection Scoring Engine.

Implemented by: OPTIMIZATION_ENGINEER / API_SPECIALIST
Version: 2.0 | May 2026 (Prompt C integration — aligned with Earl's actual DB schema)

Data source mapping (what geo_queries.py actually returns):
  hazards  → list[dict] from get_hazards_near_point()
             each dict has a "hazard_type" key = "flood" | "landslide" | "storm_surge"
  buildings → list of CebuBuilding/ManilaBuilding ORM instances from get_buildings_near_point()
  traffic_data → always [] (stub — traffic table not in Earl's schema)

Scoring design contracts:
  - All sub-scores are normalised to [0.0, 1.0].
  - Higher hazard count  → MORE dangerous  → lower score (inverted).
  - Higher building count → MORE competitors → lower score (inverted).
  - Traffic / foot-traffic scores are 0.5 neutral stubs.
  - Functions are stateless; no DB sessions, no ORM access.

Saturation points:
  Hazard:   5 records saturate the risk to 1.0 → score 0.0
  Building: 20 records saturate the density  → score 0.0

Star-rating thresholds (overall_score → stars):
    [0.00, 0.20) → 1 ★
    [0.20, 0.40) → 2 ★
    [0.40, 0.60) → 3 ★
    [0.60, 0.80) → 4 ★
    [0.80, 1.00] → 5 ★

Pros/cons thresholds:
  A sub-score ≥ 0.65 is considered a pro; ≤ 0.35 is considered a con.
"""

from __future__ import annotations

from typing import Any, Optional

# ---------------------------------------------------------------------------
# Public constants (importable for testing / future config overrides)
# ---------------------------------------------------------------------------

#: Count of nearby hazard records at which the risk saturates at 1.0 → score 0.0
HAZARD_SATURATION: int = 5

#: Count of nearby competing businesses at which the density saturates → score 0.0
COMPETING_BUSINESS_SATURATION: int = 20

#: Sub-score at-or-above which a dimension is promoted to "pro".
PRO_THRESHOLD: float = 0.65

#: Sub-score at-or-below which a dimension is flagged as "con".
CON_THRESHOLD: float = 0.35

# Human-readable label per scoring dimension used in pros/cons generation.
_DIMENSION_LABELS: dict[str, str] = {
    "flood_hazard_score":        "Flood risk",
    "landslide_hazard_score":    "Landslide risk",
    "storm_surge_score":         "Storm surge risk",
    "competing_business_score":  "Nearby competition",
    "traffic_score":             "Vehicle traffic",      # note: estimated
    "foot_traffic_score":        "Foot traffic",         # note: estimated
}

# Human-readable con labels per dimension (used when score is low).
_CON_LABELS: dict[str, str] = {
    "flood_hazard_score":        "High flood risk",
    "landslide_hazard_score":    "High landslide risk",
    "storm_surge_score":         "High storm surge risk",
    "competing_business_score":  "High nearby competition",
    "traffic_score":             "Low vehicle traffic (estimated)",
    "foot_traffic_score":        "Low foot traffic (estimated)",
}

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp *value* to [lo, hi]."""
    return max(lo, min(hi, value))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def compute_scores(
    hazards: list[Any],
    buildings: list[Any],
    traffic_data: list[Any],
) -> dict[str, float]:
    """Compute all Analysis-entity sub-scores for a candidate site location.

    Args:
        hazards: list[dict] from get_hazards_near_point().
                 Each dict must contain a "hazard_type" key with value
                 "flood", "landslide", or "storm_surge".
        buildings: List of CebuBuilding/ManilaBuilding ORM instances from
                   get_buildings_near_point().  Only the count is used.
        traffic_data: Result of get_traffic_near_point() — currently always [].
                      Ignored; scores default to 0.5 neutral stub.

    Returns:
        A dict[str, float] with keys:
            flood_hazard_score, landslide_hazard_score, storm_surge_score,
            competing_business_score, traffic_score, foot_traffic_score.
        All values are in [0.0, 1.0].
    """
    # ------------------------------------------------------------------
    # 1. flood_hazard_score
    #    Count flood-type hazard records → invert against saturation of 5
    # ------------------------------------------------------------------
    flood_count = sum(
        1 for h in hazards if (h.get("hazard_type") if isinstance(h, dict) else getattr(h, "hazard_type", None)) == "flood"
    )
    flood_hazard_score = max(0.0, 1.0 - (flood_count / HAZARD_SATURATION))

    # ------------------------------------------------------------------
    # 2. landslide_hazard_score
    #    Count landslide-type hazard records → invert against saturation of 5
    # ------------------------------------------------------------------
    landslide_count = sum(
        1 for h in hazards if (h.get("hazard_type") if isinstance(h, dict) else getattr(h, "hazard_type", None)) == "landslide"
    )
    landslide_hazard_score = max(0.0, 1.0 - (landslide_count / HAZARD_SATURATION))

    # ------------------------------------------------------------------
    # 3. storm_surge_score
    #    Count storm-surge-type hazard records → invert against saturation of 5
    # ------------------------------------------------------------------
    storm_count = sum(
        1 for h in hazards if (h.get("hazard_type") if isinstance(h, dict) else getattr(h, "hazard_type", None)) == "storm_surge"
    )
    storm_surge_score = max(0.0, 1.0 - (storm_count / HAZARD_SATURATION))

    # ------------------------------------------------------------------
    # 4. competing_business_score
    #    Count CebuBuilding/ManilaBuilding instances → invert against saturation of 20
    # ------------------------------------------------------------------
    biz_count = len(buildings)
    competing_business_score = max(0.0, 1.0 - (biz_count / COMPETING_BUSINESS_SATURATION))

    # ------------------------------------------------------------------
    # 5. traffic_score — STUB
    #    Traffic data table not in Earl's schema. Returns 0.5 neutral.
    # ------------------------------------------------------------------
    # STUB: traffic_data table not in Earl's schema. Remove when available.
    traffic_score: float = 0.5

    # ------------------------------------------------------------------
    # 6. foot_traffic_score — STUB
    #    No foot traffic data source available. Returns 0.5 neutral.
    # ------------------------------------------------------------------
    # STUB: no foot traffic data source available.
    foot_traffic_score: float = 0.5

    return {
        "flood_hazard_score":       _clamp(flood_hazard_score),
        "landslide_hazard_score":   _clamp(landslide_hazard_score),
        "storm_surge_score":        _clamp(storm_surge_score),
        "competing_business_score": _clamp(competing_business_score),
        "traffic_score":            traffic_score,
        "foot_traffic_score":       foot_traffic_score,
    }


def compute_overall_score(
    sub_scores: dict[str, float],
    weights: Optional[dict[str, float]] = None,
) -> float:
    """Compute the weighted-average overall score from sub-scores.

    When *weights* is None or omitted, equal weights are applied across
    all keys present in *sub_scores*.

    Args:
        sub_scores: Dict of {dimension_name: score} where all scores are in
                    [0.0, 1.0].  Typically the output of compute_scores().
        weights: Optional dict of {dimension_name: weight}.  Keys not present
                 default to 1.0.  Pass None for equal weighting.

    Returns:
        A float in [0.0, 1.0].  Returns 0.0 if sub_scores is empty.

    Raises:
        ValueError: If all supplied weights normalise to zero.
    """
    if not sub_scores:
        return 0.0

    resolved_weights = {k: (weights.get(k, 1.0) if weights else 1.0) for k in sub_scores}

    total_weight = sum(resolved_weights.values())
    if total_weight == 0.0:
        raise ValueError(
            "compute_overall_score: weight vector sums to zero — "
            "at least one dimension must have a positive weight."
        )

    weighted_sum = sum(sub_scores[k] * resolved_weights[k] for k in sub_scores)
    return _clamp(weighted_sum / total_weight)


def score_to_stars(overall_score: float) -> int:
    """Map a normalised overall score to a 1–5 star rating.

    Thresholds (inclusive lower bound):
        [0.00, 0.20) → 1 ★
        [0.20, 0.40) → 2 ★
        [0.40, 0.60) → 3 ★
        [0.60, 0.80) → 4 ★
        [0.80, 1.00] → 5 ★

    Args:
        overall_score: A float in [0.0, 1.0].

    Returns:
        An integer in [1, 5].
    """
    clamped = _clamp(overall_score)
    if clamped >= 0.80:
        return 5
    if clamped >= 0.60:
        return 4
    if clamped >= 0.40:
        return 3
    if clamped >= 0.20:
        return 2
    return 1


def generate_pros_cons(sub_scores: dict[str, float]) -> dict[str, list[str]]:
    """Generate a human-readable pros/cons list from sub-scores.

    Classification rules:
        - score >= PRO_THRESHOLD (0.65) → dimension is a pro.
        - score <= CON_THRESHOLD (0.35) → dimension is a con.
        - Scores between the two thresholds are neutral and omitted.

    Note on hazard dimensions: because hazard scores are already inverted
    (higher = safer), a high hazard score correctly appears as a pro
    (e.g. "Flood risk" with high score = low flood risk = good) and a
    low hazard score appears as a con.

    Args:
        sub_scores: Dict of {dimension_name: score} in [0.0, 1.0].
            Typically the output of compute_scores().

    Returns:
        A dict with two keys:
            "pros": list of human-readable strength strings.
            "cons": list of human-readable weakness strings.
        Both lists may be empty if all scores are neutral.
    """
    pros: list[str] = []
    cons: list[str] = []

    for key, score in sub_scores.items():
        clamped = _clamp(score)
        label = _DIMENSION_LABELS.get(key, key.replace("_", " ").title())
        con_label = _CON_LABELS.get(key, f"Poor {label.lower()}")

        if clamped >= PRO_THRESHOLD:
            pros.append(label)
        elif clamped <= CON_THRESHOLD:
            cons.append(con_label)

    return {"pros": pros, "cons": cons}
