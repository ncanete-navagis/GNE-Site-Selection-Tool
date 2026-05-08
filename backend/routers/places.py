from flask import Blueprint, request, jsonify
from ..services.placesService import fetchRestaurantTypesForRegion
from ..services.restaurantService import discoverRestaurants

router = Blueprint("places", __name__)

@router.route("/restaurant-types", methods=["GET"])
def get_restaurant_types():
    region = request.args.get("region")
    
    if not region:
        region = "Cebu"

    normalizedRegion = region.lower()

    if normalizedRegion != "cebu" and normalizedRegion != "manila":
        return jsonify({"error": "Invalid region. Only 'Cebu' or 'Manila' are accepted."}), 400

    try:
        types = fetchRestaurantTypesForRegion(normalizedRegion)
        return jsonify({
            "region": normalizedRegion.capitalize(),
            "types": types
        })
    except Exception as err:
        return jsonify({"error": str(err)}), 500

@router.route("/restaurants", methods=["GET"])
def get_restaurants():
    region = request.args.get("region")
    filters = request.args.get("filters")
    
    if not region:
        region = "Cebu"

    normalizedRegion = region[0].upper() + region[1:].lower()

    if normalizedRegion != "Cebu" and normalizedRegion != "Manila":
        return jsonify({"error": "Invalid region. Only 'Cebu' or 'Manila' are accepted."}), 400

    try:
        restaurants = discoverRestaurants(normalizedRegion, filters)
        return jsonify({
            "region": normalizedRegion,
            "restaurants": restaurants
        })
    except Exception as err:
        return jsonify({"error": str(err)}), 500
