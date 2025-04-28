# MapChain AI Service

This is the AI microservice component of MapChain, responsible for property valuations using machine learning.

## Features

- Quick AI-powered property valuations
- Model training with historical data
- Confidence scoring for predictions
- RESTful API interface

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
.\venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### GET /docs
Interactive API documentation

### POST /predict
Get an AI-powered property valuation

### POST /train
Train the model with new data

## Model Details

The service uses a Random Forest Regressor model with the following features:
- Property size
- Number of bedrooms
- Number of bathrooms
- Year built
- Location (latitude/longitude)
- Previous value (if available)
- Last sale date

The model is automatically saved after training and loaded on startup.
