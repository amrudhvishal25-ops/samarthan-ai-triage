"use client";
import React from "react";

export const StatsBento = () => {
  return (
    <section className="bg-background flex flex-col justify-center py-12">
      <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 max-w-6xl mx-auto px-6 w-full">
        {/* Primary Stat */}
        <div className="md:col-span-3 md:row-span-2 bg-primary rounded-lg p-10 flex flex-col justify-between overflow-hidden relative shadow-sm">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-20 pointer-events-none"></div>
          <div>
            <span className="inline-block px-3 py-1 bg-white/10 rounded-md text-[10px] font-mono font-semibold text-white/80 uppercase tracking-widest mb-6">
              1930 NCRP Framework
            </span>
            <h3 className="text-6xl tracking-tighter text-white font-extrabold">
              60s
            </h3>
          </div>
          <p className="text-white/80 text-sm max-w-sm mt-6 leading-relaxed">
            From panic to formal cybercrime report in under a minute — aligned with the national 1930 Golden Hour response protocol.
          </p>
        </div>

        {/* Secondary Stat A */}
        <div className="md:col-span-3 bg-white rounded-lg p-8 border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Identity Verification
            </p>
            <p className="text-3xl font-bold text-zinc-900">DigiLocker</p>
            <p className="text-xs text-zinc-500 mt-1">1-click Aadhaar & PAN verified complaints</p>
          </div>
          <div className="flex gap-1.5 items-end h-10">
            {[15, 30, 45, 35, 65, 55, 85, 75, 95, 100, 110].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Tertiary Stat B */}
        <div className="md:col-span-1 bg-white rounded-lg p-6 border border-zinc-200 flex flex-col justify-center text-center shadow-xs">
          <p className="text-2xl font-bold text-primary">66C / 66D</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-1">
            IT Act & BNS
          </p>
        </div>

        {/* Tertiary Stat C */}
        <div className="md:col-span-2 bg-zinc-50 rounded-lg p-6 border border-zinc-200 flex items-center gap-4 shadow-xs">
          <div className="size-11 text-lg rounded-md bg-primary text-white flex items-center justify-center shrink-0 font-bold">
            🛡️
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-tight">cybercrime.gov.in</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              FIR-ready structured dossier
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBento;
