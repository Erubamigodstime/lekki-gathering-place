import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = [
  'Media & Content Creation',
  'Fashion & Beauty',
  'Digital Media',
  'Technology & Software Development',
  'Music & Arts',
  'Business & Entrepreneurship',
  'Other',
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Beginner to Intermediate', 'Intermediate to Advanced', 'Beginner to Job-Ready'];
const MODES = ['In-person', 'Online', 'Hybrid', 'In-person / Practical'];

interface CreateClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClassDialog({ open, onClose, onSuccess }: CreateClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: '',
    mode: '',
    description: '',
    overview: '',
    maxCapacity: 20,
    instructorId: '',
    wardId: '',
    thumbnail: '',
    days: [] as string[],
    time: '',
    totalLessons: 10,
    totalWeeks: 10,
    gradingEnabled: true,
    learningOutcomes: [''],
    courseRequirements: [''],
    toolsAndMaterials: [''],
    certificationIssued: true,
    certificationCriteria: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [instructorsRes, wardsRes] = await Promise.all([
        axios.get(`${API_URL}/instructors?status=APPROVED`, { headers }),
        axios.get(`${API_URL}/wards`, { headers }),
      ]);

      setInstructors(instructorsRes.data.data || []);
      setWards(wardsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleArrayFieldChange = (field: 'learningOutcomes' | 'courseRequirements' | 'toolsAndMaterials', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: 'learningOutcomes' | 'courseRequirements' | 'toolsAndMaterials') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayField = (field: 'learningOutcomes' | 'courseRequirements' | 'toolsAndMaterials', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.mode) newErrors.mode = 'Mode is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.overview.trim()) newErrors.overview = 'Overview is required';
    if (formData.maxCapacity < 1) newErrors.maxCapacity = 'Capacity must be at least 1';
    if (!formData.instructorId) newErrors.instructorId = 'Instructor is required';
    if (!formData.wardId) newErrors.wardId = 'Ward is required';
    if (formData.days.length === 0) newErrors.days = 'Select at least one day';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (formData.totalWeeks < 1) newErrors.totalWeeks = 'Total weeks must be at least 1';
    if (formData.totalLessons < 1) newErrors.totalLessons = 'Total lessons must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const selectedInstructor = instructors.find((i) => i.id === formData.instructorId);

      const payload = {
        name: formData.name,
        category: formData.category,
        level: formData.level,
        mode: formData.mode,
        description: formData.description,
        overview: formData.overview,
        maxCapacity: formData.maxCapacity,
        instructorId: formData.instructorId,
        instructorName: selectedInstructor ? `${selectedInstructor.user.firstName} ${selectedInstructor.user.lastName}` : '',
        instructorProfileSlug: selectedInstructor ? `${selectedInstructor.user.firstName.toLowerCase()}-${selectedInstructor.user.lastName.toLowerCase()}` : '',
        wardId: formData.wardId,
        thumbnail: formData.thumbnail || null,
        schedule: {
          days: formData.days,
          time: formData.time,
        },
        totalLessons: formData.totalLessons,
        totalWeeks: formData.totalWeeks,
        gradingEnabled: formData.gradingEnabled,
        learningOutcomes: formData.learningOutcomes.filter((o) => o.trim() !== ''),
        courseRequirements: formData.courseRequirements.filter((r) => r.trim() !== ''),
        toolsAndMaterials: formData.toolsAndMaterials.filter((t) => t.trim() !== ''),
        certificationIssued: formData.certificationIssued,
        certificationCriteria: formData.certificationCriteria || null,
      };

      await axios.post(`${API_URL}/classes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create class:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create class. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      level: '',
      mode: '',
      description: '',
      overview: '',
      maxCapacity: 20,
      instructorId: '',
      wardId: '',
      thumbnail: '',
      days: [],
      time: '',
      totalLessons: 10,
      totalWeeks: 10,
      gradingEnabled: true,
      learningOutcomes: [''],
      courseRequirements: [''],
      toolsAndMaterials: [''],
      certificationIssued: true,
      certificationCriteria: '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>Fill in the details to create a new class offering</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="certification">Certification</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile Photography & Videography"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level}</p>}
                </div>

                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mode && <p className="text-sm text-red-500 mt-1">{errors.mode}</p>}
                </div>

                <div>
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Select value={formData.instructorId} onValueChange={(value) => setFormData({ ...formData, instructorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.user.firstName} {instructor.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.instructorId && <p className="text-sm text-red-500 mt-1">{errors.instructorId}</p>}
                </div>

                <div>
                  <Label htmlFor="ward">Ward *</Label>
                  <Select value={formData.wardId} onValueChange={(value) => setFormData({ ...formData, wardId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.wardId && <p className="text-sm text-red-500 mt-1">{errors.wardId}</p>}
                </div>

                <div>
                  <Label htmlFor="maxCapacity">Max Capacity *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                  />
                  {errors.maxCapacity && <p className="text-sm text-red-500 mt-1">{errors.maxCapacity}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description for listings"
                    rows={2}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="overview">Detailed Overview *</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Comprehensive course overview"
                    rows={4}
                  />
                  {errors.overview && <p className="text-sm text-red-500 mt-1">{errors.overview}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalLessons">Total Lessons *</Label>
                  <Input
                    id="totalLessons"
                    type="number"
                    min="1"
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                  />
                  {errors.totalLessons && <p className="text-sm text-red-500 mt-1">{errors.totalLessons}</p>}
                </div>

                <div>
                  <Label htmlFor="totalWeeks">Total Weeks *</Label>
                  <Input
                    id="totalWeeks"
                    type="number"
                    min="1"
                    value={formData.totalWeeks}
                    onChange={(e) => setFormData({ ...formData, totalWeeks: parseInt(e.target.value) || 0 })}
                  />
                  {errors.totalWeeks && <p className="text-sm text-red-500 mt-1">{errors.totalWeeks}</p>}
                </div>

                <div className="col-span-2">
                  <Label>Schedule Days *</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.days.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <label htmlFor={day} className="text-sm cursor-pointer">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.days && <p className="text-sm text-red-500 mt-1">{errors.days}</p>}
                </div>

                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 6:00 PM - 8:00 PM"
                  />
                  {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gradingEnabled"
                    checked={formData.gradingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, gradingEnabled: !!checked })}
                  />
                  <label htmlFor="gradingEnabled" className="text-sm cursor-pointer">
                    Enable Grading
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Learning Outcomes</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => addArrayField('learningOutcomes')}>
                    <Plus className="h-4 w-4 mr-1" /> Add Outcome
                  </Button>
                </div>
                {formData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={outcome}
                      onChange={(e) => handleArrayFieldChange('learningOutcomes', index, e.target.value)}
                      placeholder="Enter learning outcome"
                    />
                    {formData.learningOutcomes.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeArrayField('learningOutcomes', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Course Requirements</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => addArrayField('courseRequirements')}>
                    <Plus className="h-4 w-4 mr-1" /> Add Requirement
                  </Button>
                </div>
                {formData.courseRequirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={req}
                      onChange={(e) => handleArrayFieldChange('courseRequirements', index, e.target.value)}
                      placeholder="Enter requirement"
                    />
                    {formData.courseRequirements.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeArrayField('courseRequirements', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Tools & Materials</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => addArrayField('toolsAndMaterials')}>
                    <Plus className="h-4 w-4 mr-1" /> Add Tool/Material
                  </Button>
                </div>
                {formData.toolsAndMaterials.map((tool, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={tool}
                      onChange={(e) => handleArrayFieldChange('toolsAndMaterials', index, e.target.value)}
                      placeholder="Enter tool or material"
                    />
                    {formData.toolsAndMaterials.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeArrayField('toolsAndMaterials', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="certification" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="certificationIssued"
                  checked={formData.certificationIssued}
                  onCheckedChange={(checked) => setFormData({ ...formData, certificationIssued: !!checked })}
                />
                <label htmlFor="certificationIssued" className="text-sm cursor-pointer font-medium">
                  Issue Certificate Upon Completion
                </label>
              </div>

              {formData.certificationIssued && (
                <div>
                  <Label htmlFor="certificationCriteria">Certification Criteria</Label>
                  <Textarea
                    id="certificationCriteria"
                    value={formData.certificationCriteria}
                    onChange={(e) => setFormData({ ...formData, certificationCriteria: e.target.value })}
                    placeholder="e.g., Completion of final assessment and submission of required projects"
                    rows={3}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {errors.submit && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
