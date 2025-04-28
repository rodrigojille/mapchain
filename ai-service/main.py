from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="MapChain AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Models
class PropertyFeatures(BaseModel):
    size: float
    bedrooms: int
    bathrooms: int
    year_built: int
    location_lat: float
    location_lng: float
    previous_value: Optional[float] = None
    last_sale_date: Optional[str] = None

class ValuationRequest(BaseModel):
    property_id: str
    features: PropertyFeatures

class ValuationResponse(BaseModel):
    property_id: str
    estimated_value: float
    confidence_score: float
    timestamp: str
    explanation: Optional[str] = None

# Global variables
model = None
scaler = None

# Nebius Studio API configuration
NEBIUS_API_KEY = os.getenv("NEBIUS_API_KEY", "eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMTEwNDg3MDY0MjUxMTUzNTExNSIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkwMTk5ODU3MSwidXVpZCI6Ijc1YWJiMWNmLTJmN2UtNGRlYy05ZmMyLWYxY2MyM2FlODU1YiIsIm5hbWUiOiJtYXBjaGFpbiIsImV4cGlyZXNfYXQiOiIyMDMwLTA0LTA5VDIwOjU2OjExKzAwMDAifQ.PK-JXjhb6p8l0zOfX2CCJJ1H22VB17GcY4zl4SM-DxU")
NEBIUS_API_URL = "https://api.nebius.ai/v1/completions"

def load_model():
    global model, scaler
    try:
        model = joblib.load('models/valuation_model.joblib')
        scaler = joblib.load('models/scaler.joblib')
    except:
        # Initialize new model if none exists
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        scaler = StandardScaler()

@app.on_event("startup")
async def startup_event():
    load_model()

def prepare_features(features: PropertyFeatures):
    return np.array([
        features.size,
        features.bedrooms,
        features.bathrooms,
        features.year_built,
        features.location_lat,
        features.location_lng,
        features.previous_value if features.previous_value else 0,
        float(datetime.strptime(features.last_sale_date, "%Y-%m-%d").timestamp()) if features.last_sale_date else 0
    ]).reshape(1, -1)

async def get_nebius_prediction(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get property valuation prediction from Nebius Studio API"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NEBIUS_API_KEY}"
        }
        
        # Format the prompt for the model
        prompt = f"""
        You are an expert real estate valuation AI. Based on the following property details, provide an estimated market value.
        
        Property Details:
        - Size: {property_data['size']} sq ft
        - Bedrooms: {property_data['bedrooms']}
        - Bathrooms: {property_data['bathrooms']}
        - Year Built: {property_data['year_built']}
        - Location: Latitude {property_data['location_lat']}, Longitude {property_data['location_lng']}
        - Previous Value: {property_data.get('previous_value', 'Not available')}
        - Last Sale Date: {property_data.get('last_sale_date', 'Not available')}
        
        Analyze these details and provide:
        1. An estimated market value in USD
        2. A confidence score between 0.0 and 1.0
        3. A brief explanation of your valuation
        
        Format your response as a JSON object with keys: 'estimated_value', 'confidence_score', and 'explanation'.
        """
        
        payload = {
            "model": "nebius-gpt",  # Using Nebius GPT model
            "prompt": prompt,
            "max_tokens": 500,
            "temperature": 0.2,  # Lower temperature for more deterministic outputs
            "top_p": 0.95,
            "frequency_penalty": 0,
            "presence_penalty": 0
        }
        
        response = requests.post(NEBIUS_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract the model's response
        model_response = result.get('choices', [{}])[0].get('text', '')
        
        # Parse the JSON response from the model
        try:
            # Find the JSON object in the response
            json_start = model_response.find('{')
            json_end = model_response.rfind('}')
            
            if json_start >= 0 and json_end >= 0:
                json_str = model_response[json_start:json_end+1]
                prediction_data = json.loads(json_str)
            else:
                # Fallback if no JSON found
                prediction_data = {
                    "estimated_value": 0,
                    "confidence_score": 0,
                    "explanation": "Could not parse model response"
                }
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            prediction_data = {
                "estimated_value": 0,
                "confidence_score": 0,
                "explanation": "Failed to parse model response"
            }
            
        return prediction_data
    
    except Exception as e:
        print(f"Error calling Nebius API: {str(e)}")
        return {
            "estimated_value": 0,
            "confidence_score": 0,
            "explanation": f"API Error: {str(e)}"
        }

@app.post("/predict", response_model=ValuationResponse)
async def predict_value(request: ValuationRequest):
    try:
        # First try to get prediction from Nebius Studio API
        property_dict = {
            "size": request.features.size,
            "bedrooms": request.features.bedrooms,
            "bathrooms": request.features.bathrooms,
            "year_built": request.features.year_built,
            "location_lat": request.features.location_lat,
            "location_lng": request.features.location_lng,
            "previous_value": request.features.previous_value,
            "last_sale_date": request.features.last_sale_date
        }
        
        nebius_prediction = await get_nebius_prediction(property_dict)
        
        # If Nebius prediction is successful, use it
        if nebius_prediction.get("estimated_value", 0) > 0:
            return ValuationResponse(
                property_id=request.property_id,
                estimated_value=float(nebius_prediction["estimated_value"]),
                confidence_score=float(nebius_prediction["confidence_score"]),
                timestamp=datetime.now().isoformat(),
                explanation=nebius_prediction.get("explanation", "")
            )
        
        # Fallback to local model if Nebius prediction fails
        features = prepare_features(request.features)
        scaled_features = scaler.transform(features)
        prediction = model.predict(scaled_features)[0]
        confidence_score = float(np.mean(model.feature_importances_))
        
        return ValuationResponse(
            property_id=request.property_id,
            estimated_value=float(prediction),
            confidence_score=confidence_score,
            timestamp=datetime.now().isoformat(),
            explanation="Prediction made using local model"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(training_data: List[ValuationRequest]):
    try:
        # Prepare training data
        X = np.array([prepare_features(req.features)[0] for req in training_data])
        y = np.array([req.features.previous_value for req in training_data])
        
        # Scale features
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        model.fit(X_scaled, y)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, 'models/valuation_model.joblib')
        joblib.dump(scaler, 'models/scaler.joblib')
        
        return {"message": "Model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# New endpoints for enhanced property analysis

class PropertyAnalysisRequest(BaseModel):
    property_id: str
    features: PropertyFeatures
    comparable_properties: Optional[List[Dict[str, Any]]] = None
    market_trends: Optional[Dict[str, Any]] = None

class PropertyAnalysisResponse(BaseModel):
    property_id: str
    valuation: Dict[str, Any]
    market_insights: Dict[str, Any]
    investment_potential: Dict[str, Any]
    timestamp: str

@app.post("/analyze", response_model=PropertyAnalysisResponse)
async def analyze_property(request: PropertyAnalysisRequest):
    """Comprehensive property analysis using Nebius Studio AI"""
    try:
        # Get basic valuation
        valuation_request = ValuationRequest(
            property_id=request.property_id,
            features=request.features
        )
        valuation = await predict_value(valuation_request)
        
        # Prepare property data for Nebius analysis
        property_dict = {
            "size": request.features.size,
            "bedrooms": request.features.bedrooms,
            "bathrooms": request.features.bathrooms,
            "year_built": request.features.year_built,
            "location_lat": request.features.location_lat,
            "location_lng": request.features.location_lng,
            "previous_value": request.features.previous_value,
            "last_sale_date": request.features.last_sale_date,
            "estimated_value": valuation.estimated_value,
            "comparable_properties": request.comparable_properties,
            "market_trends": request.market_trends
        }
        
        # Get market insights from Nebius
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NEBIUS_API_KEY}"
        }
        
        # Format the prompt for market analysis
        prompt = f"""
        You are an expert real estate analyst. Analyze the following property and market data to provide investment insights.
        
        Property Details:
        - Size: {property_dict['size']} sq ft
        - Bedrooms: {property_dict['bedrooms']}
        - Bathrooms: {property_dict['bathrooms']}
        - Year Built: {property_dict['year_built']}
        - Location: Latitude {property_dict['location_lat']}, Longitude {property_dict['location_lng']}
        - Estimated Value: ${property_dict['estimated_value']}
        
        Market Data: {json.dumps(property_dict.get('market_trends', {}))}
        Comparable Properties: {json.dumps(property_dict.get('comparable_properties', []))}
        
        Provide a detailed analysis with:
        1. Market insights (trends, supply/demand, etc.)
        2. Investment potential (ROI, appreciation forecast, rental yield potential)
        3. Recommendations for the property owner
        
        Format your response as a JSON object with keys: 'market_insights', 'investment_potential', and 'recommendations'.
        """
        
        payload = {
            "model": "nebius-gpt",
            "prompt": prompt,
            "max_tokens": 800,
            "temperature": 0.3,
            "top_p": 0.95
        }
        
        response = requests.post(NEBIUS_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        model_response = result.get('choices', [{}])[0].get('text', '')
        
        # Parse the JSON response from the model
        try:
            json_start = model_response.find('{')
            json_end = model_response.rfind('}')
            
            if json_start >= 0 and json_end >= 0:
                json_str = model_response[json_start:json_end+1]
                analysis_data = json.loads(json_str)
            else:
                # Fallback if no JSON found
                analysis_data = {
                    "market_insights": {"summary": "Analysis unavailable"},
                    "investment_potential": {"summary": "Analysis unavailable"},
                    "recommendations": ["Analysis unavailable"]
                }
        except json.JSONDecodeError:
            analysis_data = {
                "market_insights": {"summary": "Analysis unavailable"},
                "investment_potential": {"summary": "Analysis unavailable"},
                "recommendations": ["Analysis unavailable"]
            }
        
        return PropertyAnalysisResponse(
            property_id=request.property_id,
            valuation={
                "estimated_value": valuation.estimated_value,
                "confidence_score": valuation.confidence_score,
                "explanation": valuation.explanation or ""
            },
            market_insights=analysis_data.get("market_insights", {}),
            investment_potential=analysis_data.get("investment_potential", {}),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
