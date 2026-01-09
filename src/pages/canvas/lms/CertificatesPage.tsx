import { useState, useEffect } from 'react';
import { Award, Download, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

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

interface CertificatesPageProps {
  classId: string;
}

export default function CertificatesPage({ classId }: CertificatesPageProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState({
    eligible: false,
    reason: '',
    progress: 0,
  });

  useEffect(() => {
    fetchCertificates();
    checkEligibility();
  }, [classId]);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await axios.get(
        `${API_URL}/certificates?classId=${classId}&studentId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCertificates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await axios.get(
        `${API_URL}/certificates/eligibility?classId=${classId}&studentId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEligibility(response.data.data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
                  <p className="text-gray-700 mb-3">{eligibility.reason}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completion Progress</span>
                      <span className="font-semibold">{eligibility.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${eligibility.progress}%` }}
                      />
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
