from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, numpy as np

app = Flask(__name__)
CORS(app)  # allows Next.js to call it

model   = joblib.load('cogni_model2.pkl')
imputer = joblib.load('cogni_imputer2.pkl')

FEATURES = [
  'age','gender','educationyears','EF','PS','Global',
  'diabetes','smoking','hypertension','hypercholesterolemia',
  'SVD Simple Score','SVD Amended Score'
]

@app.route('/predict', methods=['POST'])
def predict():
    data     = request.json
    X        = np.array([[data.get(f, 0) for f in FEATURES]])
    X_imp    = imputer.transform(X)
    pred     = model.predict(X_imp)[0]
    prob     = model.predict_proba(X_imp)[0]
    conf     = round(float(prob[pred]) * 100, 1)
    risk     = 'high' if (pred==1 and conf>75) else \
               'moderate' if (pred==1 and conf>50) else 'low'

    return jsonify({
        'prediction': int(pred),
        'label':      'Dementia Risk' if pred==1 else 'No Dementia Risk',
        'confidence': conf,
        'risk':       risk
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)