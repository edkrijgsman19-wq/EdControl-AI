# EdControl AI 🏗️

**AI-powered building inspection platform for maintenance analysis and reporting**

A modern React-based application for managing building and utility inspections using artificial intelligence to analyze component conditions, provide strategic maintenance recommendations, and generate actionable reports.

## Features

✨ **Core Functionality**
- 🏢 **Multi-Project Management** - Switch between hospital, office, and school projects
- 📐 **Interactive Drawing Upload** - Upload PDF and image drawings
- 📍 **Pin-Based Inspection Points** - Click on drawings to place inspection markers
- 📸 **Photo Capture** - Capture on-site photos of components
- 🤖 **AI Analysis** - Get instant component assessment using NEN 2767 standards
- 💰 **TCO Calculations** - Investment vs. payback analysis
- 📋 **Automated Reports** - Generate maintenance reports with bill of materials

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Support**: pdfjs-dist (for future integration)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/edkrijgsman19-wq/EdControl-AI.git
cd EdControl-AI

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
EdControl-AI/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies
```

## How It Works

### 1. Dashboard (Home Screen)
- Select active project
- Choose between managing drawings or viewing reports

### 2. Drawings & Inspection Points
- Upload PDF or image drawing
- Click on drawing to place numbered inspection pins
- Each pin becomes an inspection point

### 3. Inspection Analysis
- Select a pin to inspect
- Capture photo of component
- Add written notes about observed issues
- Run AI analysis

### 4. AI Results
The AI provides:
- Component identification
- Condition score (NEN 2767)
- Remaining Technical Life (RTL)
- Sector-specific impact assessment
- Strategic maintenance recommendation
- Total Cost of Ownership (TCO) calculation
- Required parts and materials list

### 5. Report Generation
- View all completed inspections
- Download PDF report with:
  - Component details
  - Condition scores
  - Strategic recommendations
  - Bill of materials for each inspection point

## Mock Data

The application includes demo projects:
- **St. Antonius Ziekenhuis** (Hospital) - OK-Complex 3
- **Kantoorpand Zenith** (Office) - Roof extension HVAC
- **Basischool De Kring** (School) - Boiler room

AI analysis is simulated with a 2-second delay. In production, connect to a real AI backend API.

## Future Enhancements

- [ ] Real PDF rendering with zoom/pan
- [ ] Backend API integration for persistent storage
- [ ] Real AI model for component analysis
- [ ] Multi-user collaboration
- [ ] Photo versioning and comparison
- [ ] Integration with maintenance scheduling systems
- [ ] Export to various report formats

## License

Private repository

## Contact

For questions or suggestions, contact the development team.