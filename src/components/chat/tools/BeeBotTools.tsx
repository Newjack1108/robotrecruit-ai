'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface InspectionData {
  id: string;
  date: string;
  colonyStrength: number;
  queenSpotted: boolean;
  broodPattern: 'good' | 'spotty' | 'poor';
  honeyStores: 'full' | 'adequate' | 'low';
  pestSigns: boolean;
  pestNotes: string;
  healthNotes: string;
}

interface BeeBotToolsProps {
  conversationId: string;
  onDataChange: (toolType: string, data: any) => void;
  initialData?: {
    inspections?: InspectionData[];
  };
}

export function BeeBotTools({ conversationId, onDataChange, initialData }: BeeBotToolsProps) {
  const [inspections, setInspections] = useState<InspectionData[]>(initialData?.inspections || []);
  const [showForm, setShowForm] = useState(false);
  const [currentInspection, setCurrentInspection] = useState<Partial<InspectionData>>({
    colonyStrength: 3,
    queenSpotted: false,
    broodPattern: 'good',
    honeyStores: 'adequate',
    pestSigns: false,
    pestNotes: '',
    healthNotes: '',
  });

  const saveInspection = () => {
    const inspection: InspectionData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      colonyStrength: currentInspection.colonyStrength || 3,
      queenSpotted: currentInspection.queenSpotted || false,
      broodPattern: currentInspection.broodPattern || 'good',
      honeyStores: currentInspection.honeyStores || 'adequate',
      pestSigns: currentInspection.pestSigns || false,
      pestNotes: currentInspection.pestNotes || '',
      healthNotes: currentInspection.healthNotes || '',
    };

    const updated = [inspection, ...inspections];
    setInspections(updated);
    onDataChange('inspections', updated);
    
    // Reset form
    setCurrentInspection({
      colonyStrength: 3,
      queenSpotted: false,
      broodPattern: 'good',
      honeyStores: 'adequate',
      pestSigns: false,
      pestNotes: '',
      healthNotes: '',
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHealthColor = (inspection: InspectionData) => {
    const score = 
      inspection.colonyStrength + 
      (inspection.queenSpotted ? 2 : 0) + 
      (inspection.broodPattern === 'good' ? 2 : inspection.broodPattern === 'spotty' ? 1 : 0) +
      (inspection.honeyStores === 'full' ? 2 : inspection.honeyStores === 'adequate' ? 1 : 0) +
      (inspection.pestSigns ? -2 : 0);
    
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Inspection Form */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            🐝 Hive Inspection
          </h3>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              New Inspection
            </Button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-4">
            {/* Colony Strength */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Colony Strength (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentInspection({ ...currentInspection, colonyStrength: level })}
                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                      currentInspection.colonyStrength === level
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-gray-600 bg-gray-900 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Queen Spotted */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Queen Spotted?
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentInspection({ ...currentInspection, queenSpotted: true })}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    currentInspection.queenSpotted
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-gray-600 bg-gray-900 text-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setCurrentInspection({ ...currentInspection, queenSpotted: false })}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    !currentInspection.queenSpotted
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-gray-600 bg-gray-900 text-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Brood Pattern */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Brood Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['good', 'spotty', 'poor'] as const).map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setCurrentInspection({ ...currentInspection, broodPattern: pattern })}
                    className={`py-2 rounded-lg border-2 transition-all capitalize ${
                      currentInspection.broodPattern === pattern
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-gray-600 bg-gray-900 text-gray-400'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>

            {/* Honey Stores */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Honey Stores
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['full', 'adequate', 'low'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentInspection({ ...currentInspection, honeyStores: level })}
                    className={`py-2 rounded-lg border-2 transition-all capitalize ${
                      currentInspection.honeyStores === level
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-gray-600 bg-gray-900 text-gray-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Pest Signs */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Pest Signs?
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentInspection({ ...currentInspection, pestSigns: true })}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    currentInspection.pestSigns
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-gray-600 bg-gray-900 text-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setCurrentInspection({ ...currentInspection, pestSigns: false })}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    !currentInspection.pestSigns
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-gray-600 bg-gray-900 text-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
              {currentInspection.pestSigns && (
                <textarea
                  placeholder="Describe pest signs..."
                  value={currentInspection.pestNotes}
                  onChange={(e) => setCurrentInspection({ ...currentInspection, pestNotes: e.target.value })}
                  className="w-full mt-2 h-20 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>

            {/* Overall Health Notes */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Overall Health Notes
              </label>
              <textarea
                placeholder="Additional observations, treatments applied, etc..."
                value={currentInspection.healthNotes}
                onChange={(e) => setCurrentInspection({ ...currentInspection, healthNotes: e.target.value })}
                className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={saveInspection} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Inspection
              </Button>
              <Button 
                onClick={() => setShowForm(false)}
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Inspection History */}
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {inspections.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No inspections recorded yet</p>
          ) : (
            inspections.map((inspection) => (
              <div key={inspection.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{formatDate(inspection.date)}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getHealthColor(inspection)}`}>
                    {inspection.pestSigns ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {inspection.pestSigns ? 'Attention Needed' : 'Healthy'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Strength:</span>{' '}
                    <span className="text-white">{inspection.colonyStrength}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Queen:</span>{' '}
                    <span className={inspection.queenSpotted ? 'text-green-400' : 'text-red-400'}>
                      {inspection.queenSpotted ? 'Spotted' : 'Not Seen'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Brood:</span>{' '}
                    <span className="text-white capitalize">{inspection.broodPattern}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Stores:</span>{' '}
                    <span className="text-white capitalize">{inspection.honeyStores}</span>
                  </div>
                </div>

                {inspection.pestSigns && inspection.pestNotes && (
                  <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
                    <div className="text-xs font-medium text-red-400 mb-1">Pest Notes:</div>
                    <div className="text-sm text-gray-300">{inspection.pestNotes}</div>
                  </div>
                )}

                {inspection.healthNotes && (
                  <div className="mt-3 p-2 bg-gray-900/50 border border-gray-600 rounded">
                    <div className="text-xs font-medium text-gray-400 mb-1">Health Notes:</div>
                    <div className="text-sm text-gray-300">{inspection.healthNotes}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

