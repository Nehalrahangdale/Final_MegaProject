import os
import sys

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib


# =====================================================
# SMART PARKING OCCUPANCY PREDICTION
# =====================================================

# Features:
# hour       -> parking ka hour
# day        -> day of week (0 = Monday, 6 = Sunday)
# bookings   -> us time ke bookings
#
# Target:
# occupancy  -> parking occupancy percentage


# =====================================================
# 1. SAMPLE TRAINING DATA
# =====================================================

X = np.array([
    [8, 0, 20],
    [9, 0, 35],
    [10, 0, 45],
    [11, 0, 50],

    [8, 1, 25],
    [9, 1, 40],
    [10, 1, 55],
    [11, 1, 60],

    [8, 2, 30],
    [9, 2, 45],
    [10, 2, 60],
    [11, 2, 65],

    [8, 3, 35],
    [9, 3, 50],
    [10, 3, 65],
    [11, 3, 70],

    [8, 4, 40],
    [9, 4, 60],
    [10, 4, 75],
    [11, 4, 80],

    [8, 5, 15],
    [9, 5, 25],
    [10, 5, 35],
    [11, 5, 45],

    [8, 6, 10],
    [9, 6, 20],
    [10, 6, 30],
    [11, 6, 40],
])

y = np.array([
    25, 40, 50, 55,
    30, 45, 60, 65,
    35, 50, 65, 70,
    40, 55, 70, 75,
    45, 65, 80, 85,
    20, 30, 40, 50,
    15, 25, 35, 45
])


# =====================================================
# 2. TRAIN / TEST SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# =====================================================
# 3. CREATE MODEL
# =====================================================

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)


# =====================================================
# 4. TRAIN MODEL
# =====================================================

model.fit(X_train, y_train)


# =====================================================
# 5. TEST MODEL
# =====================================================

predictions = model.predict(X_test)

mae = mean_absolute_error(
    y_test,
    predictions
)

print("===================================")
print("SMART PARKING AI MODEL")
print("===================================")

print(f"Mean Absolute Error: {mae:.2f}%")


# =====================================================
# 6. SAVE MODEL
# =====================================================

model_file = os.path.join(os.path.dirname(__file__), "parking_model.pkl")

joblib.dump(
    model,
    model_file
)

print(f"Model saved as: {model_file}")


# =====================================================
# 7. MAKE NEW PREDICTION
# =====================================================

# Example:
# 10 AM
# Wednesday = 2
# 60 bookings

new_data = np.array([
    [10, 2, 60]
])

predicted_occupancy = model.predict(
    new_data
)[0]


predicted_occupancy = max(
    0,
    min(100, predicted_occupancy)
)


print("-----------------------------------")
print("Prediction")
print("-----------------------------------")

print(
    f"Expected Parking Occupancy: "
    f"{predicted_occupancy:.2f}%"
)

print("===================================")
