import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, Calendar, CheckCircle, Users, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { getAuthHeaders, staleTimes, queryKeys } from '@/hooks/useApiQueries';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Certificate {
  id: string;
  issuedAt: string;
  certificateUrl?: string;
  class: {
    name: string;
    category?: string;
    instructor: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface EligibilityBreakdown {
  attendance: {
    score: number;
    attended: number;
    total: number;
    contribution: number;
  };
  assignments: {
    score: number;
    completed: number;
    total: number;
    contribution: number;
  };
}

interface EligibilityData {
  eligible: boolean;
  reason: string;
  progress: number;
  breakdown?: EligibilityBreakdown;
  minimumRequired?: number;
}

interface CertificatesPageProps {
  classId: string;
}

export default function CertificatesPage({ classId }: CertificatesPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch certificates
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ['certificates', classId],
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return [];
      const userId = localStorage.getItem('userId');
      const response = await axios.get(
        `${API_URL}/certificates?classId=${classId}&studentId=${userId}`,
        { headers }
      );
      return response.data.data || [];
    },
    staleTime: staleTimes.standard,
  });

  // Fetch eligibility
  const { data: eligibility = { eligible: false, reason: '', progress: 0 }, isLoading: eligibilityLoading } = useQuery({
    queryKey: queryKeys.certificateProgress(classId),
    queryFn: async () => {
      const headers = getAuthHeaders();
      if (!headers) return { eligible: false, reason: '', progress: 0 };
      const userId = localStorage.getItem('userId');
      const response = await axios.get(
        `${API_URL}/certificates/eligibility?classId=${classId}&studentId=${userId}`,
        { headers }
      );
      return response.data.data;
    },
    staleTime: staleTimes.dynamic,
  });

  const loading = certificatesLoading || eligibilityLoading;

  const downloadCertificate = async (certificateId: string) => {
    try {
      setIsDownloading(true);
      const response = await axios.get(
        `${API_URL}/certificates/${certificateId}/download`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificates</h1>
        <p className="text-gray-600 mb-8">
          View and download your earned certificates
        </p>

        {/* Eligibility Status */}
        {!eligibility.eligible && certificates.length === 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Certificate Progress
                  </h3>
                  <p className="text-gray-700 mb-4">{eligibility.reason}</p>
                  
                  {/* Overall Progress */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Overall Progress</span>
                      <span className="font-bold text-lg">{eligibility.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          eligibility.progress >= (eligibility.minimumRequired || 60)
                            ? 'bg-green-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${eligibility.progress}%` }}
                      />
                    </div>
                    {eligibility.minimumRequired && (
                      <p className="text-xs text-gray-500 text-right">
                        Minimum required: {eligibility.minimumRequired}%
                      </p>
                    )}
                  </div>

                  {/* Breakdown Section */}
                  {eligibility.breakdown && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attendance Card */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-teal-600" />
                          <span className="font-semibold text-gray-900">Attendance (75%)</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sessions Attended</span>
                            <span className="font-medium">
                              {eligibility.breakdown.attendance.attended} / {eligibility.breakdown.attendance.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all"
                              style={{ width: `${eligibility.breakdown.attendance.score}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Score</span>
                            <span className="font-semibold text-teal-600">
                              {eligibility.breakdown.attendance.score}% → {eligibility.breakdown.attendance.contribution}pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assignments Card */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Assignments (25%)</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completed</span>
                            <span className="font-medium">
                              {eligibility.breakdown.assignments.completed} / {eligibility.breakdown.assignments.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${eligibility.breakdown.assignments.score}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Score</span>
                            <span className="font-semibold text-purple-600">
                              {eligibility.breakdown.assignments.score}% → {eligibility.breakdown.assignments.contribution}pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formula Explanation */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        <strong>Formula:</strong> (Attendance × 75%) + (Assignments × 25%) = Overall Grade
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-600">
                Complete the course requirements to earn your certificate
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="border-2 border-church-gold/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-4 bg-church-gold/10 rounded-lg">
                        <Award className="h-8 w-8 text-church-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Certificate of Completion
                        </h3>
                        <p className="text-gray-700 font-medium mb-1">
                          {certificate.class.name}
                        </p>
                        {certificate.class.category && (
                          <p className="text-sm text-gray-600 mb-2">
                            {certificate.class.category}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Instructor: {certificate.class.instructor.user.firstName}{' '}
                          {certificate.class.instructor.user.lastName}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadCertificate(certificate.id)}
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
