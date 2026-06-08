"""Plain-function tools the agent calls over the local car catalog.

Docstrings matter: ADK passes them to Gemini as the tool descriptions.
"""
from . import catalog

_MINIMAL_KEYS = ("id", "make", "model", "year", "price", "fuel")


def list_cars() -> list[dict]:
    """List every car in the AutoHub catalog with minimal fields
    (id, make, model, year, price, fuel). Use this to map a car name the
    user typed to its catalog id before calling other tools."""
    return [{k: c.get(k) for k in _MINIMAL_KEYS} for c in catalog.all_cars()]


def get_car_facts(car_id: str) -> dict:
    """Return the full spec sheet for one car by its catalog id (e.g.
    'tesla-model-3'). Includes engine, transmission, drivetrain, tyres, fuel,
    range, brakes, power, 0-60, top speed, price, seats, boot space, ADAS.
    Returns {'error': ...} if the id is unknown."""
    car = catalog.by_id(car_id)
    if car is None:
        return {"error": f"No car with id '{car_id}'. Call list_cars first."}
    return car


def search_cars(
    fuel: str | None = None,
    max_price: int | None = None,
    min_seats: int | None = None,
) -> list[dict]:
    """Find catalog cars matching optional filters, for recommendations.
    - fuel: case-insensitive substring of the fuel type (e.g. 'electric', 'hybrid').
    - max_price: only cars at or below this USD price.
    - min_seats: only cars seating at least this many passengers.
    Returns minimal records (id, make, model, year, price, fuel, priceNum,
    passengers). Returns all cars if no filters are given."""
    results = []
    for c in catalog.all_cars():
        if fuel and fuel.lower() not in str(c.get("fuel", "")).lower():
            continue
        if max_price is not None:
            pn = c.get("priceNum")
            if pn is None or pn > max_price:
                continue
        if min_seats is not None and (c.get("passengers") or 0) < min_seats:
            continue
        results.append(
            {
                **{k: c.get(k) for k in _MINIMAL_KEYS},
                "priceNum": c.get("priceNum"),
                "passengers": c.get("passengers"),
            }
        )
    return results


def compare_cars(car_ids: list[str]) -> dict:
    """Compare two or more catalog cars side by side by their ids.
    Returns {'cars': {id: full_facts, ...}, 'unknown': [ids not found]}."""
    cars, unknown = {}, []
    for cid in car_ids:
        car = catalog.by_id(cid)
        if car is None:
            unknown.append(cid)
        else:
            cars[cid] = car
    return {"cars": cars, "unknown": unknown}
