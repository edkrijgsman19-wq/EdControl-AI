        {currentScreen === 'home' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Projectoverzicht</p>
                  <h2 className="text-2xl font-bold text-white mt-2">EdControl AI</h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-700 rounded-full px-3 py-2">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  {lastSavedLabel}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Project</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Actief</p>
                      <p className="text-lg font-semibold text-white">{activeProject.name}</p>
                    </div>
                    <span className="bg-blue-500/15 text-blue-300 text-[10px] rounded-full px-2 py-1">{activeProject.sector}</span>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tekeningen</p>
                  <p className="mt-2 text-3xl font-bold text-white">{drawings.length}</p>
                  <p className="text-xs text-slate-400">geüpload</p>
                </div>

                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Inspecties</p>
                  <p className="mt-2 text-3xl font-bold text-white">{completedPins.length}</p>
                  <p className="text-xs text-slate-400">voltooid</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Project</label>
                  <select
                    value={activeProjectId}
                    onChange={(event) => setActiveProjectId(Number(event.target.value))}
                    className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name} — {project.sector}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={addProject}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nieuw project
                  </button>
                  <button
                    type="button"
                    onClick={exportProjectBackup}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" /> Backup
                  </button>
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" /> Import
                  </button>
                </div>
                <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importProjectBackup} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setCurrentScreen('drawings')}
                className="bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-500/30 rounded-2xl p-5 cursor-pointer hover:border-blue-500 transition shadow-md"
              >
                <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-blue-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">Tekeningen beheren</h3>
                <p className="text-xs text-slate-400">Upload installatietekeningen en markeer inspectiepunten direct op de tekening.</p>
              </div>

              <div
                onClick={() => setCurrentScreen('report')}
                className="bg-gradient-to-br from-emerald-900/40 to-slate-800 border border-emerald-500/30 rounded-2xl p-5 cursor-pointer hover:border-emerald-500 transition shadow-md"
              >
                <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">Rapporten & data</h3>
                <p className="text-xs text-slate-400">Bekijk opgeslagen bevindingen, exporteer een backup en download een overzichtsrapport.</p>
              </div>
            </div>
          </div>
        )}
