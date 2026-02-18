# Tech Stack Presentation Script 🎤

*(Slide: Tech Stack Overview)*

**Speaker:**
"To bring Prakriti to life, we've built a robust, scalable, and mobile-first architecture. Our technology stack is designed for speed, reliability, and accessibility in low-bandwidth rural areas."

---

### 1. Frontend Layer (User Experience)
**Speaker:**
"First, our **Frontend**. We use **React with Vite** to ensure a blazing-fast, responsive mobile web application.
We treat this as a 'Mobile-First' experience.
Styles are handled by **TailwindCSS**, giving us a clean, modern, and lightweight UI that feels like a native app.
For easy distribution, we can wrap this using **Capacitor** to deploy as an Android APK."

---

### 2. Backend Layer (Logic & Security)
**Speaker:**
"Powering the core logic is our **Backend**.
We utilize **Python with FastAPI**. Why Python? Because it seamlessly integrates with our AI workflows.
FastAPI gives us high performance and automatic validation with Pydantic.
We host this efficient API server using **Uvicorn**."

---

### 3. Database & Authentication (The Backbone)
**Speaker:**
"For our data, we rely on **Supabase**.
It gives us a powerful **PostgreSQL** database with built-in **Vector Support** (pgvector) for future AI embeddings.
Supabase also handles our **Authentication** and secure **File Storage** for those crop images farmers upload.
It's real-time, secure, and scales automatically."

---

### 4. AI & Intelligence (The Brain) 🧠
**Speaker:**
"Now, the heart of Prakriti: The **AI Engine**.
We are leveraging **Google's Gemini 1.5 Flash**.
This is a Multimodal model—meaning it can 'see' crop diseases in images and 'speak' to farmers in their local language.
It handles:
1.  **Visual Diagnosis**: Identifying diseases from photos.
2.  **Natural Language Processing**: Chatting with farmers in Hindi, English, or Hinglish.
3.  **Advisory**: Generating precise, actionable treatment plans."

---

### 5. Geospatial & Community (Connectivity) 🌍
**Speaker:**
"Finally, we bring farmers together.
We use **Browser Geolocation API** combined with **PostgreSQL geospatial queries** (using the Haversine formula) to locate nearby farmers.
This creates a hyper-local community network, allowing farmers to connect with others within a 50km radius efficiently."

---

**Speaker (Closing):**
"In summary: React for the view, Python for the logic, Supabase for the data, and Gemini AI for the intelligence. A modern stack solving age-old problems."
