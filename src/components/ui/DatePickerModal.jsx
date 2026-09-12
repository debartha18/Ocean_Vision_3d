import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { parseDateString, getFormattedCurrentDate } from '../../utils/dateUtils';

export default function DatePickerModal({ isOpen, onClose, currentDate, onSelectDate }) {
  const { t } = useTranslation();
  const initialParsed = parseDateString(currentDate);
  const [selectedYear, setSelectedYear] = useState(initialParsed.year);
  const [selectedMonth, setSelectedMonth] = useState(initialParsed.month);
  const [selectedDay, setSelectedDay] = useState(initialParsed.day);

  useEffect(() => {
    if (isOpen && currentDate) {
      const p = parseDateString(currentDate);
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedDay(p.day);
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleApply = () => {
    const formatted = `${selectedDay} ${months[selectedMonth].substring(0, 3)} ${selectedYear}`;
    onSelectDate(formatted);
    onClose();
  };

  const today = new Date();
  const presets = [
    { 
      label: `${t('datePicker.today', 'Today')} (${getFormattedCurrentDate(today)}) - Live Satellite Sync`, 
      day: today.getDate(), 
      month: today.getMonth(), 
      year: today.getFullYear() 
    },
    { label: `15 Aug 2026 (${t('datePicker.peakMonsoon', 'Peak Monsoon & Cyclone Remal')})`, day: 15, month: 7, year: 2026 },
    { label: `24 May 2026 (${t('datePicker.preMonsoon', 'Pre-Monsoon Cyclone Mocha')})`, day: 24, month: 4, year: 2026 },
    { label: `15 Jan 2026 (${t('datePicker.winterBaseline', 'Winter Ocean Baseline')})`, day: 15, month: 0, year: 2026 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-6 border border-cyan-400/40 shadow-glow-cyan max-w-lg w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-sky-500/10 text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 shadow-glow-cyan flex items-center justify-center text-cyan-400">
            <CalendarIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">
              {t('datePicker.title', 'Observation Date & Temporal Simulation Engine')}
            </h2>
            <p className="text-xs text-sky-300/70 font-mono">
              {t('datePicker.subtitle', 'Select historical ocean state or choose extreme meteorological event')}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            {t('datePicker.quickScenarios', 'Quick Simulation Scenarios')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDay(p.day);
                  setSelectedMonth(p.month);
                  setSelectedYear(p.year);
                }}
                className="p-2 rounded-xl bg-[#061433]/80 hover:bg-[#0c2356] border border-sky-500/20 text-left text-[11px] font-medium text-sky-200 hover:text-cyan-300 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Navigator */}
        <div className="bg-[#071536]/90 p-4 rounded-2xl border border-sky-500/25 mb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-sky-500/10 text-sky-300 hover:text-white hover:bg-sky-500/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold text-white font-mono">
              {months[selectedMonth]} {selectedYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-sky-500/10 text-sky-300 hover:text-white hover:bg-sky-500/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`h-8 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-glow-cyan scale-105'
                      : 'text-slate-300 hover:bg-sky-500/20 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Summary & Apply */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-500/20">
          <div className="text-xs font-mono text-cyan-300">
            {t('datePicker.selected', 'Selected')}: <span className="font-bold text-white">{selectedDay} {months[selectedMonth]} {selectedYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-slate-300 transition-colors"
            >
              {t('datePicker.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('datePicker.apply', 'Apply Observation Date')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
