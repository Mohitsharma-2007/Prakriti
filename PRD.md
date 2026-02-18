# Product Requirements Document (PRD)
## PRAKRITI

---

## 🌱 Product Vision

To build a **mobile-first AI-powered crop health assistant** that provides real-time, location-specific, multilingual diagnosis and treatment guidance to farmers, even in low-bandwidth rural environments.

This system will combine:

- 🔬 **Computer Vision** — Crop disease detection
- 🛰️ **Satellite Intelligence** — AlphaEarth embeddings
- 📍 **Geolocation Insights**
- 🤖 **Generative AI** — Gemini 3
- 📚 **Knowledge Base** — Pesticides & soil
- 🗣️ **Local Dialect Voice Assistance**
- 💬 **WhatsApp / Telegram Integration**

---

## 👨‍🌾 Target Users

### Primary
- Small & mid-scale farmers in rural India
- Low digital literacy users
- Farmers with inconsistent internet connectivity

### Secondary
- Agricultural officers
- FPOs (Farmer Producer Organizations)
- Agri-retailers
- NGOs

---

## 😔 Farmer Pain Point Analysis
> *Ground Reality — Thinking Like a Farmer*

| # | Pain Point | Description |
|---|-----------|-------------|
| 1 | **Late Disease Detection** | By the time symptoms are visible, crop damage is already severe. |
| 2 | **Wrong Pesticide Usage** | Retailers often recommend based on sales, not suitability. |
| 3 | **Language Barrier** | Most agri-apps use formal Hindi or English. |
| 4 | **No Localized Advice** | Advice is generic, not soil-specific or weather-specific. |
| 5 | **Poor Internet Connectivity** | Rural network issues block real-time assistance. |
| 6 | **No Historical Tracking** | Farmers forget what treatment they used last season. |
| 7 | **Climate Variability** | Sudden weather shifts affect crop health. |
| 8 | **No Integrated View** | Satellite data, soil, pest risk, and diagnosis are disconnected. |

**We solve all of this.**

---

## ✅ Core Functional Requirements

### 📷 Image Upload of Diseased Crops
- Camera capture or gallery upload
- Auto image compression for low bandwidth

### 🦠 Disease & Pest Detection
- AI model identifies crop + disease
- Confidence score display

### 📍 Location-Based Recommendations
- GPS auto-detection
- Satellite soil pattern insights via AlphaEarth
- Weather integration

### 🗣️ Local Dialect Support (Text + Voice)
- Gemini 3 for multilingual response
- Text-to-Speech output
- Voice input for farmers

### 💊 Pesticide & Soil Treatment Guidance
- Dosage
- Safety measures
- Spraying schedule
- Organic alternative suggestions

### 📅 Structured 7-Day Action Plan
- Day-wise treatment plan
- Irrigation guidance
- Recheck reminders

### 📊 Diagnosis History Tracking
- Crop-wise history
- Seasonal analytics
- Compare previous cases

---

## ⭐ Advanced Top-Notch Features
> *Features that elevate this project*

| Feature | Description |
|---------|-------------|
| **AI Disease Severity Score** | Estimate infection percentage using CV segmentation |
| **Outbreak Heatmap** | Detect similar vegetation stress patterns in nearby areas via AlphaEarth |
| **Crop Stress Early Warning** | Use satellite embeddings to predict stress before visible symptoms |
| **Soil Health Estimation** | Use satellite spectral patterns to approximate soil health index |
| **Smart Pest Forecasting** | Combine humidity + temperature + region data |
| **Offline Mode** | Cache last diagnosis, store knowledge base locally, sync when internet returns |
| **Voice-Only Mode** | Entire navigation via voice prompts for low-literacy farmers |
| **"Ask Krishi Doctor" Chat** | Gemini-based assistant fine-tuned for agriculture |
| **WhatsApp Bot** | Farmer sends image directly on WhatsApp → gets diagnosis |
| **Community Insight Mode** | Farmers in nearby villages can see anonymized outbreak alerts |

---

## 🏗️ Technical Architecture

### Frontend
- **React + Vite** — PWA enabled, responsive UI
- Can be wrapped using **Capacitor** for Android app

### Backend
- **FastAPI (Python)** — Recommended
  - Works best with ML
  - Easy integration with Gemini API
  - Efficient & scalable

### Database
- **Supabase**
  - PostgreSQL
  - Authentication
  - Storage for images
  - Row-level security

### AI Stack
- Gemini 3 API — Diagnosis + Multilingual NLP
- Custom CNN / EfficientNet — Disease classification
- Segmentation model — Severity detection

### Satellite Intelligence
- Google Earth Engine
- AlphaEarth Embeddings
- Leafmap + MapLibre for visualization

### Cloud
- Railway / Render (Free tier)
- Or Google Cloud Free Tier

---

## 🔄 Data Flow Architecture

```
Farmer uploads image
        ↓
Image stored in Supabase Storage
        ↓
Backend FastAPI
        ↓
Model prediction
        ↓
Gemini generates structured response
        ↓
Fetch geolocation
        ↓
AlphaEarth embeddings
        ↓
Generate satellite insights
        ↓
Create 7-day plan
        ↓
Store in Supabase
        ↓
Return result (Text + Voice)
```

---

## 🛠️ Tools & Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React | UI Framework |
| Vite | Build Tool |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Capacitor | Mobile Conversion |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | API Framework |
| Uvicorn | ASGI Server |
| Pydantic | Data Validation |
| Supabase Python SDK | Database Integration |

### AI
| Tool | Purpose |
|------|---------|
| Gemini 3 API | NLP & Diagnosis |
| TensorFlow / PyTorch | Model Training |
| OpenCV | Image Processing |
| Scikit-learn | ML Utilities |

### Satellite
| Tool | Purpose |
|------|---------|
| Google Earth Engine | Satellite Data |
| AlphaEarth Dataset | Embeddings |
| Leafmap | Geospatial Analysis |
| MapLibre GL | Map Visualization |

### Voice
- Google Text-to-Speech
- Web Speech API

### Messaging
- WhatsApp Cloud API (Free tier)
- Telegram Bot API (Completely free)

### DevOps
- Docker
- GitHub Actions
- Railway / Render

---

## 📂 Free Data Sources

| Category | Source |
|----------|--------|
| **Plant Disease** | PlantVillage Dataset |
| **Satellite** | Google Earth Engine, AlphaEarth Embeddings |
| **Weather** | OpenWeatherMap Free Tier |
| **Soil** | ISRIC SoilGrids, FAO Soil Data |
| **Pesticide Info** | Government Agriculture Portals, ICAR Publications, FAO Pesticide Database |
| **Crop Advisory** | Agmarknet, data.gov.in |

---

## 💬 WhatsApp / Telegram Integration

### Telegram *(Easier + Free)*
1. Create bot using BotFather
2. Image upload via Telegram
3. Webhook → FastAPI endpoint
4. Return diagnosis text + voice file

### WhatsApp *(Cloud API)*
1. Use Meta Cloud API free tier
2. Image processing webhook
3. Automated response system

### Response Flow
```
Farmer sends image
        ↓
Bot sends to backend
        ↓
Backend responds with:
  - Disease name
  - Severity
  - Treatment plan
  - Voice summary
```

---

## 📱 Mobile-First UI Strategy

- ✅ Big buttons
- ✅ Minimal text
- ✅ Voice-first UX
- ✅ Local language default
- ✅ Low image resolution optimization
- ✅ Dark text on light background
- ✅ Offline banner indicator

---

## 🔐 Security & Privacy

- Supabase row-level security
- JWT-based authentication
- Image encryption in storage
- No personal data exposure
- Location anonymization

---

## 🚀 Scalability Roadmap

| Phase | Focus |
|-------|-------|
| **Phase 1** | Basic detection + location advisory |
| **Phase 2** | Satellite early stress detection |
| **Phase 3** | Community outbreak prediction |
| **Phase 4** | Government integration |
| **Phase 5** | Farmer credit scoring based on crop health |

---

## 📈 KPI Metrics

- Diagnosis accuracy rate
- Farmer retention rate
- Average response time
- Treatment success feedback
- Daily active farmers

---

## 🏆 Competitive Advantage

| Feature | Most Apps | Our System |
|---------|-----------|-----------|
| Disease Detection | ✅ | ✅ |
| Satellite Intelligence | ❌ | ✅ |
| Local Dialect Voice | ❌ | ✅ |
| WhatsApp Bot | ❌ | ✅ |
| Structured Action Plan | ❌ | ✅ |
| Historical Tracking | ❌ | ✅ |
| Offline Mode | ❌ | ✅ |
| Community Insights | ❌ | ✅ |

> **Our system = AI + Satellite + Voice + Location + Messaging + History**
