import os
import sys
import json
import numpy as np
import joblib

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

MODEL_PATH = os.path.join(os.path.dirname(__file__), "parking_model.pkl")

def get_recommendation(occupancy):
    if occupancy >= 80.0:
        return "Critical", True, "🔴 High rush alert! Very few slots likely available. Reserve immediately."
    elif occupancy >= 60.0:
        return "High", True, "🟠 High demand expected. Advance booking is strongly advised."
    elif occupancy >= 35.0:
        return "Moderate", False, "🟡 Moderate parking traffic. Normal slot availability expected."
    else:
        return "Low", False, "🟢 Plenty of parking slots are expected to be available."

def main():
    try:
        # Default parameters if not provided
        hour = int(sys.argv[1]) if len(sys.argv) > 1 else 10
        day = int(sys.argv[2]) if len(sys.argv) > 2 else 2
        bookings = int(sys.argv[3]) if len(sys.argv) > 3 else 50
        total_slots = int(sys.argv[4]) if len(sys.argv) > 4 else 50

        if not os.path.exists(MODEL_PATH):
            # Run fallback training if model not found
            from parking_prediction import model as trained_model
            model = trained_model
        else:
            model = joblib.load(MODEL_PATH)

        new_data = np.array([[hour, day, bookings]])
        predicted_occupancy = float(model.predict(new_data)[0])
        predicted_occupancy = round(max(0.0, min(100.0, predicted_occupancy)), 2)

        demand_level, is_rush, recommendation = get_recommendation(predicted_occupancy)

        predicted_booked = int(round((predicted_occupancy / 100.0) * total_slots))
        predicted_available = max(0, total_slots - predicted_booked)

        output = {
            "success": True,
            "input": {
                "hour": hour,
                "day": day,
                "bookings": bookings,
                "total_slots": total_slots
            },
            "prediction": {
                "occupancy_rate": predicted_occupancy,
                "predicted_available_slots": predicted_available,
                "predicted_booked_slots": predicted_booked,
                "demand_level": demand_level,
                "rush_hour_alert": is_rush,
                "recommendation": recommendation
            }
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
