import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChurchLogo } from '@/components/ChurchLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

interface Ward {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Class {
  id: string;
  name: string;
  instructorName: string;
  instructorProfileSlug: string;
}

export default function SignupPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingWards, setLoadingWards] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    wardId: '',
    phone: '',
    classId: '', // For instructor class selection
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validation helpers
  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please provide a valid email';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const validateField = (field: string, value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        break;
      case 'role':
        if (!value) error = 'Role is required';
        break;
      case 'wardId':
        if (!value) error = 'Ward selection is required';
        else if (!isValidUUID(value)) error = 'Valid ward ID is required';
        break;
      case 'classId':
        if (value && !isValidUUID(value)) error = 'Valid class ID is required';
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  // Fetch wards from backend
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/wards`);
        const data = await response.json();
        if (data.success) {
          setWards(data.data);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wards. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [toast]);

  // Fetch classes for instructor selection
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('Fetching classes from API...');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/classes`);
        console.log('Classes API response status:', response.status);
        const result = await response.json();
        console.log('Classes API result:', result);
        if (result.success && result.data) {
          // Handle paginated response structure
          const classesArray = result.data.data || result.data;
          console.log('Setting classes:', classesArray.length, 'classes');
          setClasses(classesArray);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load classes. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [toast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.role) errors.role = 'Role is required';
    
    // Validate wardId (must be UUID)
    if (!formData.wardId) {
      errors.wardId = 'Ward selection is required';
    } else if (!isValidUUID(formData.wardId)) {
      errors.wardId = 'Valid ward ID is required';
    }
    
    // Validate classId for instructors (optional but must be UUID if provided)
    if (formData.role === 'INSTRUCTOR' && formData.classId && !isValidUUID(formData.classId)) {
      errors.classId = 'Valid class ID is required';
    }
    
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    // Validate instructor class selection
    if (formData.role === 'INSTRUCTOR') {
      if (!formData.classId) {
        toast({
          title: 'Class selection required',
          description: 'Please select the class you will be teaching.',
          variant: 'destructive',
        });
        return;
      }

      // No validation needed - instructor can select any available class
      // The class assignment will be made after instructor profile is created
    }

    try {
      const signupData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        wardId: formData.wardId,
        phone: formData.phone,
      };

      // Add classId if instructor selected a class
      if (formData.role === 'INSTRUCTOR' && formData.classId) {
        signupData.classId = formData.classId;
      }

      await signup(signupData);
      toast({
        title: 'Account created!',
        description: 'Welcome to Lekki Stake Gathering Place. Your account has been created successfully.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignup = () => {
    toast({
      title: 'Google Sign Up',
      description: 'Google authentication will be available soon.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Left Panel - Decorative with Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background Layer */}
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-300 via-green-200/70 to-amber-200/70">
          {/* Large visible gradient orbs */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              backgroundColor: 'rgba(148, 163, 184, 0.2)',
              top: '10%',
              left: '-10%',
              background: 'radial-gradient(circle, rgba(27, 94, 61, 0.25) 0%, rgba(27, 94, 61, 0.12) 50%, transparent 100%)',
              animation: 'floatSlow 15s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              bottom: '10%',
              right: '-5%',
              background: 'radial-gradient(circle, rgba(245, 176, 65, 0.3) 0%, rgba(245, 176, 65, 0.15) 50%, transparent 100%)',
              animation: 'floatSlow 18s ease-in-out infinite',
              animationDelay: '3s'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-3xl"
            style={{
              top: '40%',
              left: '30%',
              background: 'radial-gradient(circle, rgba(27, 94, 61, 0.22) 0%, rgba(27, 94, 61, 0.1) 50%, transparent 100%)',
              animation: 'floatSlow 20s ease-in-out infinite',
              animationDelay: '6s'
            }}
          />
          
          {/* Visible floating particles */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${(i % 4) + 4}px`,
                height: `${(i % 4) + 4}px`,
                left: `${(i * 13 + 7) % 95}%`,
                top: `${(i * 19 + 5) % 90}%`,
                background: i % 3 === 0 
                  ? 'rgba(27, 94, 61, 0.7)' 
                  : i % 3 === 1 
                  ? 'rgba(245, 176, 65, 0.7)' 
                  : 'rgba(148, 163, 184, 0.6)',
                boxShadow: i % 3 === 0 
                  ? '0 0 25px rgba(27, 94, 61, 0.8)' 
                  : i % 3 === 1 
                  ? '0 0 25px rgba(245, 176, 65, 0.8)' 
                  : '0 0 18px rgba(148, 163, 184, 0.7)',
                animation: `float3d ${(i % 12) + 8}s ease-in-out infinite`,
                animationDelay: `${(i % 5)}s`,
              }}
            />
          ))}
          
          {/* Floating geometric shapes */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`shape-${i}`}
              className="absolute"
              style={{
                width: `${(i % 8) * 10 + 40}px`,
                height: `${(i % 8) * 10 + 40}px`,
                left: `${(i * 17 + 3) % 92}%`,
                top: `${(i * 23 + 8) % 88}%`,
                background: i % 2 === 0 
                  ? 'linear-gradient(135deg, rgba(27, 94, 61, 0.18), rgba(27, 94, 61, 0.1))' 
                  : 'linear-gradient(135deg, rgba(245, 176, 65, 0.18), rgba(245, 176, 65, 0.1))',
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '30%' : '15px',
                border: i % 2 === 0 
                  ? '2px solid rgba(27, 94, 61, 0.35)' 
                  : '2px solid rgba(245, 176, 65, 0.35)',
                animation: `floatRotate ${(i % 20) + 15}s ease-in-out infinite`,
                animationDelay: `${(i % 8)}s`,
              }}
            />
          ))}
          
          {/* Education/Skill Icons - floating */}
          {['📚', '✏️', '🎓', '📖', '🏆', '⭐', '💡', '🎯', '📝', '🔧', '🎨', '💻', '🔨', '✨', '🌟'].map((icon, i) => (
            <div
              key={`icon-${i}`}
              className="absolute text-2xl opacity-40"
              style={{
                left: `${(i * 23 + 5) % 95}%`,
                top: `${(i * 17 + 10) % 85}%`,
                filter: i % 2 === 0 ? 'hue-rotate(130deg)' : 'hue-rotate(40deg)',
                animation: `float3d ${(i % 5) * 3 + 10}s ease-in-out infinite`,
                animationDelay: `${(i % 6)}s`,
              }}
            >
              {icon}
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-gathering-dark">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up text-gathering-dark">
            Begin Your<br />
            <span className="text-gathering-yellow">Journey Today</span>
          </h1>
          <p className="text-base sm:text-lg max-w-md animate-slide-up text-gathering-dark/70" style={{ animationDelay: '0.1s' }}>
            Join our growing community of dedicated learners and skilled instructors. Develop your God-given talents.
          </p>
          <div className="mt-12 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gathering-green/20 flex items-center justify-center">
                <span className="text-gathering-green">✓</span>
              </div>
              <span className="text-gathering-dark/80">Access to diverse skill courses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gathering-green/20 flex items-center justify-center">
                <span className="text-gathering-green">✓</span>
              </div>
              <span className="text-gathering-dark/80">Learn from experienced instructors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gathering-green/20 flex items-center justify-center">
                <span className="text-gathering-green">✓</span>
              </div>
              <span className="text-gathering-dark/80">Track your progress and growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ChurchLogo size="lg" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground">Create Account</h2>
            <p className="mt-2 text-muted-foreground">Join our skill training community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`pl-10 h-11 ${validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select 
                  value={formData.wardId} 
                  onValueChange={(value) => handleChange('wardId', value)}
                  disabled={loadingWards}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingWards ? "Loading wards..." : "Select ward"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class Selection - Only show for Instructors */}
            {formData.role === 'INSTRUCTOR' && (
              <div className="space-y-2">
                <Label htmlFor="class">Select Your Class</Label>
                <Select 
                  value={formData.classId} 
                  onValueChange={(value) => handleChange('classId', value)}
                  disabled={loadingClasses}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select the class you teach"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length > 0 ? (
                      classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} {classItem.instructorName ? `(${classItem.instructorName})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No classes available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the class you've been assigned to teach
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={(e) => validateField('password', e.target.value)}
                  className={`pl-10 pr-10 h-11 ${validationErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={(e) => validateField('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 h-11 ${validationErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" variant="church" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="lg" 
            className="w-full" 
            onClick={handleGoogleSignup}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
 