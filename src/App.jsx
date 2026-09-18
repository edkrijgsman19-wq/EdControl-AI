import React, { useState, useRef } from 'react';
import { Camera, FileText, Upload, MapPin, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Layers, Download, ArrowLeft, RefreshCw } from 'lucide-react';

export default function EdControlAI() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [projects, setProjects] = useState([
    { id: 1, name: 'St. Antonius Ziekenhuis', sector: 'Ziekenhuizen', location: 'OK-Complex 3' },
    { id: 2, name: 'Kantoorpand Zenith', sector: 'Kantoren', location: 'Dakopbouw - Luchtbehandeling' },
    { id: 3, name: 'Basischool De Kring', sector: 'Scholen', location: 'Ketelhuis' }
  ]);
  const [activeProject, setActiveProject] = useState(projects[0]);
  
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleDrawingUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const newDrawing = { id: Date.now(), name: file.name, url: fileUrl };
      setDrawings([...drawings, newDrawing]);
      setSelectedDrawing(newDrawing);
    }
  };

  const handleDrawingClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin = {
      id: Date.now(),
      drawingId: selectedDrawing.id,
      x,
      y,
      note: '',
      photo: null,
      aiResult: null
    };

    setPins([...pins, newPin]);
    setActivePin(newPin);
    setCurrentScreen('inspect');
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const mockResult = {
        component: "Luchtbehandelingskast (LBK) Sectie 2 - Warmtewisselaar & Regelklep",
        conditionScore: "Score 4 (Slechte conditie / Ernstige gebreken)",
        rtl: "1 tot 2 jaar resterend",
        sectorImpact: activeProject.sector === 'Ziekenhuizen' 
          ? "Kritiek risico voor drukverschillen in operatiekamers en microbiologische continuïteit." 
          : activeProject.sector === 'Kantoren' 
          ? "Verhoogd energieverlies, afname comfort en risico op overschrijding energielabel-eisen." 
          : "Slecht binnenklimaat en verhoogde CO2-waarden door verouderde klepstandaarden.",
        strategy: "Directe Vervanging aanbevolen voor het stookseizoen.",
        tcoPayback: "Investering €12.500 | Verwachte energiewinst: €3.400/jaar | Payback: 3.7 jaar",
        materials: [
          "1x Platenwarmtewisselaar (RVS 316, spec. capaciteit 4500 m3/h)",
          "2x Regelaandrijving 24V (Belimo NM24A-SR)",
          "4x Flenzen PN16 DN50 inclusief AFM-pakkingen",
          "1x Modulating 3-weg regelklep (Siemens VVF43...)"
        ]
      };

      setAiResult(mockResult);
      if (activePin) {
        setPins(pins.map(p => p.id === activePin.id ? { ...p, aiResult: mockResult, photo } : p));
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          {currentScreen !== 'home' && (
            <button 
              onClick={() => setCurrentScreen('home')} 
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-blue-400 flex items-center gap-2">
              <Cpu className="w-5 h-5" /> EdControl AI <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">Utiliteit W</span>
            </h1>
            <p className="text-xs text-slate-400">{activeProject.name} ({activeProject.sector})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentScreen('drawings')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${currentScreen === 'drawings' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            <FileText className="w-4 h-4" /> Tekeningen
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {currentScreen === 'home' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h2 className="text-md font-semibold mb-3 text-slate-200">Actieve Locatie & Project</h2>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  const proj = projects.find(p => p.id === Number(e.target.value));
                  setActiveProject(proj);
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.sector}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setCurrentScreen('drawings')}
                className="bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-500/30 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition shadow-md"
              >
                <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-blue-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-1">PDF Tekeningen Beheren</h3>
                <p className="text-xs text-slate-400">Upload bouw- en installatietekeningen, tik op locaties en koppel direct AI-inspecties.</p>
              </div>

              <div 
                onClick={() => setCurrentScreen('report')}
                className="bg-gradient-to-br from-emerald-900/40 to-slate-800 border border-emerald-500/30 rounded-xl p-5 cursor-pointer hover:border-emerald-500 transition shadow-md"
              >
                <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-1">Uitvoerbare Rapporten</h3>
                <p className="text-xs text-slate-400">Bekijk alle opgeslagen componenten, TCO-berekeningen en benodigde appendages.</p>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'drawings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="font-semibold text-sm">Upload PDF Installatietekening</h2>
                <p className="text-xs text-slate-400">Selecteer een PDF-tekening om inspectiepunten te plaatsen.</p>
              </div>
              <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition shadow">
                Kies PDF
                <input type="file" accept="application/pdf,image/*" onChange={handleDrawingUpload} className="hidden" />
              </label>
            </div>

            {selectedDrawing ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 relative overflow-hidden">
                <p className="text-xs text-blue-400 mb-2 font-medium">👉 Tik ergens op de tekening om een inspectiepunt te plaatsen.</p>
                <div 
                  className="relative border border-slate-600 rounded bg-slate-950 overflow-hidden cursor-crosshair min-h-[350px] flex items-center justify-center"
                  onClick={handleDrawingClick}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                    <FileText className="w-16 h-16 mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-400">{selectedDrawing.name}</p>
                    <span className="text-[10px] text-slate-500 mt-1">Actieve Tekeningen Viewer</span>
                  </div>

                  {pins.filter(p => p.drawingId === selectedDrawing.id).map((pin, idx) => (
                    <div 
                      key={pin.id}
                      className="absolute w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(pin);
                        setCurrentScreen('inspect');
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-800/50 border border-dashed border-slate-700 rounded-xl">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Nog geen tekening geselecteerd.</p>
              </div>
            )}
          </div>
        )}

        {currentScreen === 'inspect' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2 text-blue-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" /> Inspectiepunt op Tekening
              </h2>
              
              <div className="my-3">
                {photo ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-600 h-48">
                    <img src={photo} alt="Inspectie" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setPhoto(null)} 
                      className="absolute bottom-2 right-2 bg-slate-900/80 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      Opnieuw foto maken
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                      <Camera className="w-6 h-6 text-blue-400 mb-1" />
                      <span className="text-xs font-medium">Maak Foto van Installatie</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">Notities / Geobserveerd gebrek:</label>
                <textarea 
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Bijv. Abnormale trillingen in de ventilatoras, lichte olielekkage bij de afsluiter..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <button 
                onClick={runAIAnalysis}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {loading ? 'AI analyseert NEN 2767 & onderdelen...' : 'Start AI Beoordeling & Advies'}
              </button>
            </div>

            {aiResult && (
              <div className="bg-slate-800 border border-blue-500/40 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-sm text-blue-300">AI Expert Advies & Uitvoering</h3>
                  <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-1 rounded border border-red-700">{aiResult.conditionScore}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block mb-1 font-medium">Component & Levensduur:</span>
                    <p className="font-semibold text-slate-200">{aiResult.component}</p>
                    <p className="text-amber-400 mt-1 font-semibold">RTL: {aiResult.rtl}</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block mb-1 font-medium">Sector Impact ({activeProject.sector}):</span>
                    <p className="text-slate-300">{aiResult.sectorImpact}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400 block mb-1 font-medium">Strategisch Voorstel & TCO:</span>
                  <p className="text-emerald-400 font-semibold mb-1">{aiResult.strategy}</p>
                  <p className="text-slate-300">{aiResult.tcoPayback}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400 block mb-2 font-semibold text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Benodigde Apparatuur & Appendages (Direct Uitvoerbaar):
                  </span>
                  <ul className="space-y-1.5">
                    {aiResult.materials.map((mat, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-200 bg-slate-800 p-1.5 rounded border border-slate-700">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {mat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {currentScreen === 'report' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-sm">Inspectierapport & Onderdelenlijst</h2>
                <button 
                  onClick={() => alert('PDF Rapport succesvol gegenereerd en gedeeld!')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Download className="w-4 h-4" /> Download PDF Rapport
                </button>
              </div>

              <div className="space-y-3">
                {pins.filter(p => p.aiResult).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Nog geen voltooide AI-inspecties op tekening beschikbaar.</p>
                ) : (
                  pins.filter(p => p.aiResult).map((pin, idx) => (
                    <div key={pin.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs space-y-2">
                      <div className="flex justify-between font-semibold text-blue-400">
                        <span>Punt #{idx + 1} - {pin.aiResult.component}</span>
                        <span className="text-red-400">{pin.aiResult.conditionScore}</span>
                      </div>
                      <p className="text-slate-300"><strong>Advies:</strong> {pin.aiResult.strategy}</p>
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="font-semibold text-slate-400 block mb-1">Benodigdheden:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                          {pin.aiResult.materials.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

