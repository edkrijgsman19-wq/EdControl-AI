import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, Upload, MapPin, CheckCircle2, Cpu, Layers, Download, ArrowLeft, RefreshCw, Trash2, Plus, Database, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

const DEFAULT_PROJECTS = [
  { id: 1, name: 'St. Antonius Ziekenhuis', sector: 'Ziekenhuizen', location: 'OK-Complex 3' },
  { id: 2, name: 'Kantoorpand Zenith', sector: 'Kantoren', location: 'Dakopbouw - Luchtbehandeling' },
  { id: 3, name: 'Basischool De Kring', sector: 'Scholen', location: 'Ketelhuis' }
];

const STORAGE_KEY = 'edcontrol-ai-app-v2';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export default function EdControlAI() {
  const saved = loadState();

  const [currentScreen, setCurrentScreen] = useState('home');
  const [projects, setProjects] = useState(saved?.projects?.length ? saved.projects : DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(saved?.activeProjectId ?? DEFAULT_PROJECTS[0].id);
  const [drawings, setDrawings] = useState(saved?.drawings ?? []);
  const [selectedDrawingId, setSelectedDrawingId] = useState(saved?.selectedDrawingId ?? null);
  const [pins, setPins] = useState(saved?.pins ?? []);
  const [activePinId, setActivePinId] = useState(saved?.activePinId ?? null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [lastSavedLabel, setLastSavedLabel] = useState('Niet opgeslagen');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const importInputRef = useRef(null);

  const activeProject = projects.find(project => project.id === activeProjectId) ?? projects[0] ?? DEFAULT_PROJECTS[0];
  const selectedDrawing = drawings.find(drawing => drawing.id === selectedDrawingId) ?? null;
  const activePin = pins.find(pin => pin.id === activePinId) ?? null;

  const persistState = (nextProjects = projects, nextDrawings = drawings, nextPins = pins, nextActiveProjectId = activeProjectId, nextSelectedDrawingId = selectedDrawingId, nextActivePinId = activePinId) => {
    const payload = {
      projects: nextProjects,
      activeProjectId: nextActiveProjectId,
      drawings: nextDrawings,
      selectedDrawingId: nextSelectedDrawingId,
      pins: nextPins,
      activePinId: nextActivePinId,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedLabel(`Opgeslagen: ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`);
  };

  useEffect(() => {
    persistState(projects, drawings, pins, activeProjectId, selectedDrawingId, activePinId);
  }, [projects, drawings, pins, activeProjectId, selectedDrawingId, activePinId]);

  const addProject = () => {
    const nextId = Date.now();
    const newProject = {
      id: nextId,
      name: `Nieuw project ${projects.length + 1}`,
      sector: 'Kantoren',
      location: 'Locatie aanmaken'
    };

    const nextProjects = [...projects, newProject];
    setProjects(nextProjects);
    setActiveProjectId(nextId);
    persistState(nextProjects, drawings, pins, nextId, selectedDrawingId, activePinId);
  };

  const exportProjectBackup = () => {
    const payload = {
      projects,
      drawings,
      pins,
      activeProjectId,
      selectedDrawingId,
      activePinId,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edcontrol-ai-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProjectBackup = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.projects)) {
          alert('Ongeldig backup-bestand.');
          return;
        }

        setProjects(parsed.projects);
        setActiveProjectId(parsed.activeProjectId ?? parsed.projects[0]?.id ?? 1);
        setDrawings(parsed.drawings ?? []);
        setSelectedDrawingId(parsed.selectedDrawingId ?? null);
        setPins(parsed.pins ?? []);
        setActivePinId(parsed.activePinId ?? null);
        setCurrentScreen('home');
        persistState(parsed.projects, parsed.drawings ?? [], parsed.pins ?? [], parsed.activeProjectId ?? parsed.projects[0]?.id ?? 1, parsed.selectedDrawingId ?? null, parsed.activePinId ?? null);
      } catch (error) {
        alert('Het backup-bestand kon niet worden gelezen.');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const resetInspectionForm = () => {
    setPhoto(null);
    setNote('');
    setAiResult(null);
    setActivePinId(null);
  };

  const handleDrawingUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newDrawing = {
      id: Date.now(),
      name: file.name,
      type: file.type || 'application/pdf',
      url
    };

    const nextDrawings = [...drawings, newDrawing];
    setDrawings(nextDrawings);
    setSelectedDrawingId(newDrawing.id);
    setCurrentScreen('drawings');
    persistState(projects, nextDrawings, pins, activeProjectId, newDrawing.id, activePinId);
    event.target.value = '';
  };

  const handleDrawingClick = (event) => {
    if (!selectedDrawing) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPin = {
      id: Date.now(),
      drawingId: selectedDrawing.id,
      x,
      y,
      note: '',
      photo: null,
      aiResult: null,
      createdAt: new Date().toISOString()
    };

    const nextPins = [...pins, newPin];
    setPins(nextPins);
    setActivePinId(newPin.id);
    resetInspectionForm();
    setCurrentScreen('inspect');
    persistState(projects, drawings, nextPins, activeProjectId, selectedDrawingId, newPin.id);
  };

  const handleCapture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const runAIAnalysis = () => {
    if (!photo) return;
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
        strategy: 'Directe vervanging aanbevolen voor het stookseizoen.',
        tcoPayback: 'Investering €12.500 | Verwachte energiewinst: €3.400/jaar | Payback: 3.7 jaar',
        materials: [
          '1x Platenwarmtewisselaar (RVS 316, spec. capaciteit 4500 m3/h)',
          '2x Regelaandrijving 24V (Belimo NM24A-SR)',
          '4x Flenzen PN16 DN50 inclusief AFM-pakkingen',
          '1x Modulating 3-weg regelklep (Siemens VVF43...)'
        ]
      };

      setAiResult(mockResult);

      if (activePinId) {
        const nextPins = pins.map(pin =>
          pin.id === activePinId
            ? { ...pin, note, photo, aiResult: mockResult }
            : pin
        );
        setPins(nextPins);
        persistState(projects, drawings, nextPins, activeProjectId, selectedDrawingId, activePinId);
      }

      setLoading(false);
    }, 1200);
  };

  const removePin = (pinId) => {
    const nextPins = pins.filter(pin => pin.id !== pinId);
    setPins(nextPins);
    persistState(projects, drawings, nextPins, activeProjectId, selectedDrawingId, null);

    if (activePinId === pinId) {
      resetInspectionForm();
      setCurrentScreen('drawings');
    }
  };

  const downloadHtmlReport = () => {
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
          <div class="meta">
            Project: ${activeProject.name}<br />
            Sector: ${activeProject.sector}<br />
            Datum: ${new Date().toLocaleDateString('nl-NL')}
          </div>
          ${completedPins.map((pin, index) => `
            <div class="card">
              <strong>Punt ${index + 1}</strong>
              <p><strong>Component:</strong> ${pin.aiResult.component}</p>
              <p><strong>Conditie:</strong> ${pin.aiResult.conditionScore}</p>
              <p><strong>Strategie:</strong> ${pin.aiResult.strategy}</p>
              <p><strong>TCO:</strong> ${pin.aiResult.tcoPayback}</p>
              <p><strong>Opmerking:</strong> ${pin.note || 'Geen notities'}</p>
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
  const completedPins = pins.filter(pin => pin.aiResult);

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
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-md font-semibold text-slate-200">Actieve Locatie & Project</h2>
                <span className="text-[10px] text-slate-300 bg-slate-700 px-2 py-1 rounded-full">{lastSavedLabel}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={addProject}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Project toevoegen
                </button>
                <button
                  type="button"
                  onClick={exportProjectBackup}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5" /> Backup export
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Backup import
                </button>
                <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importProjectBackup} />
              </div>

              <select
                value={activeProjectId}
                onChange={(event) => setActiveProjectId(Number(event.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name} — {project.sector}</option>
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
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-1">Data & Rapporten</h3>
                <p className="text-xs text-slate-400">Inspecties worden lokaal opgeslagen en kunnen als backup worden geëxporteerd.</p>
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

            {drawings.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <div className="flex gap-2 flex-wrap mb-3">
                  {drawings.map(drawing => (
                    <button
                      key={drawing.id}
                      type="button"
                      onClick={() => setSelectedDrawingId(drawing.id)}
                      className={`px-3 py-2 text-xs rounded-lg border ${selectedDrawingId === drawing.id ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}
                    >
                      {drawing.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

                  {pins.filter(pin => pin.drawingId === selectedDrawing.id).map((pin, idx) => (
                    <div
                      key={pin.id}
                      className="absolute w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActivePinId(pin.id);
                        setNote(pin.note || '');
                        setPhoto(pin.photo || null);
                        setAiResult(pin.aiResult || null);
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-sm mb-2 text-blue-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" /> Inspectiepunt op Tekening
                </h2>
                {activePinId && (
                  <button
                    onClick={() => removePin(activePinId)}
                    className="text-xs text-red-300 border border-red-700 rounded-lg px-2 py-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Verwijder punt
                  </button>
                )}
              </div>

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
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Bijv. Abnormale trillingen in de ventilatoras, lichte olielekkage bij de afsluiter..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={runAIAnalysis}
                  disabled={loading || !photo}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  {loading ? 'AI analyseert NEN 2767 & onderdelen...' : 'Start AI Beoordeling & Advies'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setNote('');
                    setAiResult(null);
                    setActivePinId(null);
                    setCurrentScreen('drawings');
                  }}
                  className="px-3 py-3 bg-slate-700 rounded-xl text-xs border border-slate-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
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
                    {aiResult.materials.map((mat, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-200 bg-slate-800 p-1.5 rounded border border-slate-700">
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
                  onClick={downloadHtmlReport}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={completedPins.length === 0}
                >
                  <Download className="w-4 h-4" /> Download HTML Rapport
                </button>
              </div>

              <div className="space-y-3">
                {completedPins.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Nog geen voltooide AI-inspecties op tekening beschikbaar.</p>
                ) : (
                  completedPins.map((pin, index) => (
                    <div key={pin.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs space-y-2">
                      <div className="flex justify-between font-semibold text-blue-400">
                        <span>Punt #{index + 1} - {pin.aiResult.component}</span>
                        <span className="text-red-400">{pin.aiResult.conditionScore}</span>
                      </div>
                      <p className="text-slate-300"><strong>Advies:</strong> {pin.aiResult.strategy}</p>
                      <p className="text-slate-300"><strong>Opmerking:</strong> {pin.note || 'Geen notities'}</p>
                      <div className="bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="font-semibold text-slate-400 block mb-1">Benodigdheden:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                          {pin.aiResult.materials.map((material, materialIndex) => <li key={materialIndex}>{material}</li>)}
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
