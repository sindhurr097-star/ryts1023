# JnanikAI PredictMate - Industrial Predictive Maintenance System

A comprehensive AI-powered predictive maintenance web application for monitoring industrial machines in real-time with anomaly detection, root cause analysis, failure prediction, and energy optimization.

## 🚀 Features

- **Real-Time Machine Monitoring**: Live sensor data streaming for 4 industrial machines (CNC Lathe, HVAC, Hydraulic Pump)
- **AI-Powered Analysis**: 
  - Root Cause Analysis (RCA) using Anthropic Claude API
  - Failure Time Prediction with trend analysis
  - Intelligent maintenance report generation
- **Interactive Dashboard**: Fleet health overview, risk gauges, and live alert feed
- **Machine Detail Pages**: Historical sensor charts with baseline comparisons
- **AI Chatbot**: JnanikBot assistant for natural language queries about machine health
- **Energy Efficiency**: AI-powered optimization suggestions
- **Voice Module**: Speech recognition for hands-free interaction
- **PDF Report Export**: Professional maintenance reports with one-click download

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom design system
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Export**: jsPDF
- **Routing**: React Router v6
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Fonts**: IBM Plex Mono (data), Syne (headings)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key (get from https://console.anthropic.com/)

## 🔧 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
```

## 🚀 Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── shared/          # Reusable components (Sidebar, Header, AlertBell, etc.)
│   │   ├── Dashboard/       # Dashboard-specific components
│   │   ├── MachineDetail/   # Machine detail page components
│   │   ├── RCA/             # Root Cause Analysis components
│   │   ├── Chatbot/         # Chatbot components
│   │   └── VoiceModule/     # Voice recognition components
│   ├── hooks/
│   │   └── useSensorSimulator.js  # Sensor data simulation
│   ├── services/
│   │   └── claudeService.js       # AI API integration
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── MachineDetailPage.jsx
│   │   ├── RCAPage.jsx
│   │   ├── FailurePredictionPage.jsx
│   │   ├── ReportGeneratorPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   └── EnergyPage.jsx
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🎨 Design System

### Colors
- **Background**: `#0A0A0F` (deep black)
- **Surface**: `#12121A` (dark surface)
- **Primary Accent**: `#00E5FF` (electric cyan)
- **Warning Accent**: `#FFB300` (amber)
- **Danger Accent**: `#FF3D3D` (red)
- **Text Primary**: `#F0F0F0`
- **Text Muted**: `#6B7280`

### Typography
- **Display Font**: Syne (headings)
- **Mono Font**: IBM Plex Mono (data/numbers)
- **Body Font**: System sans-serif

## 🤖 AI Features

### Root Cause Analysis
The RCA feature uses Claude to analyze sensor data and identify:
- Root cause of anomalies
- Failure mechanisms
- Immediate corrective actions
- Confidence levels (LOW/MEDIUM/HIGH)

### Failure Prediction
AI-powered time-to-failure estimation based on:
- Historical sensor trends
- Rate of change analysis
- Urgency classification (CRITICAL/HIGH/MODERATE/LOW)

### Energy Optimization
Provides actionable suggestions for:
- Reducing energy consumption
- Estimated savings percentages
- Implementation difficulty ratings

## 📊 Machine Configuration

The system simulates 4 industrial machines:

1. **CNC_01** - CNC Lathe Unit 1
   - Temperature: 75-85°C
   - Vibration: 1.5-2.5 mm/s
   - RPM: 1400-1600
   - Current: 12-15A

2. **CNC_02** - CNC Lathe Unit 2
   - Temperature: 70-80°C
   - Vibration: 1.0-2.0 mm/s
   - RPM: 1450-1550
   - Current: 11-14A

3. **HVAC_01** - HVAC Cooling System
   - Temperature: 45-55°C
   - Vibration: 0.5-1.5 mm/s
   - RPM: 800-1000
   - Current: 8-11A

4. **PUMP_01** - Hydraulic Pump Unit
   - Temperature: 60-70°C
   - Vibration: 2.0-3.5 mm/s
   - RPM: 2800-3200
   - Current: 15-18A

## 🔌 API Integration

The application uses the Anthropic Claude API for AI features. Configure your API key in the `.env` file:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📱 Pages

### Dashboard (`/`)
- Fleet health overview
- Machine fleet cards with live sensor data
- Real-time alert feed
- Risk score gauges

### Machine Detail (`/machine/:machineId`)
- Live sensor charts (10-minute window)
- Historical data (7-day simulated)
- Baseline comparisons
- Anomaly markers

### Root Cause Analysis (`/rca`)
- AI-powered anomaly analysis
- Machine selector
- Sensor snapshot display
- Confidence-rated results

### Failure Prediction (`/predict`)
- AI time-to-failure estimation
- Urgency classification
- Maintenance scheduling

### Report Generator (`/report`)
- Configurable report types
- PDF/TXT export
- AI-generated content

### Chatbot (`/chatbot`)
- Natural language interface
- Context-aware responses
- Suggested prompts
- Voice input support

### Energy Efficiency (`/energy`)
- Power consumption metrics
- Efficiency scoring
- AI optimization suggestions

## 🎯 Key Features

### Signal Processing
- 3-reading validation buffer for noise filtering
- Spike detection with configurable thresholds
- Drift detection using linear regression
- Compound anomaly detection

### Data Storage
- In-memory sliding window (600 readings per machine)
- Real-time data streaming (1-second intervals)
- Automatic anomaly injection for testing

### User Interface
- Responsive design (mobile + desktop)
- Dark mode with grid line background
- Glow effects for status indicators
- Animated transitions

## 🔐 Security Notes

- API keys are stored in environment variables
- Never commit `.env` files to version control
- Use `.env.example` as a template
- API calls include browser-access flag for client-side usage

## 🐛 Troubleshooting

### API Key Errors
If you see "API key not configured":
1. Ensure `.env` file exists in the frontend directory
2. Verify `VITE_ANTHROPIC_API_KEY` is set correctly
3. Restart the development server after adding the key

### Build Errors
If you encounter build errors:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Port Already in Use
Change the port in `vite.config.js` or use:
```bash
npm run dev -- --port 3000
```

## 📝 License

This project is part of the Malendau Hackathon.

## 👥 Contributing

This is a hackathon project. For questions or improvements, please contact the development team.

## 🙏 Acknowledgments

- Anthropic Claude API for AI capabilities
- Recharts for data visualization
- TailwindCSS for styling
- Vite for build tooling
