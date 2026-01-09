import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, AlertCircle, User, ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EnrollmentValidation {
  userExists: boolean;
  alreadyEnrolled: boolean;
  canEnroll: boolean;
  message: string;
}

export default function EnrollmentPage() {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('className') || 'this class';
  const classInstructor = searchParams.get('instructor') || '';
  const classSchedule = searchParams.get('schedule') || '';
  
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [validationResult, setValidationResult] = useState<EnrollmentValidation | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // API call to validate user and enrollment status
  const validateEnrollment = async () => {
    if (!email || !isValidEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // If user is logged in and email matches, skip validation
    if (isAuthenticated && user?.email === email) {
      const result: EnrollmentValidation = {
        userExists: true,
        alreadyEnrolled: false,
        canEnroll: true,
        message: 'Account verified! You can proceed with enrollment.',
      };
      setValidationResult(result);
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // For non-logged in users or email mismatch, redirect to signup/login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: EnrollmentValidation = {
        userExists: false,
        alreadyEnrolled: false,
        canEnroll: false,
        message: 'Please log in or sign up to enroll in this class.',
      };

      setValidationResult(result);

      setTimeout(() => {
        navigate(`/signup?redirect=/enrollment/${classId}&email=${encodeURIComponent(email)}`);
      }, 2000);

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Failed',
        description: 'Unable to verify your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  // API call to enroll user in class
  const handleEnrollment = async () => {
    if (!validationResult?.canEnroll) return;

    setIsEnrolling(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      
      console.log('Enrolling in class:', classId);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ classId }),
      });

      console.log('Enrollment response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Enrollment error:', errorData);
        throw new Error(errorData.message || 'Enrollment failed');
      }

      const data = await response.json();
      console.log('Enrollment successful:', data);

      setEnrollmentSuccess(true);
      
      toast({
        title: 'Enrollment Successful! 🎉',
        description: `You have been successfully enrolled in ${className}. Your enrollment is pending instructor approval.`,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationResult?.canEnroll) {
      handleEnrollment();
    } else {
      validateEnrollment();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-slate-300 via-green-200/70 to-amber-200/70">
        {/* Large gradient orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
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
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
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

        {/* Education Icons */}
        {['📚', '✏️', '🎓', '📖', '🏆', '⭐', '💡', '🎯'].map((icon, i) => (
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gathering-dark/70 hover:text-gathering-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Class Details</span>
        </button>

        {/* Enrollment Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Class Enrollment</h1>
                <p className="text-white/80 text-sm">Secure your spot in the class</p>
              </div>
            </div>
          </div>

          {/* Class Info Banner */}
          <div className="bg-gathering-green/5 border-l-4 border-gathering-green px-8 py-4">
            <h2 className="font-semibold text-gathering-dark mb-1">{className}</h2>
            {classInstructor && (
              <p className="text-sm text-gathering-dark/70">
                <span className="font-medium">Instructor:</span> {classInstructor}
              </p>
            )}
            {classSchedule && (
              <p className="text-sm text-gathering-dark/70">
                <span className="font-medium">Schedule:</span> {classSchedule}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {enrollmentSuccess ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gathering-dark mb-2">
                  Enrollment Successful!
                </h3>
                <p className="text-gathering-dark/70 mb-6">
                  You have been successfully enrolled in {className}. <br />
                  Redirecting you to your dashboard...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gathering-green" />
                </div>
              </div>
            ) : (
              /* Enrollment Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Enrollment Process</p>
                      <ul className="space-y-1 text-blue-800">
                        <li>• Enter your registered email address</li>
                        <li>• We'll verify your account</li>
                        <li>• Complete your enrollment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationResult(null); // Reset validation on change
                      }}
                      className="pl-10 h-12 text-base"
                      required
                      disabled={isValidating || isEnrolling || enrollmentSuccess}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use the email address associated with your account
                  </p>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className={`border rounded-lg p-4 ${
                    validationResult.canEnroll 
                      ? 'bg-green-50 border-green-200' 
                      : validationResult.alreadyEnrolled
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {validationResult.canEnroll ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          validationResult.alreadyEnrolled ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      )}
                      <div>
                        <p className={`font-medium ${
                          validationResult.canEnroll 
                            ? 'text-green-900' 
                            : validationResult.alreadyEnrolled 
                            ? 'text-amber-900'
                            : 'text-red-900'
                        }`}>
                          {validationResult.message}
                        </p>
                        {!validationResult.userExists && (
                          <p className="text-sm text-red-800 mt-1">
                            Redirecting you to sign up page...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                    disabled={isValidating || isEnrolling}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="church"
                    className="flex-1"
                    disabled={
                      isValidating || 
                      isEnrolling || 
                      !email || 
                      !isValidEmail(email) ||
                      (validationResult !== null && !validationResult.canEnroll)
                    }
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : isEnrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : validationResult?.canEnroll ? (
                      'Complete Enrollment'
                    ) : (
                      'Verify Account'
                    )}
                  </Button>
                </div>

                {/* Help Text */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate(`/signup?redirect=/enrollment/${classId}`)}
                      className="text-gathering-green hover:text-gathering-green-light font-semibold"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gathering-dark/60">
            <CheckCircle className="w-4 h-4" />
            <span>Secure enrollment process • Your data is protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
