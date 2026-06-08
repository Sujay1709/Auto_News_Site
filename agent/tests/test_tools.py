from car_agent import tools


def test_list_cars_returns_all_minimal_records():
    cars = tools.list_cars()
    assert len(cars) == 24
    first = cars[0]
    assert set(first.keys()) == {"id", "make", "model", "year", "price", "fuel"}
    assert first["id"] == "toyota-camry"


def test_get_car_facts_known_car():
    facts = tools.get_car_facts("tesla-model-3")
    assert facts["make"] == "Tesla"
    assert facts["fuel"] == "Battery electric"
    assert "engine" in facts


def test_get_car_facts_unknown_car_returns_error():
    facts = tools.get_car_facts("does-not-exist")
    assert "error" in facts


def test_search_cars_by_fuel():
    results = tools.search_cars(fuel="electric")
    assert len(results) > 0
    assert all("electric" in c["fuel"].lower() for c in results)


def test_search_cars_by_max_price():
    results = tools.search_cars(max_price=30000)
    assert all(c["priceNum"] is not None and c["priceNum"] <= 30000 for c in results)


def test_search_cars_by_min_seats():
    results = tools.search_cars(min_seats=5)
    assert all(c["passengers"] >= 5 for c in results)


def test_compare_cars_returns_each_requested():
    result = tools.compare_cars(["tesla-model-3", "hyundai-ioniq-6"])
    assert set(result["cars"].keys()) == {"tesla-model-3", "hyundai-ioniq-6"}
    assert result["cars"]["tesla-model-3"]["make"] == "Tesla"


def test_compare_cars_flags_unknown_ids():
    result = tools.compare_cars(["tesla-model-3", "nope"])
    assert "nope" in result["unknown"]
