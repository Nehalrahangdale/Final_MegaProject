# 🧠 Smart Parking AI - Occupancy Prediction Model

Machine Learning model using **RandomForestRegressor** to predict parking lot occupancy percentage based on hour, day of the week, and booking demand.

---

## 📊 Features & Target

- **Features**:
  - `hour`: Time of day (e.g., `8`, `9`, `10`, `11`...)
  - `day`: Day of week (`0` = Monday, `1` = Tuesday, ..., `6` = Sunday)
  - `bookings`: Number of bookings at that time slot
- **Target**:
  - `occupancy`: Expected parking occupancy percentage (`0%` - `100%`)

---

## ⚙️ Requirements

Ensure the dependencies are installed:
```bash
cd ai
pip install -r requirements.txt
```
*(Dependencies: `numpy`, `scikit-learn`, `joblib`)*

---

## 🚀 How to Run

Execute the training and prediction script:
```bash
python parking_prediction.py
```

### Expected Output:
```text
===================================
SMART PARKING AI MODEL
===================================
Mean Absolute Error: 1.27%
Model saved as: ...\parking_model.pkl
-----------------------------------
Prediction
-----------------------------------
Expected Parking Occupancy: 65.05%
===================================
```

---

## 💾 Model Serialization

The trained model is automatically serialized and saved to:
```text
ai/parking_model.pkl
```
This saved model file can be loaded directly in production to generate fast real-time occupancy predictions.
