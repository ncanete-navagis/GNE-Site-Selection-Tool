import pytest
from services.scoring import (
    compute_scores,
    score_to_stars,
    generate_pros_cons,
    compute_overall_score
)

class MockHazard:
    def __init__(self, hazard_type: str, severity: str):
        self.hazard_type = hazard_type
        self.severity = severity

class MockTraffic:
    def __init__(self, traffic_score, traffic_type=""):
        self.traffic_score = traffic_score
        self.traffic_type = traffic_type

class MockBusiness:
    def __init__(self, category=""):
        self.category = category

def test_compute_scores_keys():
    """Verify compute_scores returns all expected sub-score keys and values are in [0.0, 1.0]."""
    # Create some mock data
    hazards = [MockHazard("landslide", "high")]
    traffic = [MockTraffic(80, "foot"), MockTraffic(60, "vehicle")]
    businesses = [MockBusiness() for _ in range(5)]
    
    scores = compute_scores(hazards, traffic, businesses)
    
    # Check for the expected sub-scores (6 keys based on current implementation)
    expected_keys = {
        "traffic_score",
        "foot_traffic_score",
        "competing_business_score",
        "landslide_hazard_score",
        "flood_hazard_score",
        "storm_surge_score"
    }
    
    for key in expected_keys:
        assert key in scores, f"Missing key: {key}"
        assert 0.0 <= scores[key] <= 1.0, f"Value out of bounds for {key}: {scores[key]}"

def test_score_to_stars_boundaries():
    """Verify score_to_stars() maps correctly for boundary values."""
    assert score_to_stars(0.0) == 1
    assert score_to_stars(0.19) == 1
    assert score_to_stars(0.20) == 2
    assert score_to_stars(0.39) == 2
    assert score_to_stars(0.40) == 3
    assert score_to_stars(0.59) == 3
    assert score_to_stars(0.60) == 4
    assert score_to_stars(0.79) == 4
    assert score_to_stars(0.80) == 5
    assert score_to_stars(1.0) == 5
    assert score_to_stars(1.5) == 5 # test clamping
    assert score_to_stars(-0.5) == 1 # test clamping

def test_generate_pros_cons_extreme_values():
    """Verify generate_pros_cons() returns non-empty lists when scores are extreme."""
    # Sub-score >= 0.65 is pro, <= 0.35 is con.
    extreme_scores = {
        "traffic_score": 0.9, # pro
        "foot_traffic_score": 0.2, # con
        "competing_business_score": 0.1, # con
        "landslide_hazard_score": 0.8, # pro (low risk)
        "flood_hazard_score": 0.5, # neutral
        "storm_surge_score": 0.0 # con (extreme risk)
    }
    
    result = generate_pros_cons(extreme_scores)
    
    assert len(result["pros"]) > 0
    assert len(result["cons"]) > 0
    
    # Specifically, traffic_score(0.9) and landslide_hazard_score(0.8) are pros
    assert "Overall traffic volume" in result["pros"]
    assert "Landslide risk" in result["pros"]
    
    # foot_traffic(0.2), competing_business(0.1), storm_surge(0.0) are cons
    assert "Low pedestrian foot traffic" in result["cons"]
    assert "High competitor density nearby" in result["cons"]
    assert "High storm surge risk" in result["cons"]
