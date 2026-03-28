"use client";
import React, { useState } from 'react';

const CaregiverAlert = () => {
  const [hasAlert, setHasAlert] = useState(false);

  return (
    <div className="flex items-center space-x-4 bg-white p-3 px-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="relative">
        <span className="text-xl">🔔</span>
        {hasAlert && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-[10px] text-slate-400 font-bold uppercase">Primary Caregiver</p>
        <p className="text-sm font-semibold text-slate-700">Medical Portal Active</p>
      </div>
    </div>
  );
};

export default CaregiverAlert;