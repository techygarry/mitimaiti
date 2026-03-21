'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ChevronRight, Check, Plus, Minus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
}

export interface FilterState {
  gender: string;
  ageMin: number;
  ageMax: number;
  ageFlexible: boolean;
  interests: string[];
  verifiedOnly: boolean;
  heightMin: number;
  heightMax: number;
  heightFlexible: boolean;
  intent: string[];
  intentFlexible: boolean;
  religion: string;
  education: string;
  exercise: string;
  smoking: string;
  drinking: string;
  wantsKids: string;
  fluency: string;
  generation: string;
  dietary: string;
  gotra: string;
}

const defaultFilters: FilterState = {
  gender: '',
  ageMin: 21,
  ageMax: 35,
  ageFlexible: true,
  interests: [],
  verifiedOnly: false,
  heightMin: 140,
  heightMax: 200,
  heightFlexible: true,
  intent: [],
  intentFlexible: true,
  religion: '',
  education: '',
  exercise: '',
  smoking: '',
  drinking: '',
  wantsKids: '',
  fluency: '',
  generation: '',
  dietary: '',
  gotra: '',
};

const INTERESTS = [
  'Travel', 'Cooking', 'Cricket', 'Music', 'Fitness',
  'Reading', 'Photography', 'Dancing', 'Art', 'Movies',
  'Yoga', 'Hiking', 'Coffee', 'Food', 'Gaming',
];

const INTENTS = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'open', label: 'Open to anything' },
  { value: 'casual', label: 'Something casual' },
];

// ── Reusable sub-components ──────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${on ? 'bg-rose' : 'bg-gray-300'}`}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  unit,
  step,
  label,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (minV: number, maxV: number) => void;
  unit?: string;
  step?: number;
  label?: string;
}) {
  const s = step || 1;
  const range = max - min;
  const leftPercent = ((valueMin - min) / range) * 100;
  const rightPercent = ((valueMax - min) / range) * 100;

  return (
    <div>
      <p className="text-base font-semibold text-charcoal mb-4">
        {label || `${valueMin}${unit || ''} — ${valueMax}${unit || ''}`}
      </p>
      {/* Track container */}
      <div className="relative h-10 flex items-center">
        {/* Background track */}
        <div className="absolute left-0 right-0 h-[6px] rounded-full bg-gray-200" />
        {/* Active fill between thumbs */}
        <div
          className="absolute h-[6px] rounded-full bg-rose"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={s}
          value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= valueMax - s) onChange(v, valueMax);
          }}
          className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-rose
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:active:scale-110
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-rose
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={s}
          value={valueMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= valueMin + s) onChange(valueMin, v);
          }}
          className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-rose
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:active:scale-110
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-rose
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
  multi,
}: {
  options: { value: string; label: string }[];
  selected: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const isSelected = (val: string) =>
    multi ? (selected as string[]).includes(val) : selected === val;

  const toggle = (val: string) => {
    if (multi) {
      const arr = selected as string[];
      onChange(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    } else {
      onChange(selected === val ? '' : val);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => toggle(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
            isSelected(opt.value)
              ? 'bg-rose text-white shadow-sm'
              : 'bg-gray-100 text-charcoal hover:bg-gray-200'
          }`}
        >
          {opt.label}
          {multi && !isSelected(opt.value) && <Plus className="w-3.5 h-3.5 inline ml-1.5 -mt-0.5" />}
          {multi && isSelected(opt.value) && <Check className="w-3.5 h-3.5 inline ml-1.5 -mt-0.5" />}
        </button>
      ))}
    </div>
  );
}

function ExpandableFilter({
  label,
  isActive,
  onClear,
  children,
}: {
  label: string;
  isActive: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(isActive);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className={`text-sm font-semibold ${isActive ? 'text-rose' : 'text-charcoal'}`}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-xs text-textLight hover:text-rose transition-colors"
            >
              Clear
            </button>
          )}
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-4 h-4 text-textLight" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-charcoal mt-2 mb-3">{children}</h3>
  );
}

// ── Tab content ──────────────────────────────────────────────────────

function EssentialsTab({
  filters,
  update,
}: {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Age */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionLabel>Age range</SectionLabel>
        <DualRangeSlider
          min={18}
          max={60}
          valueMin={filters.ageMin}
          valueMax={filters.ageMax}
          onChange={(a, b) => { update('ageMin', a); update('ageMax', b); }}
          label={`Between ${filters.ageMin} and ${filters.ageMax}`}
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <span className="text-sm text-textLight">Expand range if few results</span>
          <Toggle on={filters.ageFlexible} onChange={(v) => update('ageFlexible', v)} />
        </div>
      </div>

      {/* Height */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionLabel>Height</SectionLabel>
        <DualRangeSlider
          min={120}
          max={220}
          valueMin={filters.heightMin}
          valueMax={filters.heightMax}
          onChange={(a, b) => { update('heightMin', a); update('heightMax', b); }}
          label={`${filters.heightMin} cm — ${filters.heightMax} cm`}
          step={2}
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <span className="text-sm text-textLight">Flexible on height</span>
          <Toggle on={filters.heightFlexible} onChange={(v) => update('heightFlexible', v)} />
        </div>
      </div>

      {/* Looking for */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionLabel>Looking for</SectionLabel>
        <ChipGroup
          options={INTENTS}
          selected={filters.intent}
          onChange={(v) => update('intent', v as string[])}
          multi
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <span className="text-sm text-textLight">Include others if few results</span>
          <Toggle on={filters.intentFlexible} onChange={(v) => update('intentFlexible', v)} />
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionLabel>Shared interests</SectionLabel>
        <p className="text-sm text-textLight mb-3">Tap to prioritize people who share these</p>
        <ChipGroup
          options={INTERESTS.map((i) => ({ value: i.toLowerCase(), label: i }))}
          selected={filters.interests}
          onChange={(v) => update('interests', v as string[])}
          multi
        />
      </div>

      {/* Verified */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-charcoal">Verified profiles only</p>
          <p className="text-xs text-textLight mt-0.5">Photo-verified members</p>
        </div>
        <Toggle on={filters.verifiedOnly} onChange={(v) => update('verifiedOnly', v)} />
      </div>
    </div>
  );
}

function LifestyleTab({
  filters,
  update,
}: {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}) {
  const isNonSindhi = typeof window !== 'undefined' && localStorage.getItem('onboarding_non_sindhi') === 'true';

  return (
    <div className="space-y-4">
      {/* Culture — hidden for non-Sindhi users */}
      {!isNonSindhi && (
      <>
      <p className="text-xs font-semibold text-textLight uppercase tracking-wider mb-1 px-1">Culture</p>

      <ExpandableFilter
        label="Sindhi fluency"
        isActive={!!filters.fluency}
        onClear={() => update('fluency', '')}
      >
        <ChipGroup
          options={[
            { value: 'fluent', label: 'Fluent' },
            { value: 'conversational', label: 'Conversational' },
            { value: 'basic', label: 'Basic' },
            { value: 'learning', label: 'Learning' },
          ]}
          selected={filters.fluency}
          onChange={(v) => update('fluency', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Religion"
        isActive={!!filters.religion}
        onClear={() => update('religion', '')}
      >
        <ChipGroup
          options={[
            { value: 'hindu', label: 'Hindu' },
            { value: 'sikh', label: 'Sikh' },
            { value: 'muslim', label: 'Muslim' },
            { value: 'christian', label: 'Christian' },
            { value: 'spiritual', label: 'Spiritual' },
            { value: 'other', label: 'Other' },
          ]}
          selected={filters.religion}
          onChange={(v) => update('religion', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Dietary preference"
        isActive={!!filters.dietary}
        onClear={() => update('dietary', '')}
      >
        <ChipGroup
          options={[
            { value: 'vegetarian', label: 'Vegetarian' },
            { value: 'non_vegetarian', label: 'Non-Veg' },
            { value: 'eggetarian', label: 'Eggetarian' },
            { value: 'vegan', label: 'Vegan' },
            { value: 'jain', label: 'Jain' },
          ]}
          selected={filters.dietary}
          onChange={(v) => update('dietary', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Generation"
        isActive={!!filters.generation}
        onClear={() => update('generation', '')}
      >
        <ChipGroup
          options={[
            { value: 'sindhi_born', label: 'Sindhi-born' },
            { value: '2nd_gen', label: '2nd Generation' },
            { value: '3rd_gen', label: '3rd Generation' },
            { value: 'mixed', label: 'Mixed heritage' },
          ]}
          selected={filters.generation}
          onChange={(v) => update('generation', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Gotra"
        isActive={!!filters.gotra}
        onClear={() => update('gotra', '')}
      >
        <ChipGroup
          options={[
            { value: 'Lohana', label: 'Lohana' },
            { value: 'Amil', label: 'Amil' },
            { value: 'Bhatia', label: 'Bhatia' },
            { value: 'Chhapru', label: 'Chhapru' },
            { value: 'Sahiti', label: 'Sahiti' },
            { value: 'Dadu', label: 'Dadu' },
          ]}
          selected={filters.gotra}
          onChange={(v) => update('gotra', v as string)}
        />
      </ExpandableFilter>
      </>
      )}

      {/* Lifestyle */}
      <div className="pt-2">
        <p className="text-xs font-semibold text-textLight uppercase tracking-wider mb-3 px-1">Lifestyle</p>
      </div>

      <ExpandableFilter
        label="Wants kids"
        isActive={!!filters.wantsKids}
        onClear={() => update('wantsKids', '')}
      >
        <ChipGroup
          options={[
            { value: 'want', label: 'Wants kids' },
            { value: 'dont_want', label: 'Does not want' },
            { value: 'open', label: 'Open to it' },
            { value: 'has_kids', label: 'Already has' },
          ]}
          selected={filters.wantsKids}
          onChange={(v) => update('wantsKids', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Education"
        isActive={!!filters.education}
        onClear={() => update('education', '')}
      >
        <ChipGroup
          options={[
            { value: 'bachelors', label: 'Bachelors' },
            { value: 'masters', label: 'Masters' },
            { value: 'doctorate', label: 'Doctorate' },
            { value: 'professional', label: 'Professional (CA/MD/LLB)' },
          ]}
          selected={filters.education}
          onChange={(v) => update('education', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Exercise"
        isActive={!!filters.exercise}
        onClear={() => update('exercise', '')}
      >
        <ChipGroup
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'often', label: 'Often' },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'never', label: 'Never' },
          ]}
          selected={filters.exercise}
          onChange={(v) => update('exercise', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Smoking"
        isActive={!!filters.smoking}
        onClear={() => update('smoking', '')}
      >
        <ChipGroup
          options={[
            { value: 'never', label: 'Never' },
            { value: 'socially', label: 'Socially' },
            { value: 'regularly', label: 'Regularly' },
          ]}
          selected={filters.smoking}
          onChange={(v) => update('smoking', v as string)}
        />
      </ExpandableFilter>

      <ExpandableFilter
        label="Drinking"
        isActive={!!filters.drinking}
        onClear={() => update('drinking', '')}
      >
        <ChipGroup
          options={[
            { value: 'never', label: 'Never' },
            { value: 'socially', label: 'Socially' },
            { value: 'regularly', label: 'Regularly' },
          ]}
          selected={filters.drinking}
          onChange={(v) => update('drinking', v as string)}
        />
      </ExpandableFilter>
    </div>
  );
}

// ── Main FilterSheet ─────────────────────────────────────────────────

const TABS = [
  { id: 'essentials', label: 'Essentials' },
  { id: 'lifestyle', label: 'Lifestyle' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function FilterSheet({ isOpen, onClose, onApply }: FilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeTab, setActiveTab] = useState<TabId>('essentials');

  const update = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  // Count active filters
  const activeCount = [
    filters.gender,
    filters.ageMin !== 21 || filters.ageMax !== 35,
    filters.interests.length > 0,
    filters.verifiedOnly,
    filters.heightMin !== 140 || filters.heightMax !== 200,
    filters.intent.length > 0,
    filters.religion,
    filters.education,
    filters.exercise,
    filters.smoking,
    filters.drinking,
    filters.wantsKids,
    filters.fluency,
    filters.generation,
    filters.dietary,
    filters.gotra,
  ].filter(Boolean).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel — slides in from right on desktop, bottom on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-cream z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Discovery filters"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 text-charcoal" />
              </button>
              <h2 className="text-lg font-bold text-charcoal">
                Refine Discovery
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-sm font-medium text-rose hover:text-rose-dark transition-colors"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Tab bar */}
            <div className="px-6 pt-4 pb-2 bg-white">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-rose text-white shadow-sm'
                        : 'text-textLight hover:text-charcoal'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'essentials' && <EssentialsTab filters={filters} update={update} />}
                  {activeTab === 'lifestyle' && <LifestyleTab filters={filters} update={update} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <Button fullWidth size="lg" onClick={handleApply}>
                Show Results{activeCount > 0 ? ` (${activeCount} filters)` : ''}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
