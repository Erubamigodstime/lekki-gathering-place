import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    description: '',
    maxCapacity: 20,
    instructorId: '',
    wardId: '',
    thumbnail: '',
    days: [] as string[],
    time: '',
    totalWeeks: 12,
    gradingEnabled: true,
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.maxCapacity < 1) newErrors.maxCapacity = 'Capacity must be at least 1';
    if (!formData.instructorId) newErrors.instructorId = 'Instructor is required';
    if (!formData.wardId) newErrors.wardId = 'Ward is required';
    if (formData.days.length === 0) newErrors.days = 'Select at least one day';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (formData.totalWeeks < 1) newErrors.totalWeeks = 'Total weeks must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/classes`,
        {
          name: formData.name,
          description: formData.description,
          maxCapacity: formData.maxCapacity,
          instructorId: formData.instructorId,
          wardId: formData.wardId,
          thumbnail: formData.thumbnail || undefined,
          schedule: {
            days: formData.days,
            time: formData.time,
          },
          totalWeeks: formData.totalWeeks,
          gradingEnabled: formData.gradingEnabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create class:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create class' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      maxCapacity: 20,
      instructorId: '',
      wardId: '',
      thumbnail: '',
      days: [],
      time: '',
      totalWeeks: 12,
      gradingEnabled: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new skills training class
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Class Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Class Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Tailoring & Fashion Design"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Instructor & Ward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instructor">
                Instructor <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
              >
                <SelectTrigger className={errors.instructorId ? 'border-destructive' : ''}>
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
              {errors.instructorId && (
                <p className="text-xs text-destructive">{errors.instructorId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ward">
                Ward <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.wardId}
                onValueChange={(value) => setFormData({ ...formData, wardId: value })}
              >
                <SelectTrigger className={errors.wardId ? 'border-destructive' : ''}>
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
              {errors.wardId && <p className="text-xs text-destructive">{errors.wardId}</p>}
            </div>
          </div>

          {/* Schedule Days */}
          <div className="grid gap-2">
            <Label>
              Class Days <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.days.includes(day)}
                    onCheckedChange={() => handleDayToggle(day)}
                  />
                  <label
                    htmlFor={day}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.slice(0, 3)}
                  </label>
                </div>
              ))}
            </div>
            {errors.days && <p className="text-xs text-destructive">{errors.days}</p>}
          </div>

          {/* Time & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time">
                Class Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                placeholder="e.g., 9:00 AM - 11:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={errors.time ? 'border-destructive' : ''}
              />
              {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxCapacity">
                Max Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })
                }
                className={errors.maxCapacity ? 'border-destructive' : ''}
              />
              {errors.maxCapacity && (
                <p className="text-xs text-destructive">{errors.maxCapacity}</p>
              )}
            </div>
          </div>

          {/* Total Weeks */}
          <div className="grid gap-2">
            <Label htmlFor="totalWeeks">
              Total Weeks <span className="text-destructive">*</span>
            </Label>
            <Input
              id="totalWeeks"
              type="number"
              min="1"
              value={formData.totalWeeks}
              onChange={(e) =>
                setFormData({ ...formData, totalWeeks: parseInt(e.target.value) || 12 })
              }
              className={errors.totalWeeks ? 'border-destructive' : ''}
            />
            {errors.totalWeeks && (
              <p className="text-xs text-destructive">{errors.totalWeeks}</p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div className="grid gap-2">
            <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            />
          </div>

          {/* Grading Enabled */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gradingEnabled"
              checked={formData.gradingEnabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, gradingEnabled: checked as boolean })
              }
            />
            <label
              htmlFor="gradingEnabled"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable grading for this class
            </label>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
