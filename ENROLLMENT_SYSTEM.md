# Enrollment System Documentation

## Overview

The enrollment system provides a secure, enterprise-level solution for managing class enrollments. It includes comprehensive validation, user verification, and a seamless user experience.

## Features

### ✅ Core Features
- **Email-based Validation**: Validates user accounts before enrollment
- **Duplicate Prevention**: Checks if user is already enrolled in the class
- **Real-time Feedback**: Provides immediate validation results
- **Seamless Redirects**: Auto-redirects to signup if account doesn't exist
- **Loading States**: Clear visual feedback during API calls
- **Error Handling**: Comprehensive error management and user-friendly messages
- **Responsive Design**: Works on all device sizes
- **Animated Background**: Matches project's visual design system
- **Accessibility**: WCAG compliant with proper labels and ARIA attributes

### 🔒 Security Features
- **Email Format Validation**: Client-side email format validation
- **Server-side Verification**: All validations confirmed on backend
- **Protected Routes**: Integration with authentication system
- **Secure API Calls**: Structured API service layer
- **Input Sanitization**: Prevents XSS and injection attacks

### 🎨 UX/UI Features
- **Multi-step Validation**: Clear progression through enrollment process
- **Status Indicators**: Visual feedback for each validation step
- **Contextual Help**: Inline guidance and instructions
- **Progress Indicators**: Loading spinners and status messages
- **Success Animations**: Celebratory feedback on successful enrollment
- **Cancel Options**: Easy way to back out of enrollment

## User Flow

```
1. User clicks "Enroll Now" on ClassDetails page
   ↓
2. Redirected to Enrollment Page with class info
   ↓
3. User enters email address
   ↓
4. System validates:
   - Is email format valid?
   - Does user account exist?
   - Is user already enrolled?
   - Are spots available?
   ↓
5a. If account doesn't exist:
    → Redirect to signup page
   
5b. If already enrolled:
    → Show "Already Enrolled" message
   
5c. If can enroll:
    → Show "Complete Enrollment" button
    ↓
6. User completes enrollment
   ↓
7. Success message and redirect to dashboard
```

## Component Architecture

### EnrollmentPage Component
**Location**: `src/pages/enrollment/EnrollmentPage.tsx`

**Props**: None (uses URL params and query strings)

**URL Parameters**:
- `classId` (path param): ID of the class to enroll in
- `className` (query param): Display name of the class
- `instructor` (query param): Instructor name
- `schedule` (query param): Class schedule information

**State Management**:
```typescript
- email: string                              // User's email input
- isValidating: boolean                      // Validation API call in progress
- isEnrolling: boolean                       // Enrollment API call in progress
- validationResult: EnrollmentValidation     // Validation API response
- enrollmentSuccess: boolean                 // Enrollment completed successfully
```

**Key Methods**:
- `validateEnrollment()`: Validates user account and enrollment status
- `handleEnrollment()`: Enrolls user in the class
- `handleSubmit()`: Handles form submission logic
- `isValidEmail()`: Client-side email format validation

## API Integration

### Enrollment Service
**Location**: `src/services/enrollment.service.ts`

#### API Endpoints

##### 1. Validate Enrollment
```typescript
POST /api/enrollment/validate

Request Body:
{
  email: string,
  classId: string
}

Response:
{
  userExists: boolean,
  alreadyEnrolled: boolean,
  canEnroll: boolean,
  message: string,
  userId?: string,
  enrollmentId?: string
}
```

##### 2. Enroll in Class
```typescript
POST /api/enrollment/enroll

Request Body:
{
  email: string,
  classId: string,
  userId?: string
}

Response:
{
  success: boolean,
  message: string,
  enrollmentId: string,
  classId: string,
  userId: string,
  enrolledAt: string
}
```

##### 3. Get User Enrollments
```typescript
GET /api/enrollment/user/:userId

Response:
{
  enrollments: Array<{
    id: string,
    classId: string,
    className: string,
    enrolledAt: string,
    status: string
  }>
}
```

##### 4. Get Class Enrollments
```typescript
GET /api/enrollment/class/:classId

Response:
{
  enrollments: Array<{
    id: string,
    userId: string,
    userEmail: string,
    enrolledAt: string,
    status: string
  }>,
  totalEnrolled: number,
  availableSpots: number
}
```

##### 5. Cancel Enrollment
```typescript
DELETE /api/enrollment/:enrollmentId/cancel

Response:
{
  success: boolean,
  message: string
}
```

##### 6. Check Enrollment Status
```typescript
GET /api/enrollment/check?userId={userId}&classId={classId}

Response:
{
  isEnrolled: boolean,
  enrollmentId?: string,
  enrolledAt?: string
}
```

## Backend Implementation Requirements

### Database Schema

#### Enrollment Table
```sql
CREATE TABLE enrollments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  class_id VARCHAR(255) NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'cancelled', 'withdrawn') DEFAULT 'active',
  cancelled_at TIMESTAMP NULL,
  completion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_enrollment (user_id, class_id, status),
  INDEX idx_user_enrollments (user_id, status),
  INDEX idx_class_enrollments (class_id, status)
);
```

### Validation Rules

1. **User Account Validation**:
   - Email must exist in users table
   - User account must be active
   - User must have completed profile

2. **Enrollment Validation**:
   - User cannot enroll in same class twice (active status)
   - Class must have available spots
   - Class must be accepting enrollments
   - User must meet any prerequisites

3. **Business Rules**:
   - Maximum enrollments per user: 5 active classes
   - Minimum age requirement: Check user age
   - Ward requirement: Check if class is restricted to specific wards

### Backend Routes

```typescript
// enrollment.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validateRequest } from '@/middleware/validation.middleware';
import {
  validateEnrollment,
  enrollInClass,
  getUserEnrollments,
  getClassEnrollments,
  cancelEnrollment,
  checkEnrollmentStatus
} from '@/controllers/enrollment.controller';

const router = Router();

// Public routes (with rate limiting)
router.post('/validate', validateRequest, validateEnrollment);

// Protected routes (require authentication)
router.post('/enroll', authMiddleware, validateRequest, enrollInClass);
router.get('/user/:userId', authMiddleware, getUserEnrollments);
router.get('/class/:classId', authMiddleware, getClassEnrollments);
router.delete('/:enrollmentId/cancel', authMiddleware, cancelEnrollment);
router.get('/check', authMiddleware, checkEnrollmentStatus);

export default router;
```

## Testing Checklist

### Frontend Testing
- [ ] Email validation (format check)
- [ ] Form submission with valid email
- [ ] Form submission with invalid email
- [ ] Validation API call success
- [ ] Validation API call failure
- [ ] Enrollment API call success
- [ ] Enrollment API call failure
- [ ] Redirect to signup (no account)
- [ ] Redirect to dashboard (success)
- [ ] Already enrolled message
- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Cancel button works
- [ ] Back button works
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Accessibility (keyboard navigation)
- [ ] Accessibility (screen reader)

### Backend Testing
- [ ] Validate endpoint returns correct data
- [ ] Enroll endpoint creates enrollment record
- [ ] Duplicate enrollment prevention
- [ ] Spot availability check
- [ ] User existence check
- [ ] Class existence check
- [ ] Rate limiting works
- [ ] Authentication middleware
- [ ] Authorization checks
- [ ] Database constraints work
- [ ] Transaction rollback on error
- [ ] Concurrent enrollment handling

### Integration Testing
- [ ] End-to-end enrollment flow
- [ ] Signup redirect and return
- [ ] Dashboard display after enrollment
- [ ] Email notifications sent
- [ ] Class capacity updates
- [ ] User enrollment list updates

## Error Handling

### Client-side Errors
```typescript
- Invalid email format
- Empty email field
- Network connectivity issues
- API timeout
- Unexpected API response
```

### Server-side Errors
```typescript
- User not found
- Class not found
- Class full (no available spots)
- Already enrolled
- Database connection error
- Validation error
- Authentication error
- Authorization error
```

## Environment Variables

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3000/api

# Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
ENROLLMENT_RATE_LIMIT=10
MAX_ENROLLMENTS_PER_USER=5
```

## Future Enhancements

### Phase 2
- [ ] Waitlist functionality
- [ ] Payment integration
- [ ] Class prerequisites
- [ ] Enrollment confirmation emails
- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Bulk enrollment (admin)

### Phase 3
- [ ] Enrollment analytics
- [ ] Predictive enrollment
- [ ] Smart recommendations
- [ ] Social proof (X students enrolled)
- [ ] Referral program
- [ ] Early bird discounts

## Support & Maintenance

### Monitoring
- Track enrollment success rate
- Monitor API response times
- Alert on high error rates
- Track validation failures

### Analytics
- Enrollment conversion rate
- Drop-off points in funnel
- Popular enrollment times
- Device/browser distribution

## Security Best Practices

1. **Always validate on backend** - Never trust client-side validation alone
2. **Rate limit API endpoints** - Prevent abuse and DoS attacks
3. **Sanitize user inputs** - Prevent XSS and SQL injection
4. **Use HTTPS** - Encrypt data in transit
5. **Log security events** - Track failed attempts and suspicious activity
6. **Implement CSRF protection** - Protect against cross-site request forgery
7. **Add captcha for public endpoints** - Prevent bot abuse

## Troubleshooting

### Common Issues

**Issue**: Validation always fails
- Check API endpoint URL
- Verify network connectivity
- Check CORS configuration
- Verify request format

**Issue**: Redirect not working
- Check route configuration
- Verify navigation permissions
- Check URL parameters

**Issue**: Already enrolled message for new user
- Check database query
- Verify enrollment status logic
- Check user ID matching

## Contact & Support

For questions or issues with the enrollment system:
- Technical Lead: [Name]
- Documentation: [Link]
- Issue Tracker: [Link]
