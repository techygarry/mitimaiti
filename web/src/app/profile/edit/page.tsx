'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  X,
  Star,
  Camera,
  Check,
  ChevronDown,
} from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { interestOptions, promptOptions } from '@/lib/mockData';

function SelectField({
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
    <div className="mb-4">
      <label className="block text-sm font-medium text-textMain mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            showToast.success('Saved');
          }}
          className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-charcoal focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all pr-10"
          aria-label={label}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textLight pointer-events-none" />
      </div>
    </div>
  );
}

function BasicsTab() {
  const [basics, setBasics] = useState({
    height: '',
    education: '',
    work_title: '',
    company: '',
    drinking: '',
    smoking: '',
    wants_kids: '',
    settling: '',
    exercise: '',
  });

  const update = (key: string, value: string) => {
    setBasics((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-1">
      <div className="mb-4">
        <Input
          label="Height (cm)"
          type="number"
          placeholder="170"
          value={basics.height}
          onChange={(e) => update('height', e.target.value)}
          onBlur={() => basics.height && showToast.success('Saved')}
        />
      </div>
      <div className="mb-4">
        <Input
          label="Education"
          placeholder="e.g., MBA, IIM Ahmedabad"
          value={basics.education}
          onChange={(e) => update('education', e.target.value)}
          onBlur={() => basics.education && showToast.success('Saved')}
        />
      </div>
      <div className="mb-4">
        <Input
          label="Job Title"
          placeholder="e.g., Product Manager"
          value={basics.work_title}
          onChange={(e) => update('work_title', e.target.value)}
          onBlur={() => basics.work_title && showToast.success('Saved')}
        />
      </div>
      <div className="mb-4">
        <Input
          label="Company"
          placeholder="e.g., Google"
          value={basics.company}
          onChange={(e) => update('company', e.target.value)}
          onBlur={() => basics.company && showToast.success('Saved')}
        />
      </div>
      <SelectField
        label="Drinking"
        value={basics.drinking}
        onChange={(v) => update('drinking', v)}
        options={[
          { value: 'never', label: 'Never' },
          { value: 'socially', label: 'Socially' },
          { value: 'regularly', label: 'Regularly' },
        ]}
      />
      <SelectField
        label="Smoking"
        value={basics.smoking}
        onChange={(v) => update('smoking', v)}
        options={[
          { value: 'never', label: 'Never' },
          { value: 'socially', label: 'Socially' },
          { value: 'regularly', label: 'Regularly' },
        ]}
      />
      <SelectField
        label="Want Kids?"
        value={basics.wants_kids}
        onChange={(v) => update('wants_kids', v)}
        options={[
          { value: 'want', label: 'Want someday' },
          { value: 'dont_want', label: "Don't want" },
          { value: 'have_and_want_more', label: 'Have & want more' },
          { value: 'have_and_done', label: 'Have & done' },
          { value: 'open', label: 'Open to it' },
        ]}
      />
      <SelectField
        label="Settling Timeline"
        value={basics.settling}
        onChange={(v) => update('settling', v)}
        options={[
          { value: 'asap', label: 'As soon as possible' },
          { value: '1_2_years', label: '1-2 years' },
          { value: '3_5_years', label: '3-5 years' },
          { value: 'not_sure', label: 'Not sure yet' },
        ]}
      />
    </div>
  );
}

function SindhiTab() {
  const [sindhi, setSindhi] = useState({
    fluency: '',
    religion: '',
    gotra: '',
    generation: '',
    dietary: '',
    family_involvement: '',
  });

  const update = (key: string, value: string) => {
    setSindhi((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-1">
      <SelectField
        label="Sindhi Fluency"
        value={sindhi.fluency}
        onChange={(v) => update('fluency', v)}
        options={[
          { value: 'fluent', label: 'Fluent' },
          { value: 'conversational', label: 'Conversational' },
          { value: 'basic', label: 'Basic' },
          { value: 'learning', label: 'Learning' },
          { value: 'none', label: 'None' },
        ]}
      />
      <SelectField
        label="Religion"
        value={sindhi.religion}
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
      <div className="mb-4">
        <Input
          label="Gotra"
          placeholder="e.g., Lohana, Amil, Bhatia"
          value={sindhi.gotra}
          onChange={(e) => update('gotra', e.target.value)}
          onBlur={() => sindhi.gotra && showToast.success('Saved')}
        />
      </div>
      <SelectField
        label="Generation"
        value={sindhi.generation}
        onChange={(v) => update('generation', v)}
        options={[
          { value: 'sindhi_born', label: 'Sindhi-born' },
          { value: '2nd_gen', label: '2nd Generation' },
          { value: '3rd_gen', label: '3rd Generation' },
          { value: 'mixed', label: 'Mixed heritage' },
        ]}
      />
      <SelectField
        label="Dietary Preference"
        value={sindhi.dietary}
        onChange={(v) => update('dietary', v)}
        options={[
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'non_vegetarian', label: 'Non-Vegetarian' },
          { value: 'eggetarian', label: 'Eggetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'jain', label: 'Jain' },
        ]}
      />
    </div>
  );
}

function ChattiTab() {
  const [chatti, setChatti] = useState({
    chatti_name: '',
    chatti_dob: '',
    time_of_birth: '',
    place_of_birth: '',
    nakshatra: '',
    rashi: '',
    manglik: '',
  });

  const update = (key: string, value: string) => {
    setChatti((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-1">
      <Card variant="filled" padding="md" className="mb-4">
        <p className="text-sm text-textLight">
          Chatti details are used for Kundli matching. They help match you with compatible partners based on traditional astrological calculations.
        </p>
      </Card>
      <div className="mb-4">
        <Input label="Chatti Name" placeholder="Enter your chatti name" value={chatti.chatti_name} onChange={(e) => update('chatti_name', e.target.value)} onBlur={() => chatti.chatti_name && showToast.success('Saved')} />
      </div>
      <div className="mb-4">
        <Input label="Chatti Date of Birth" type="date" value={chatti.chatti_dob} onChange={(e) => { update('chatti_dob', e.target.value); showToast.success('Saved'); }} />
      </div>
      <div className="mb-4">
        <Input label="Time of Birth" type="time" value={chatti.time_of_birth} onChange={(e) => { update('time_of_birth', e.target.value); showToast.success('Saved'); }} />
      </div>
      <div className="mb-4">
        <Input label="Place of Birth" placeholder="e.g., Mumbai, India" value={chatti.place_of_birth} onChange={(e) => update('place_of_birth', e.target.value)} onBlur={() => chatti.place_of_birth && showToast.success('Saved')} />
      </div>
      <SelectField label="Nakshatra" value={chatti.nakshatra} onChange={(v) => update('nakshatra', v)} options={[
        { value: 'ashwini', label: 'Ashwini' }, { value: 'bharani', label: 'Bharani' }, { value: 'krittika', label: 'Krittika' }, { value: 'rohini', label: 'Rohini' }, { value: 'mrigashira', label: 'Mrigashira' }, { value: 'ardra', label: 'Ardra' }, { value: 'punarvasu', label: 'Punarvasu' }, { value: 'pushya', label: 'Pushya' }, { value: 'ashlesha', label: 'Ashlesha' }, { value: 'magha', label: 'Magha' }, { value: 'purva_phalguni', label: 'Purva Phalguni' }, { value: 'uttara_phalguni', label: 'Uttara Phalguni' }, { value: 'hasta', label: 'Hasta' }, { value: 'chitra', label: 'Chitra' }, { value: 'swati', label: 'Swati' }, { value: 'vishakha', label: 'Vishakha' }, { value: 'anuradha', label: 'Anuradha' }, { value: 'jyeshtha', label: 'Jyeshtha' }, { value: 'mula', label: 'Mula' }, { value: 'purva_ashadha', label: 'Purva Ashadha' }, { value: 'uttara_ashadha', label: 'Uttara Ashadha' }, { value: 'shravana', label: 'Shravana' }, { value: 'dhanishta', label: 'Dhanishta' }, { value: 'shatabhisha', label: 'Shatabhisha' }, { value: 'purva_bhadrapada', label: 'Purva Bhadrapada' }, { value: 'uttara_bhadrapada', label: 'Uttara Bhadrapada' }, { value: 'revati', label: 'Revati' },
      ]} />
      <SelectField label="Rashi" value={chatti.rashi} onChange={(v) => update('rashi', v)} options={[
        { value: 'mesh', label: 'Mesh (Aries)' }, { value: 'vrishabh', label: 'Vrishabh (Taurus)' }, { value: 'mithun', label: 'Mithun (Gemini)' }, { value: 'kark', label: 'Kark (Cancer)' }, { value: 'sinh', label: 'Sinh (Leo)' }, { value: 'kanya', label: 'Kanya (Virgo)' }, { value: 'tula', label: 'Tula (Libra)' }, { value: 'vrishchik', label: 'Vrishchik (Scorpio)' }, { value: 'dhanu', label: 'Dhanu (Sagittarius)' }, { value: 'makar', label: 'Makar (Capricorn)' }, { value: 'kumbh', label: 'Kumbh (Aquarius)' }, { value: 'meen', label: 'Meen (Pisces)' },
      ]} />
      <SelectField label="Manglik" value={chatti.manglik} onChange={(v) => update('manglik', v)} options={[
        { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'partial', label: 'Partial (Anshik)' }, { value: 'not_sure', label: 'Not sure' },
      ]} />
    </div>
  );
}

function CultureTab() {
  const [culture, setCulture] = useState({
    mother_tongue: '',
    community_org: '',
    cultural_events: '',
  });

  const update = (key: string, value: string) => {
    setCulture((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <Input label="Mother Tongue" placeholder="e.g., Sindhi, Hindi" value={culture.mother_tongue} onChange={(e) => update('mother_tongue', e.target.value)} onBlur={() => culture.mother_tongue && showToast.success('Saved')} />
      </div>
      <div>
        <Input label="Community Organization" placeholder="e.g., Sindhi Panchayat, SWAS" value={culture.community_org} onChange={(e) => update('community_org', e.target.value)} onBlur={() => culture.community_org && showToast.success('Saved')} helperText="Any Sindhi community group you belong to" />
      </div>
      <div>
        <Input label="Cultural Events" placeholder="e.g., Chaliha Sahib, Thadri, Jhulelal" value={culture.cultural_events} onChange={(e) => update('cultural_events', e.target.value)} onBlur={() => culture.cultural_events && showToast.success('Saved')} helperText="Comma-separated festivals and events you celebrate" />
      </div>
    </div>
  );
}

function PersonalityTab() {
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([]);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [promptAnswer, setPromptAnswer] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
        ? [...prev, interest]
        : prev
    );
  };

  const addPrompt = () => {
    if (!selectedPrompt || !promptAnswer.trim()) return;
    setPrompts((prev) => [...prev, { question: selectedPrompt, answer: promptAnswer.trim() }]);
    setSelectedPrompt('');
    setPromptAnswer('');
    setAddingPrompt(false);
    showToast.success('Prompt added!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-textMain mb-1.5">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => bio && showToast.success('Saved')}
          placeholder="Tell people about yourself..."
          maxLength={500}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-charcoal placeholder:text-textLight/50 focus:border-rose focus:ring-2 focus:ring-rose-light outline-none transition-all resize-none"
          aria-label="Bio"
        />
        <p className="text-xs text-textLight mt-1">{bio.length}/500</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-textMain">Prompts ({prompts.length}/3)</label>
          {prompts.length < 3 && (
            <button onClick={() => setAddingPrompt(true)} className="text-sm font-semibold text-rose" aria-label="Add prompt">+ Add</button>
          )}
        </div>
        {prompts.map((prompt, i) => (
          <Card key={i} variant="filled" padding="md" className="mb-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-rose uppercase tracking-wide mb-1">{prompt.question}</p>
                <p className="text-textMain text-sm">{prompt.answer}</p>
              </div>
              <button onClick={() => { setPrompts((prev) => prev.filter((_, idx) => idx !== i)); showToast.success('Prompt removed'); }} className="text-textLight hover:text-red-500 transition-colors ml-2 touch-target" aria-label="Remove prompt">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {addingPrompt && (
          <Card variant="outlined" padding="md" className="mt-2">
            <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal mb-2 outline-none focus:border-rose" aria-label="Choose a prompt">
              <option value="">Choose a prompt...</option>
              {promptOptions.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            <textarea value={promptAnswer} onChange={(e) => setPromptAnswer(e.target.value)} placeholder="Your answer..." rows={3} maxLength={200} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-textLight/50 outline-none focus:border-rose resize-none mb-2" aria-label="Prompt answer" />
            <div className="flex gap-2">
              <button onClick={() => setAddingPrompt(false)} className="flex-1 py-2 text-sm font-medium text-textLight bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors touch-target">Cancel</button>
              <button onClick={addPrompt} disabled={!selectedPrompt || !promptAnswer.trim()} className="flex-1 py-2 text-sm font-medium text-white bg-rose rounded-xl hover:bg-rose-dark transition-colors disabled:opacity-50 touch-target">Add</button>
            </div>
          </Card>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-textMain mb-3">Interests ({selectedInterests.length}/10)</label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all touch-target ${
                  isSelected ? 'bg-rose text-white border-rose' : 'bg-white text-textMain border-gray-200 hover:border-rose-light'
                }`}
                aria-pressed={isSelected}
              >
                {interest}
                {isSelected && <Check className="w-3.5 h-3.5 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Input label="Languages (comma-separated)" placeholder="e.g., Sindhi, Hindi, English" helperText="List the languages you speak" onBlur={() => showToast.success('Saved')} />
      </div>

      <div>
        <Input label="Voice Intro URL" placeholder="Upload a voice introduction" helperText="Optional: add a short voice intro to your profile" onBlur={() => showToast.success('Saved')} />
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AppShell>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
            <h1 className="text-2xl font-bold text-charcoal">Edit Profile</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Photo Grid */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h2 className="font-semibold text-charcoal mb-4">Photos</h2>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:border-rose hover:bg-rose/5 transition-all touch-target"
                      aria-label={i === 0 ? 'Upload main photo' : `Upload photo ${i + 1}`}
                    >
                      {i === 0 ? (
                        <>
                          <Camera className="w-7 h-7 text-textLight/40 mb-1" />
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 text-gold" />
                            <span className="text-xs text-textLight">Main</span>
                          </div>
                        </>
                      ) : (
                        <Plus className="w-7 h-7 text-textLight/40" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-textLight mt-3 text-center">
                  Add up to 6 photos. First photo is your main profile photo.
                </p>
              </div>
            </div>

            {/* Right Column - Tabbed Form */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <Tabs
                  tabs={[
                    { id: 'basics', label: 'My Basics' },
                    { id: 'sindhi', label: 'Sindhi Identity' },
                    { id: 'chatti', label: 'My Chatti' },
                    { id: 'culture', label: 'My Culture' },
                    { id: 'personality', label: 'Personality' },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'basics' && <BasicsTab />}
                  {activeTab === 'sindhi' && <SindhiTab />}
                  {activeTab === 'chatti' && <ChattiTab />}
                  {activeTab === 'culture' && <CultureTab />}
                  {activeTab === 'personality' && <PersonalityTab />}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
