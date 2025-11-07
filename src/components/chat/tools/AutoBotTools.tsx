'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, Car, ClipboardList, RotateCcw } from 'lucide-react';

interface AutoBotToolsProps {
  conversationId: string;
  onDataChange: (toolType: string, data: any) => void;
  initialData?: {
    vehicle_profile?: VehicleProfileData;
  };
}

interface VehicleProfileData {
  make?: string;
  model?: string;
  trim?: string;
  year?: string;
  registration?: string;
  motDueDate?: string;
  nextServiceDate?: string;
  mileageAtLastService?: string;
  notes?: string;
}

export function AutoBotTools({ conversationId, onDataChange, initialData }: AutoBotToolsProps) {
  const hasInitialized = useRef(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [year, setYear] = useState('');
  const [registration, setRegistration] = useState('');
  const [motDueDate, setMotDueDate] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [mileageAtLastService, setMileageAtLastService] = useState('');
  const [notes, setNotes] = useState('');

  // Populate state from initial data once when it becomes available
  useEffect(() => {
    if (hasInitialized.current) return;
    const vehicle = initialData?.vehicle_profile;
    if (vehicle) {
      setMake(vehicle.make || '');
      setModel(vehicle.model || '');
      setTrim(vehicle.trim || '');
      setYear(vehicle.year || '');
      setRegistration(vehicle.registration || '');
      setMotDueDate(vehicle.motDueDate || '');
      setNextServiceDate(vehicle.nextServiceDate || '');
      setMileageAtLastService(vehicle.mileageAtLastService || '');
      setNotes(vehicle.notes || '');
      hasInitialized.current = true;
    }
  }, [initialData]);

  // Auto-save whenever fields change
  useEffect(() => {
    const vehicleData: VehicleProfileData = {
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      trim: trim.trim() || undefined,
      year: year.trim() || undefined,
      registration: registration.trim().toUpperCase() || undefined,
      motDueDate: motDueDate || undefined,
      nextServiceDate: nextServiceDate || undefined,
      mileageAtLastService: mileageAtLastService.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onDataChange('vehicle_profile', vehicleData);
  }, [make, model, trim, year, registration, motDueDate, nextServiceDate, mileageAtLastService, notes, onDataChange]);

  const resetVehicleProfile = () => {
    setMake('');
    setModel('');
    setTrim('');
    setYear('');
    setRegistration('');
    setMotDueDate('');
    setNextServiceDate('');
    setMileageAtLastService('');
    setNotes('');
    hasInitialized.current = true; // Prevent re-populating after reset
  };

  const friendlyRegistration = registration ? registration.toUpperCase() : '';

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/60 border-cyan-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Vehicle Profile</h3>
              <p className="text-xs text-gray-400">Help Auto Bot tailor guidance to this car</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetVehicleProfile} className="text-gray-400 hover:text-white">
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Make</label>
            <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Toyota" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Model</label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Corolla" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Trim / Engine</label>
            <Input value={trim} onChange={(e) => setTrim(e.target.value)} placeholder="e.g. SE Hybrid" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Year</label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2021" type="number" min="1950" max={new Date().getFullYear() + 1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Registration</label>
            <Input value={friendlyRegistration} onChange={(e) => setRegistration(e.target.value)} placeholder="e.g. AB12 CDE" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Mileage at Last Service</label>
            <Input value={mileageAtLastService} onChange={(e) => setMileageAtLastService(e.target.value)} placeholder="e.g. 42500" inputMode="numeric" />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/60 border-emerald-500/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Maintenance Schedule</h3>
            <p className="text-xs text-gray-400">Auto Bot will remind you about these deadlines</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">MOT Due Date</label>
            <Input value={motDueDate} onChange={(e) => setMotDueDate(e.target.value)} type="date" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Next Service Date</label>
            <Input value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} type="date" />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/60 border-blue-500/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notes & Recent Work</h3>
            <p className="text-xs text-gray-400">Work done, upcoming repairs, parts to order</p>
          </div>
        </div>

        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="e.g. Replaced brake pads July 2024. Check coolant level monthly. Order new wiper blades before winter."
          className="bg-gray-900 border-gray-700 text-white"
        />
      </Card>

      <p className="text-xs text-gray-500 text-center">
        Vehicle info is stored securely for this conversation so Auto Bot can tailor advice to your exact car.
      </p>
    </div>
  );
}

