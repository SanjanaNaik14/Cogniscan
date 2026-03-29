// components/MedicalIntakeForm.tsx
"use client";
import { useState } from 'react';
import { useAssessment } from '@/context/AssessmentContext';

export function MedicalIntakeForm() {
  const { medicalProfile, setMedicalProfile } = useAssessment();
  const [form, setForm] = useState({
    age: '', gender: '0', educationyears: '',
    diabetes: '0', smoking: '0',
    hypertension: '0', hypercholesterolemia: '0'
  });

  if (medicalProfile) return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center space-x-4">
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">✓</div>
      <div>
        <h3 className="text-lg font-bold text-emerald-900">Patient Profile Recorded</h3>
        <p className="text-emerald-600 text-sm">Age {medicalProfile.age} · {medicalProfile.educationyears} years education</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-violet-50 w-12 h-12 rounded-xl flex items-center justify-center text-violet-500 text-2xl mb-4">📋</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Profile</h3>
      <p className="text-slate-500 mb-6">Required before assessment begins.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
          <input type="number" value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="e.g. 72" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
          <select value={form.gender}
            onChange={e => setForm({...form, gender: e.target.value})}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Years of Education</label>
          <input type="number" value={form.educationyears}
            onChange={e => setForm({...form, educationyears: e.target.value})}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            placeholder="e.g. 12" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Smoking</label>
          <select value={form.smoking}
            onChange={e => setForm({...form, smoking: e.target.value})}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <option value="0">Never</option>
            <option value="1">Former</option>
            <option value="2">Current</option>
          </select>
        </div>
      </div>

      {/* Toggles for binary medical history */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { key: 'diabetes', label: 'Diabetes' },
          { key: 'hypertension', label: 'Hypertension' },
          { key: 'hypercholesterolemia', label: 'High Cholesterol' }
        ].map(({ key, label }) => (
          <button key={key}
            onClick={() => setForm({...form, [key]: form[key as keyof typeof form] === '0' ? '1' : '0'})}
            className={`p-3 rounded-xl border font-bold text-sm transition-all ${
              form[key as keyof typeof form] === '1'
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
            {label} {form[key as keyof typeof form] === '1' ? '✓' : '○'}
          </button>
        ))}
      </div>

      <button
        onClick={() => setMedicalProfile({
          age: Number(form.age),
          gender: Number(form.gender),
          educationyears: Number(form.educationyears),
          diabetes: Number(form.diabetes),
          smoking: Number(form.smoking),
          hypertension: Number(form.hypertension),
          hypercholesterolemia: Number(form.hypercholesterolemia),
        })}
        disabled={!form.age || !form.educationyears}
        className="w-full mt-6 bg-slate-900 text-white py-4 font-bold rounded-xl disabled:opacity-40">
        Save Profile & Begin Assessment →
      </button>
    </div>
  );
}