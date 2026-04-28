"""
services/scoring.py — GNE Site Selection Scoring Engine.

Implemented by: OPTIMIZATION_ENGINEER
Version: 1.0 | April 2026

Design contracts (OPTIMIZATION_ENGINEER):
  - All sub-scores are normalized to [0.0, 1.0].
  - Scoring dimensions map 1-to-1 to Analysis entity fields — no invented
    dimensions.
  - Higher traffic/foot_traffic → BETTER site  (score closer to 1.0).
  - Higher hazard severity     → WORSE  site   (inverted before combining).
  - Higher competing_business_count → WORSE site (score inverted).
  - Functions are stateless; all inputs are plain Python objects — no DB
    sessions, no ORM access.  DB interactions live in geo_queries.py and the
    router layer.
  - Pure Python; no external scoring libraries.

Hazard severity string → numeric mapping
  (case-insensitive; unrecognised values treated as 0):

    "low"     → 0.25
    "medium"  → 0.50
    "high"    → 0.75
    "extreme" → 1.00

Traffic score normalisation:
  The ERD stores traffic_score as VARCHAR (no numeric type specified).
  The engine coerces values to float when possible.  Records that cannot be
  coerced are silently dropped so a single dirty row does not ruin the score.

Competing-business normalisation:
  A *saturation point* of 20 businesses is used — at that count the raw
  density score saturates at 1.0 (worst).  The final score is inverted so
  that a market with fewer competitors earns a higher score.

  Saturation point rationale: chosen as a reasonable upper bound for a
  walkable 500 m retail radius in a Philippine urban setting.  This constant
  is exported as COMPETING_BUSINESS_SATURATION so callers can override it in
  tests or future configuration.

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

#: Count of nearby businesses at which the density score saturates at 1.0.
COMPETING_BUSINESS_SATURATION: int = 20

#: Sub-score at-or-above which a dimension is promoted to "pro".
PRO_THRESHOLD: float = 0.65

#: Sub-score at-or-below which a dimension is flagged as "con".
CON_THRESHOLD: float = 0.35

# Hazard severity string → raw hazard score (pre-inversion).
_SEVERITY_MAP: dict[str, float] = {
    "low": 0.25,
    "medium": 0.50,
    "high": 0.75,
    "extreme": 1.00,
}

# Human-readable label per scoring dimension used in pros/cons generation.
_DIMENSION_LABELS: dict[str, str] = {
    "traffic_score": "Overall traffic volume",
    "foot_traffic_score": "Pedestrian foot traffic",
    "competing_business_score": "Low competitor density",
    "landslide_hazard_score": "Landslide risk",
    "flood_hazard_score": "Flood risk",
    "storm_surge_score": "Storm surge risk",
}

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp *value* to [lo, hi]."""
    return max(lo, min(hi, value))


def _severities_to_score(records: list[Any], hazard_type_filter: str) -> float:
    """Convert a list of Hazard-like objects into a *normalised hazard score*.

    The hazard score represents the **risk level** (higher = more dangerous).
    Callers that want a site-suitability score must invert the result.

    Process:
      1. Filter records by hazard_type (case-insensitive).
      2. Map each severity string to a numeric value via ``_SEVERITY_MAP``.
      3. Return the *maximum* severity found (worst-case modelling).
         If no records match, return 0.0 (no detected hazard → safest).

    Args:
        records: Iterable of objects with ``hazard_type`` and ``severity``
            attributes (e.g. ``models.hazard.Hazard`` ORM instances).
        hazard_type_filter: The hazard type string to match (e.g.
            ``"landslide"``, ``"flood"``, ``"storm_surge"``).

    Returns:
        A float in [0.0, 1.0] representing the highest detected hazard
        intensity.  0.0 means no hazard; 1.0 means extreme hazard.
    """
    relevant = [
        r for r in records
        if (r.hazard_type or "").lower() == hazard_type_filter.lower()
    ]
    if not relevant:
        return 0.0

    worst = max(
        _SEVERITY_MAP.get((r.severity or "").lower(), 0.0)
        for r in relevant
    )
    return _clamp(worst)


def _coerce_traffic_score(value: Any) -> Optional[float]:
    """Coerce a raw traffic_score value to float, or return None on failure.

    The ERD stores traffic_score as VARCHAR.  This helper handles strings,
    ints, floats, and None gracefully.

    Args:
        value: Raw value from the ``TrafficData.traffic_score`` column.

    Returns:
        A float, or ``None`` if the value cannot be coerced.
    """
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def compute_scores(
    hazards: list[Any],
    traffic_data: list[Any],
    businesses: list[Any],
) -> dict[str, float]:
    """Compute all Analysis-entity sub-scores for a candidate site location.

    This is the primary scoring function.  It accepts plain lists of ORM
    objects (or any duck-typed objects with the appropriate attributes) and
    returns a dictionary of normalised sub-scores ready to be persisted to the
    ``Analysis`` table.

    Sub-score computation summary:
        - **traffic_score** — Mean of all numeric ``TrafficData.traffic_score``
          values normalised by their observed range (min-max scaling).  If
          fewer than two distinct values are present, defaults to 0.5
          (neutral).
        - **foot_traffic_score** — Same as traffic_score but restricted to
          records where ``traffic_type`` is ``"foot"`` (case-insensitive).
        - **competing_business_score** — Competitor density score derived from
          the count of nearby ``Business`` records.  Inverted so that fewer
          competitors → higher score.
        - **landslide_hazard_score** — Worst-case severity among Hazard records
          of type ``"landslide"``.  Inverted so lower risk → higher score.
        - **flood_hazard_score** — Same logic for ``"flood"`` hazards.
        - **storm_surge_score** — Same logic for ``"storm_surge"`` hazards.

    Args:
        hazards: List of Hazard ORM instances (attributes: ``hazard_type``,
            ``severity``).
        traffic_data: List of TrafficData ORM instances (attributes:
            ``traffic_score``, ``traffic_type``).
        businesses: List of Business ORM instances (attribute: ``category``).

    Returns:
        A ``dict[str, float]`` with the following keys, all values in
        [0.0, 1.0]:
            ``traffic_score``, ``foot_traffic_score``,
            ``competing_business_score``, ``landslide_hazard_score``,
            ``flood_hazard_score``, ``storm_surge_score``.
    """
    # ------------------------------------------------------------------
    # 1. traffic_score — all traffic records
    # ------------------------------------------------------------------
    all_traffic_values = [
        v for t in traffic_data
        if (v := _coerce_traffic_score(t.traffic_score)) is not None
    ]
    traffic_score = _normalise_traffic_list(all_traffic_values)

    # ------------------------------------------------------------------
    # 2. foot_traffic_score — only 'foot' traffic_type records
    # ------------------------------------------------------------------
    foot_values = [
        v for t in traffic_data
        if (t.traffic_type or "").lower() == "foot"
        and (v := _coerce_traffic_score(t.traffic_score)) is not None
    ]
    foot_traffic_score = _normalise_traffic_list(foot_values)

    # ------------------------------------------------------------------
    # 3. competing_business_score — density → inverted
    # ------------------------------------------------------------------
    count = len(businesses)
    raw_density = min(count / COMPETING_BUSINESS_SATURATION, 1.0)
    competing_business_score = _clamp(1.0 - raw_density)

    # ------------------------------------------------------------------
    # 4–6. Hazard scores — worst-case severity → inverted
    # ------------------------------------------------------------------
    landslide_risk = _severities_to_score(hazards, "landslide")
    flood_risk = _severities_to_score(hazards, "flood")
    storm_surge_risk = _severities_to_score(hazards, "storm_surge")

    landslide_hazard_score = _clamp(1.0 - landslide_risk)
    flood_hazard_score = _clamp(1.0 - flood_risk)
    storm_surge_score = _clamp(1.0 - storm_surge_risk)

    return {
        "traffic_score": traffic_score,
        "foot_traffic_score": foot_traffic_score,
        "competing_business_score": competing_business_score,
        "landslide_hazard_score": landslide_hazard_score,
        "flood_hazard_score": flood_hazard_score,
        "storm_surge_score": storm_surge_score,
    }


def _normalise_traffic_list(values: list[float]) -> float:
    """Min-max normalise a list of traffic score values to [0.0, 1.0].

    Strategy:
      - Empty list             → 0.5  (neutral; no data)
      - Single value           → 0.5  (cannot determine range; neutral)
      - All values identical   → 0.5  (degenerate range; neutral)
      - Otherwise              → (mean - min) / (max - min)

    Using the *mean* as the representative value (rather than raw max)
    prevents a single outlier record from dominating the score.

    Args:
        values: Pre-coerced list of numeric traffic scores.

    Returns:
        A float in [0.0, 1.0].
    """
    if not values:
        return 0.5

    lo = min(values)
    hi = max(values)

    if hi == lo:
        # Degenerate range: all records have the same score.
        # Normalise the uniform value into [0,1] using a known absolute
        # ceiling of 100 (a common 0-100 scale); fall back to 0.5 if that
        # also looks degenerate.
        if hi > 0:
            return _clamp(hi / 100.0) if hi <= 100 else 0.5
        return 0.5

    mean_val = sum(values) / len(values)
    return _clamp((mean_val - lo) / (hi - lo))


def compute_overall_score(
    sub_scores: dict[str, float],
    weights: Optional[dict[str, float]] = None,
) -> float:
    """Compute the weighted-average overall score from sub-scores.

    When *weights* is ``None`` or omitted, equal weights are applied across
    all keys present in *sub_scores*.

    Partial weight dicts are supported: any sub-score key absent from
    *weights* receives a weight of 1.0 (equal contribution) relative to
    the normalised weight sum.  This allows callers to bias specific
    dimensions (e.g. for restaurant-type customisation) without needing to
    supply a complete weight vector.

    Args:
        sub_scores: Dict of ``{dimension_name: score}`` where all scores
            are in [0.0, 1.0].  Typically the output of
            :func:`compute_scores`.
        weights: Optional dict of ``{dimension_name: weight}`` where weights
            are non-negative floats.  Keys not present default to ``1.0``.
            Pass ``None`` (or omit) for equal weighting.

    Returns:
        A float in [0.0, 1.0] representing the weighted overall score.
        Returns ``0.0`` if *sub_scores* is empty.

    Raises:
        ValueError: If all supplied weights normalise to zero (cannot divide).
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

    weighted_sum = sum(
        sub_scores[k] * resolved_weights[k] for k in sub_scores
    )
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
        overall_score: A float in [0.0, 1.0] (output of
            :func:`compute_overall_score`).

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
        - score ≥ :data:`PRO_THRESHOLD` (0.65) → dimension is a **pro**.
        - score ≤ :data:`CON_THRESHOLD` (0.35) → dimension is a **con**.
        - Scores between the two thresholds are neutral and omitted.

    Note on hazard dimensions: because hazard scores have already been
    *inverted* by :func:`compute_scores` (higher = safer), a high hazard
    score correctly appears as a pro ("Low flood risk") and a low hazard
    score appears as a con ("High flood risk").

    Args:
        sub_scores: Dict of ``{dimension_name: score}`` in [0.0, 1.0].
            Typically the output of :func:`compute_scores`.

    Returns:
        A dict with two keys:
            ``"pros"``: list of human-readable strength strings.
            ``"cons"``: list of human-readable weakness strings.
        Both lists may be empty if all scores are neutral.
    """
    pros: list[str] = []
    cons: list[str] = []

    _con_labels: dict[str, str] = {
        "traffic_score": "Low overall traffic volume",
        "foot_traffic_score": "Low pedestrian foot traffic",
        "competing_business_score": "High competitor density nearby",
        "landslide_hazard_score": "High landslide risk",
        "flood_hazard_score": "High flood risk",
        "storm_surge_score": "High storm surge risk",
    }

    for key, score in sub_scores.items():
        clamped = _clamp(score)
        label = _DIMENSION_LABELS.get(key, key.replace("_", " ").title())
        con_label = _con_labels.get(key, f"Poor {label.lower()}")

        if clamped >= PRO_THRESHOLD:
            pros.append(label)
        elif clamped <= CON_THRESHOLD:
            cons.append(con_label)

    return {"pros": pros, "cons": cons}
