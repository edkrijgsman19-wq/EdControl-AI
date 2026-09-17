import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, Upload, MapPin, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Layers, Download, ArrowLeft, RefreshCw } from 'lucide-react';

const DEFAULT_PROJECTS = [
  { id: 1, name: 'St. Antonius Ziekenhuis', sector: 'Ziekenhuizen', location: 'OK-Complex 3' },
  { id: 2, name: 'Kantoorpand Zenith', sector: 'Kantoren', location: 'Dakopbouw - Luchtbehandeling' },
  { id: 3, name: 'Basischool De Kring', sector: 'Scholen', location: 'Ketelhuis' }
];

const STORAGE_KEY = 'edcontrol-ai-state-v1';

function safeParseStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export default function EdControlAI() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const [projects, setProjects] = useState(() => {
    const stored = safeParseStoredState();
    return stored?.projects?.length ? stored.projects : DEFAULT_PROJECTS;
  });

  const [activeProject, setActiveProject] = useState(() => {
    const stored = safeParseStoredState();
    const projectId = stored?.activeProjectId ?? DEFAULT_PROJECTS[0].id;
    return (stored?.projects?.length ? stored.projects : DEFAULT_PROJECTS).find(p => p.id === projectId) || DEFAULT_PROJECTS[0];
  });

  const [drawings, setDrawings] = useState(() => {
    const stored = safeParseStoredState();
    return stored?.drawings ?? [];
  });

  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pins, setPins] = useState(() => {
    const stored = safeParseStoredState();
    return stored?.pins ?? [];
  });
  const [activePin, setActivePin] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const state = {
      projects,
      drawings,
      pins,
      activeProjectId: activeProject?.id ?? DEFAULT_PROJECTS[0].id
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [projects, drawings, pins, activeProject]);

  const handleDrawingUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newDrawing = {
      id: Date.now(),
      name: file.name,
      url: fileUrl,
      type: file.type || 'application/pdf'
    };

    setDrawings((prev) => [...prev, newDrawing]);
    setSelectedDrawing(newDrawing);
    setCurrentScreen('drawings');
  };

  const handleDrawingClick = (e) => {
    if (!selectedDrawing) return;

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

    setPins((prev) => [...prev, newPin]);
    setActivePin(newPin);
    setPhoto(null);
    setNote('');
    setAiResult(null);
    setCurrentScreen('inspect');
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const runAIAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const mockResult = {
        component: 'Luchtbehandelingskast (LBK) Sectie 2 - Warmtewisselaar & Regelklep',
        conditionScore: 'Score 4 (Slechte conditie / Ernstige gebreken)',
        rtl: '1 tot 2 jaar resterend',
        sectorImpact: activeProject.sector === 'Ziekenhuizen'
          ? 'Kritiek risico voor drukverschillen in operatiekamers en microbiologische continuïteit.'
          : activeProject.sector === 'Kantoren'
          ? 'Verhoogd energieverlies, afname comfort en risico op overschrijding energielabel-eisen.'
          : 'Slecht binnenklimaat en verhoogde CO2-waarden door verouderde klepstandaarden.',
        strategy: 'Directe Vervanging aanbevolen voor het stookseizoen.',
        tcoPayback: 'Investering €12.500 | Verwachte energiewinst: €3.400/jaar | Payback: 3.7 jaar',
        materials: [
          '1x Platenwarmtewisselaar (RVS 316, spec. capaciteit 4500 m3/h)',
          '2x Regelaandrijving 24V (Belimo NM24A-SR)',
          '4x Flenzen PN16 DN50 inclusief AFM-pakkingen',
          '1x Modulating 3-weg regelklep (Siemens VVF43...)'
        ]
      };

      setAiResult(mockResult);

      if (activePin) {
        setPins(prev => prev.map(pin =>
          pin.id === activePin.id ? { ...pin, aiResult: mockResult, photo, note } : pin
        ));
      }

      setLoading(false);
    }, 1500);
  };

  const handleReportDownload = () => {
    const completedPins = pins.filter(pin => pin.aiResult);
    if (!completedPins.length) return;

    const reportHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>EdControl AI - Inspectierapport</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1 { margin-bottom: 8px; }
            .meta { color: #475569; margin-bottom: 24px; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
            ul { margin: 8px 0 0 18px; }
            strong { color: #1e293b; }
          </style>
        </head>
        <body>
          <h1>EdControl AI - Inspectierapport</h1>
          <div class="meta">Project: ${activeProject.name}<br />Sector: ${activeProject.sector}<br />Datum: ${new Date().toLocaleDateString('nl-NL')}</div>
          ${completedPins.map((pin, index) => `
            <div class="card">
              <strong>Punt ${index + 1}</strong>
              <p><strong>Component:</strong> ${pin.aiResult.component}</p>
              <p><strong>Conditie:</strong> ${pin.aiResult.conditionScore}</p>
              <p><strong>Strategie:</strong> ${pin.aiResult.strategy}</p>
              <p><strong>TCO:</strong> ${pin.aiResult.tcoPayback}</p>
              <ul>
                ${pin.aiResult.materials.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edcontrol-ai-rapport.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedDrawingIsPdf = selectedDrawing?.type === 'application/pdf' || selectedDrawing?.name?.toLowerCase().endsWith('.pdf');

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
          <button
            onClick={() => setCurrentScreen('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${currentScreen === 'report' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            <Download className="w-4 h-4" /> Rapport
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {currentScreen === 'home' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h2 className="text-md font-semibold mb-3 text-slate-200">Actieve Locatie & Project</h2>
              <select
                value={activeProject?.id ?? 1}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  const proj = projects.find(p => p.id === Number(e.target.value));
                  if (proj) setActiveProject(proj);
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
                <input type="file" accept="application/pdf,image/*" onChange={handleDrawingUpload} className="hidden" ref={fileInputRef} />
              </label>
            </div>

            {selectedDrawing ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 relative overflow-hidden">
                <p className="text-xs text-blue-400 mb-2 font-medium">👉 Tik ergens op de tekening om een inspectiepunt te plaatsen.</p>
                <div
                  className="relative border border-slate-600 rounded bg-slate-950 overflow-hidden cursor-crosshair min-h-[350px] flex items-center justify-center"
                  onClick={handleDrawingClick}
                >
                  {selectedDrawingIsPdf ? (
                    <iframe
                      src={selectedDrawing.url}
                      title={selectedDrawing.name}
                      className="w-full h-[500px] bg-white"
                    />
                  ) : (
                    <img src={selectedDrawing.url} alt={selectedDrawing.name} className="max-h-[500px] w-full object-contain" />
                  )}

                  {pins.filter(p => p.drawingId === selectedDrawing.id).map((pin, idx) => (
                    <div
                      key={pin.id}
                      className="absolute w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePin(pin);
                        setPhoto(pin.photo);
                        setNote(pin.note);
                        setAiResult(pin.aiResult);
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
                      className="absolute bottom-2 right-2 bg-slate-900/80 text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
                    >
                      Opnieuw foto maken
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                      <Camera className="w-6 h-6 text-blue-400 mb-1" />
                      <span className="text-xs font-medium">Maak Foto van Installatie</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" ref={cameraInputRef} />
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
                disabled={loading || !photo}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
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
                  onClick={handleReportDownload}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pins.filter(p => p.aiResult).length === 0}
                >
                  <Download className="w-4 h-4" /> Download HTML Rapport
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
