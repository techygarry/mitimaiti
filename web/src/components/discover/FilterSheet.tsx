'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
}

interface FilterState {
  ageMin: number;
  ageMax: number;
  intent: string;
  religion: string;
  heightMin: number;
  heightMax: number;
  gender: string;
  dietary: string;
  fluency: string;
  generation: string;
  gotra: string;
  education: string;
  smoking: string;
  drinking: string;
  exercise: string;
  wantsKids: string;
}

const defaultFilters: FilterState = {
  ageMin: 21,
  ageMax: 35,
  intent: '',
  religion: '',
  heightMin: 140,
  heightMax: 200,
  gender: '',
  dietary: '',
  fluency: '',
  generation: '',
  gotra: '',
  education: '',
  smoking: '',
  drinking: '',
  exercise: '',
  wantsKids: '',
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-textLight uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal focus:border-rose focus:ring-1 focus:ring-rose-light outline-none transition-all appearance-none"
        aria-label={label}
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function RangeInput({
  label,
  minValue,
  maxValue,
  min,
  max,
  onMinChange,
  onMaxChange,
  unit,
}: {
  label: string;
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-textLight uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(Number(e.target.value))}
          min={min}
          max={maxValue}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal text-center focus:border-rose outline-none"
          aria-label={`Minimum ${label}`}
        />
        <span className="text-textLight text-sm">to</span>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          min={minValue}
          max={max}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal text-center focus:border-rose outline-none"
          aria-label={`Maximum ${label}`}
        />
        {unit && <span className="text-xs text-textLight">{unit}</span>}
      </div>
    </div>
  );
}

export default function FilterSheet({ isOpen, onClose, onApply }: FilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setFilters(defaultFilters);

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bottom-sheet-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bottom-sheet-content"
            role="dialog"
            aria-modal="true"
            aria-label="Discovery filters"
          >
            <div className="bottom-sheet-handle" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-charcoal">Filters</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-textLight hover:text-rose transition-colors rounded-lg touch-target"
                  aria-label="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5 text-textLight" />
                </button>
              </div>
            </div>

            {/* Filter grid */}
            <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <RangeInput
                label="Age Range"
                minValue={filters.ageMin}
                maxValue={filters.ageMax}
                min={18}
                max={60}
                onMinChange={(v) => update('ageMin', v)}
                onMaxChange={(v) => update('ageMax', v)}
              />

              <RangeInput
                label="Height"
                minValue={filters.heightMin}
                maxValue={filters.heightMax}
                min={120}
                max={220}
                onMinChange={(v) => update('heightMin', v)}
                onMaxChange={(v) => update('heightMax', v)}
                unit="cm"
              />

              <div className="grid grid-cols-2 gap-4">
                <FilterSelect
                  label="Intent"
                  value={filters.intent}
                  onChange={(v) => update('intent', v)}
                  options={[
                    { value: 'casual', label: 'Casual' },
                    { value: 'open', label: 'Open to Anything' },
                    { value: 'marriage', label: 'Marriage' },
                  ]}
                />
                <FilterSelect
                  label="Gender"
                  value={filters.gender}
                  onChange={(v) => update('gender', v)}
                  options={[
                    { value: 'man', label: 'Men' },
                    { value: 'woman', label: 'Women' },
                    { value: 'nonbinary', label: 'Non-binary' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FilterSelect
                  label="Religion"
                  value={filters.religion}
                  onChange={(v) => update('religion', v)}
                  options={[
                    { value: 'hindu', label: 'Hindu' },
                    { value: 'sikh', label: 'Sikh' },
                    { value: 'muslim', label: 'Muslim' },
                    { value: 'christian', label: 'Christian' },
                    { value: 'spiritual', label: 'Spiritual' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <FilterSelect
                  label="Dietary"
                  value={filters.dietary}
                  onChange={(v) => update('dietary', v)}
                  options={[
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'non_vegetarian', label: 'Non-Veg' },
                    { value: 'eggetarian', label: 'Eggetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'jain', label: 'Jain' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FilterSelect
                  label="Sindhi Fluency"
                  value={filters.fluency}
                  onChange={(v) => update('fluency', v)}
                  options={[
                    { value: 'fluent', label: 'Fluent' },
                    { value: 'conversational', label: 'Conversational' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'learning', label: 'Learning' },
                  ]}
                />
                <FilterSelect
                  label="Generation"
                  value={filters.generation}
                  onChange={(v) => update('generation', v)}
                  options={[
                    { value: 'sindhi_born', label: 'Sindhi-born' },
                    { value: '2nd_gen', label: '2nd Gen' },
                    { value: '3rd_gen', label: '3rd Gen' },
                    { value: 'mixed', label: 'Mixed' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FilterSelect
                  label="Smoking"
                  value={filters.smoking}
                  onChange={(v) => update('smoking', v)}
                  options={[
                    { value: 'never', label: 'Never' },
                    { value: 'socially', label: 'Socially' },
                    { value: 'regularly', label: 'Regularly' },
                  ]}
                />
                <FilterSelect
                  label="Drinking"
                  value={filters.drinking}
                  onChange={(v) => update('drinking', v)}
                  options={[
                    { value: 'never', label: 'Never' },
                    { value: 'socially', label: 'Socially' },
                    { value: 'regularly', label: 'Regularly' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FilterSelect
                  label="Exercise"
                  value={filters.exercise}
                  onChange={(v) => update('exercise', v)}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'often', label: 'Often' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'never', label: 'Never' },
                  ]}
                />
                <FilterSelect
                  label="Wants Kids"
                  value={filters.wantsKids}
                  onChange={(v) => update('wantsKids', v)}
                  options={[
                    { value: 'want', label: 'Wants' },
                    { value: 'dont_want', label: 'Does not want' },
                    { value: 'open', label: 'Open' },
                  ]}
                />
              </div>
            </div>

            {/* Apply button */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100">
              <Button fullWidth size="lg" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
