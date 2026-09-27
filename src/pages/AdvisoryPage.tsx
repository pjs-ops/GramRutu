import { useState, useEffect } from 'react';
import {
  Thermometer,
  CloudRain,
  Droplets,
  AlertTriangle,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { getPanchayats } from '../services/panchayatService';
import { getCrops, getCropStages, getAdvisory } from '../services/advisoryService';
import type { Panchayat, Crop, CropStage, Advisory } from '../types';

export function AdvisoryPage() {
  const [loading, setLoading] = useState(true);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stages, setStages] = useState<CropStage[]>([]);

  const [selectedPanchayatId, setSelectedPanchayatId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');

  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, c] = await Promise.all([getPanchayats(), getCrops()]);
      setPanchayats(p);
      setCrops(c);
      setLoading(false);
    }
    load();
  }, []);

  const handleCropChange = async (cropId: string) => {
    setSelectedCropId(cropId);
    setSelectedStageId('');
    setAdvisory(null);
    if (cropId) {
      const s = await getCropStages(cropId);
      setStages(s);
    } else {
      setStages([]);
    }
  };

  const handleStageChange = async (stageId: string) => {
    setSelectedStageId(stageId);
    if (selectedPanchayatId && selectedCropId && stageId) {
      setAdvisoryLoading(true);
      const adv = await getAdvisory(selectedPanchayatId, selectedCropId, stageId);
      setAdvisory(adv);
      setAdvisoryLoading(false);
    } else {
      setAdvisory(null);
    }
  };

  const handlePanchayatChange = async (pId: string) => {
    setSelectedPanchayatId(pId);
    if (pId && selectedCropId && selectedStageId) {
      setAdvisoryLoading(true);
      const adv = await getAdvisory(pId, selectedCropId, selectedStageId);
      setAdvisory(adv);
      setAdvisoryLoading(false);
    } else {
      setAdvisory(null);
    }
  };

  if (loading) return <LoadingState message="Loading advisory data..." />;

  const selectedPanchayat = panchayats.find((p) => p.id === selectedPanchayatId);
  const selectedCrop = crops.find((c) => c.id === selectedCropId);
  const selectedStage = stages.find((s) => s.id === selectedStageId);

  return (
    <div>
      <PageHeader
        title="Agricultural Advisory"
        subtitle="Connect localized weather to crop-specific risk and actionable guidance"
      />

      {/* Selection Flow */}
      <SectionHeader title="Selection" description="Choose a panchayat, crop, and growth stage" />
      <div className="bg-white border border-gray-200 rounded-md p-5 mb-6">
        <div className="flex items-end gap-4">
          {/* Panchayat */}
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
              Panchayat
            </label>
            <select
              value={selectedPanchayatId}
              onChange={(e) => handlePanchayatChange(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select Panchayat</option>
              {panchayats.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 mb-2.5" />

          {/* Crop */}
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
              Crop
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={!selectedPanchayatId}
            >
              <option value="">Select Crop</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 mb-2.5" />

          {/* Stage */}
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
              Crop Stage
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={!selectedCropId}
            >
              <option value="">Select Stage</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection summary */}
        {selectedPanchayat && selectedCrop && selectedStage && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{selectedPanchayat.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium">{selectedCrop.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium">{selectedStage.name}</span>
            <span className="text-xs text-slate-400 ml-2">({selectedStage.durationDays} days)</span>
          </div>
        )}
      </div>

      {advisoryLoading && <LoadingState message="Computing advisory..." />}

      {advisory && !advisoryLoading && (
        <div className="space-y-6">
          {/* Weather Context */}
          <div>
            <SectionHeader title="Weather Context" description={`Current conditions at ${selectedPanchayat?.name}`} />
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-orange-50 flex items-center justify-center">
                  <Thermometer className="w-[18px] h-[18px] text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Temperature</p>
                  <p className="text-lg font-semibold text-slate-700">
                    {advisory.weatherContext.temperature}°C
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
                  <CloudRain className="w-[18px] h-[18px] text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Rainfall</p>
                  <p className="text-lg font-semibold text-slate-700">
                    {advisory.weatherContext.rainfall} mm
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-cyan-50 flex items-center justify-center">
                  <Droplets className="w-[18px] h-[18px] text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Humidity</p>
                  <p className="text-lg font-semibold text-slate-700">
                    {advisory.weatherContext.humidity}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <SectionHeader title="Risk Assessment" description={`${selectedCrop?.name} — ${selectedStage?.name} stage`} />
            <div className="grid grid-cols-3 gap-4">
              {advisory.risks.map((risk) => (
                <div
                  key={risk.type}
                  className="bg-white border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{risk.type}</span>
                    </div>
                    <RiskBadge level={risk.level} />
                  </div>
                  <p className="text-xs text-slate-500">{risk.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">Threshold: {risk.threshold}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory */}
          <div>
            <SectionHeader title="Advisory" />
            <div
              className={`border rounded-md p-5 ${
                advisory.urgency === 'High'
                  ? 'bg-orange-50/50 border-orange-200'
                  : advisory.urgency === 'Moderate'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    advisory.urgency === 'High'
                      ? 'bg-orange-100'
                      : advisory.urgency === 'Moderate'
                      ? 'bg-amber-100'
                      : 'bg-emerald-100'
                  }`}
                >
                  <BookOpen
                    className={`w-4 h-4 ${
                      advisory.urgency === 'High'
                        ? 'text-orange-600'
                        : advisory.urgency === 'Moderate'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-700">Recommendation</span>
                    <RiskBadge level={advisory.urgency} size="sm" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {advisory.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!advisory && !advisoryLoading && selectedPanchayatId && selectedCropId && !selectedStageId && (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <p className="text-sm text-slate-500">Select a crop stage to generate the advisory</p>
        </div>
      )}

      {!advisory && !advisoryLoading && !selectedPanchayatId && (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            Select a panchayat, crop, and crop stage to view the agricultural advisory
          </p>
          <p className="text-xs text-slate-400 mt-1">
            The advisory connects localized weather → crop risk → actionable guidance
          </p>
        </div>
      )}
    </div>
  );
}
