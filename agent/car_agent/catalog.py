"""Loads the generated car catalog and provides lookup/filter helpers."""
import json
from pathlib import Path

_DATA_PATH = Path(__file__).resolve().parent.parent / "car_data.json"

with _DATA_PATH.open(encoding="utf-8") as fh:
    CARS: list[dict] = json.load(fh)

_BY_ID = {c["id"]: c for c in CARS}


def all_cars() -> list[dict]:
    return CARS


def by_id(car_id: str) -> dict | None:
    return _BY_ID.get(car_id)
