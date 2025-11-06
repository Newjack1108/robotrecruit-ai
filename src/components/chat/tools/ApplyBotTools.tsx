'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, X, ChevronDown, ChevronUp, Save, Download, User, Briefcase, FileText, Award, Clipboard } from 'lucide-react';

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface CvProfileData {
  fullName: string;
  contactInfo: string;
  professionalSummary: string;
  workExperience: WorkExperience[];
  skillsQualifications: string;
  jobDescription: string;
}

interface ApplyBotToolsProps {
  conversationId: string;
  onDataChange: (toolType: string, data: any) => void;
  initialData?: {
    cv_profile?: CvProfileData;
  };
}

export function ApplyBotTools({ conversationId, onDataChange, initialData }: ApplyBotToolsProps) {
  const [fullName, setFullName] = useState(initialData?.cv_profile?.fullName || '');
  const [contactInfo, setContactInfo] = useState(initialData?.cv_profile?.contactInfo || '');
  const [professionalSummary, setProfessionalSummary] = useState(initialData?.cv_profile?.professionalSummary || '');
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    initialData?.cv_profile?.workExperience || []
  );
  const [skillsQualifications, setSkillsQualifications] = useState(initialData?.cv_profile?.skillsQualifications || '');
  const [jobDescription, setJobDescription] = useState(initialData?.cv_profile?.jobDescription || '');

  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contact: true,
    summary: true,
    experience: true,
    skills: true,
    jobDescription: true,
  });

  // Profile management
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [profileName, setProfileName] = useState('');

  // Auto-save to tool data whenever any field changes
  useEffect(() => {
    const cvData: CvProfileData = {
      fullName,
      contactInfo,
      professionalSummary,
      workExperience,
      skillsQualifications,
      jobDescription,
    };
    onDataChange('cv_profile', cvData);
  }, [fullName, contactInfo, professionalSummary, workExperience, skillsQualifications, jobDescription, onDataChange]);

  // Load saved profiles on mount
  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
      const response = await fetch('/api/user/cv-profiles');
      if (response.ok) {
        const profiles = await response.json();
        setSavedProfiles(profiles);
      }
    } catch (error) {
      console.error('Failed to load saved profiles:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
    };
    setWorkExperience([...workExperience, newExp]);
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setWorkExperience(workExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      alert('Please enter a profile name');
      return;
    }

    const cvData: CvProfileData = {
      fullName,
      contactInfo,
      professionalSummary,
      workExperience,
      skillsQualifications,
      jobDescription,
    };

    try {
      const response = await fetch('/api/user/cv-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          data: cvData,
        }),
      });

      if (response.ok) {
        setShowSaveDialog(false);
        setProfileName('');
        loadSavedProfiles();
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    }
  };

  const handleLoadProfile = async (profileId: string) => {
    if (!profileId) return;
    
    try {
      const response = await fetch(`/api/user/cv-profiles?id=${profileId}`);
      if (response.ok) {
        const profile = await response.json();
        if (profile && profile.data) {
          const data = profile.data;
          setFullName(data.fullName || '');
          setContactInfo(data.contactInfo || '');
          setProfessionalSummary(data.professionalSummary || '');
          setWorkExperience(Array.isArray(data.workExperience) ? data.workExperience : []);
          setSkillsQualifications(data.skillsQualifications || '');
          setJobDescription(data.jobDescription || '');
        }
      } else {
        alert('Failed to load profile');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Failed to load profile');
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Management Header */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <User className="w-5 h-5" />
            CV Profile
          </h3>
          <div className="flex gap-2">
            {savedProfiles.length > 0 && (
              <select
                onChange={(e) => e.target.value && handleLoadProfile(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                defaultValue=""
              >
                <option value="">Load Profile...</option>
                {savedProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => setShowSaveDialog(true)}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Profile
            </Button>
          </div>
        </div>
        {showSaveDialog && (
          <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-700">
            <Input
              placeholder="Enter profile name..."
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="mb-2 bg-gray-900 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveProfile()}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                Save
              </Button>
              <Button
                onClick={() => {
                  setShowSaveDialog(false);
                  setProfileName('');
                }}
                size="sm"
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Full Name and Contact Information */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <button
          onClick={() => toggleSection('contact')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <User className="w-5 h-5" />
            Full Name & Contact Information
          </h3>
          {expandedSections.contact ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.contact && (
          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Textarea
              placeholder="Email, phone number, address, LinkedIn, etc."
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              rows={3}
              className="bg-gray-900 border-gray-600 text-white resize-none"
            />
          </div>
        )}
      </Card>

      {/* Professional Summary */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Professional Summary / Personal Statement
          </h3>
          {expandedSections.summary ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.summary && (
          <div>
            <Textarea
              placeholder="Write a brief professional summary or personal statement highlighting your key strengths and career objectives..."
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              rows={6}
              className="bg-gray-900 border-gray-600 text-white resize-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {professionalSummary.length} characters
            </div>
          </div>
        )}
      </Card>

      {/* Work Experience */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => toggleSection('experience')}
            className="flex items-center gap-2 flex-1"
          >
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </h3>
            {expandedSections.experience ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.experience && (
            <Button
              onClick={addWorkExperience}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 ml-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Experience
            </Button>
          )}
        </div>
        {expandedSections.experience && (
          <div className="space-y-4">
            {workExperience.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No work experience added yet. Click "Add Experience" to get started.</p>
            ) : (
              workExperience.map((exp) => (
                <div key={exp.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-400">Experience Entry</span>
                    <button
                      onClick={() => removeWorkExperience(exp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Job Title / Role"
                    value={exp.role}
                    onChange={(e) => updateWorkExperience(exp.id, 'role', e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                    value={exp.duration}
                    onChange={(e) => updateWorkExperience(exp.id, 'duration', e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                  <Textarea
                    placeholder="Job description, key achievements, responsibilities..."
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                    rows={4}
                    className="bg-gray-900 border-gray-600 text-white resize-none"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Skills & Qualifications */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Skills & Qualifications
          </h3>
          {expandedSections.skills ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.skills && (
          <div>
            <Textarea
              placeholder="List your skills, certifications, qualifications, languages, technical expertise, etc."
              value={skillsQualifications}
              onChange={(e) => setSkillsQualifications(e.target.value)}
              rows={6}
              className="bg-gray-900 border-gray-600 text-white resize-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {skillsQualifications.length} characters
            </div>
          </div>
        )}
      </Card>

      {/* Job Description */}
      <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
        <button
          onClick={() => toggleSection('jobDescription')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            Job Description / Role
          </h3>
          {expandedSections.jobDescription ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.jobDescription && (
          <div>
            <Textarea
              placeholder="Paste the job description or role details here. This will help Apply Bot tailor your CV and cover letter to the specific position."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="bg-gray-900 border-gray-600 text-white resize-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {jobDescription.length} characters
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

