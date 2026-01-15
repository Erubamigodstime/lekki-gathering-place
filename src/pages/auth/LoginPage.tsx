import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChurchLogo } from '@/components/ChurchLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: 'Google Sign In',
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
            Grow in Faith,<br />
            <span className="text-gathering-yellow">Develop Skills</span>
          </h1>
          <p className="text-base sm:text-lg max-w-md animate-slide-up text-gathering-dark/70" style={{ animationDelay: '0.1s' }}>
            Join our community of learners and instructors dedicated to nurturing talents for the glory of God.
          </p>
          <div className="mt-12 flex gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div>
              <div className="text-4xl font-bold text-gathering-yellow">30+</div>
              <div className="text-sm text-gathering-dark/70">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gathering-yellow">7</div>
              <div className="text-sm text-gathering-dark/70">Skilled Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gathering-yellow">8</div>
              <div className="text-sm text-gathering-dark/70">Skill Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ChurchLogo size="lg" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground">Welcome Back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="church" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
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
            onClick={handleGoogleLogin}
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
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold">
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
