import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Printer, Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    generateClassDates,
    formatAttendanceDate,
    getAttendanceStatus,
    isToday,
    isFutureDate,
    getVisibleDates,
    PROGRAM_START_DATE,
} from '@/utils/attendanceUtils';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    classId: string;
    studentId: string;
}

interface Student {
    id: string;
    userId: string;
    user: {
        firstName: string;
        lastName: string;
        gender?: string;
    };
}

interface ClassInfo {
    id: string;
    name: string;
    schedule?: {
        days?: string[];
    };
}

interface ClassAttendanceCalendarProps {
    classInfo: ClassInfo;
    students: Student[];
    attendanceRecords: AttendanceRecord[];
    onMarkAttendance: (studentId: string, classId: string, date: Date) => Promise<void>;
    loading?: boolean;
    isInstructor?: boolean;
    currentStudentId?: string;
}

export default function ClassAttendanceCalendar({
    classInfo,
    students,
    attendanceRecords,
    onMarkAttendance,
    loading = false,
    isInstructor = false,
    currentStudentId,
}: ClassAttendanceCalendarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateStartIndex, setDateStartIndex] = useState(0);
    const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);

    // Generate class dates from schedule
    const allClassDates = useMemo(() => {
        const scheduleDays = classInfo.schedule?.days || ['Thursday'];
        return generateClassDates(scheduleDays, PROGRAM_START_DATE, 12);
    }, [classInfo.schedule?.days]);

    // Get visible dates (5 at a time for desktop, all for mobile with scroll)
    const visibleDates = useMemo(() => {
        return getVisibleDates(allClassDates, dateStartIndex, 5);
    }, [allClassDates, dateStartIndex]);

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(student => {
            const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
            return fullName.includes(query);
        });
    }, [students, searchQuery]);

    // Handle date navigation
    const canGoBack = dateStartIndex > 0;
    const canGoForward = dateStartIndex + 5 < allClassDates.length;

    const handlePrevDates = () => {
        if (canGoBack) {
            setDateStartIndex(prev => Math.max(0, prev - 5));
        }
    };

    const handleNextDates = () => {
        if (canGoForward) {
            setDateStartIndex(prev => Math.min(allClassDates.length - 5, prev + 5));
        }
    };

    // Handle attendance marking
    const handleMarkClick = async (studentId: string, date: Date) => {
        // Can only mark for today, students can only mark themselves
        if (!isToday(date)) return;
        if (!isInstructor && currentStudentId !== studentId) return;

        const markingKey = `${studentId}-${date.toISOString()}`;
        setMarkingAttendance(markingKey);

        try {
            await onMarkAttendance(studentId, classInfo.id, date);
        } catch (error) {
            console.error('Failed to mark attendance:', error);
        } finally {
            setMarkingAttendance(null);
        }
    };

    // Get student's attendance for a specific date
    const getStudentAttendanceStatus = (studentId: string, date: Date) => {
        const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
        return getAttendanceStatus(date, studentRecords);
    };

    // Render attendance circle
    const renderAttendanceCircle = (studentId: string, date: Date) => {
        const status = getStudentAttendanceStatus(studentId, date);
        const markingKey = `${studentId}-${date.toISOString()}`;
        const isMarking = markingAttendance === markingKey;
        const canMark = isToday(date) && (isInstructor || currentStudentId === studentId);
        const future = isFutureDate(date);

        if (isMarking) {
            return (
                <div className="w-7 h-7 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-church-blue" />
                </div>
            );
        }

        if (status === 'APPROVED') {
            return (
                <div className="w-7 h-7 rounded-full bg-church-blue flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        }

        if (status === 'PENDING') {
            return (
                <div
                    className="w-7 h-7 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center"
                    title="Pending approval"
                >
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
            );
        }

        if (status === 'REJECTED') {
            return (
                <div
                    className="w-7 h-7 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center"
                    title="Rejected"
                >
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        }

        // Empty circle - can be clicked to mark if conditions are met
        return (
            <button
                onClick={() => canMark && handleMarkClick(studentId, date)}
                disabled={!canMark || future}
                className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    canMark && !future
                        ? "border-church-blue hover:bg-church-blue/10 cursor-pointer"
                        : "border-gray-300 cursor-default",
                    future && "opacity-50"
                )}
                title={canMark ? "Click to mark attendance" : future ? "Future date" : "Cannot mark"}
            />
        );
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <Card className="shadow-card">
                <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-church-blue" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-card">
            <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-semibold text-foreground">
                        {classInfo.name} Attendance
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="self-start">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                        <TabsTrigger
                            value="members"
                            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-church-blue data-[state=active]:text-church-blue"
                        >
                            Members
                        </TabsTrigger>
                        <TabsTrigger
                            value="visitors"
                            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-church-blue data-[state=active]:text-church-blue"
                        >
                            Visitors
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="mt-0">
                        {/* Desktop View - Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground min-w-[200px]">
                                            Name ↓
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground w-20">
                                            Gender
                                        </th>
                                        <th className="py-3 px-2 w-8">
                                            <button
                                                onClick={handlePrevDates}
                                                disabled={!canGoBack}
                                                className={cn(
                                                    "p-1 rounded hover:bg-muted transition-colors",
                                                    !canGoBack && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                        </th>
                                        {visibleDates.map((date, idx) => (
                                            <th
                                                key={idx}
                                                className={cn(
                                                    "text-center py-3 px-3 font-medium text-sm",
                                                    isToday(date) && "bg-church-blue/10 text-church-blue"
                                                )}
                                            >
                                                {formatAttendanceDate(date)}
                                            </th>
                                        ))}
                                        <th className="py-3 px-2 w-8">
                                            <button
                                                onClick={handleNextDates}
                                                disabled={!canGoForward}
                                                className={cn(
                                                    "p-1 rounded hover:bg-muted transition-colors",
                                                    !canGoForward && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student, idx) => (
                                        <tr
                                            key={student.id}
                                            className={cn(
                                                "border-b transition-colors hover:bg-muted/50",
                                                idx % 2 === 0 ? "bg-white" : "bg-muted/20"
                                            )}
                                        >
                                            <td className="py-3 px-4">
                                                <span className="text-church-blue font-medium hover:underline cursor-pointer">
                                                    {student.user.lastName}, {student.user.firstName}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {student.user.gender === 'male' ? 'M' : student.user.gender === 'female' ? 'F' : '-'}
                                            </td>
                                            <td></td>
                                            {visibleDates.map((date, dateIdx) => (
                                                <td key={dateIdx} className="text-center py-3 px-3">
                                                    {renderAttendanceCircle(student.id, date)}
                                                </td>
                                            ))}
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No students found</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile View - Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredStudents.map((student) => (
                                <Card key={student.id} className="border shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-4">
                                            <Avatar className="h-12 w-12 bg-muted">
                                                <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                                                    {student.user.firstName[0]}{student.user.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    {student.user.lastName}, {student.user.firstName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {student.user.gender === 'male' ? 'Male' : student.user.gender === 'female' ? 'Female' : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {classInfo.name}
                                            </p>

                                            {/* Scrollable dates row */}
                                            <div className="flex items-center gap-4 overflow-x-auto pb-1">
                                                {allClassDates.slice(0, 6).map((date, idx) => (
                                                    <div key={idx} className="flex flex-col items-center min-w-[50px]">
                                                        <span className={cn(
                                                            "text-xs mb-1",
                                                            isToday(date) ? "text-church-blue font-semibold" : "text-muted-foreground"
                                                        )}>
                                                            {formatAttendanceDate(date)}
                                                        </span>
                                                        {renderAttendanceCircle(student.id, date)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No students found</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="visitors" className="p-6 text-center text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No visitors recorded</p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
