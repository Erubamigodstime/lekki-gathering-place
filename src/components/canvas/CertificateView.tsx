import { useState, useEffect } from 'react';
import { Award, Download, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { certificateApi } from '@/utils/canvas-api';
import type { Certificate } from '@/types/canvas';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CertificateViewProps {
  classId: string;
}

export function CertificateView({ classId }: CertificateViewProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, [classId]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const data = await certificateApi.getByClass(classId);
      setCertificates(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch certificates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, studentName: string) => {
    try {
      const blob = await certificateApi.download(certificateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${studentName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Certificate downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Certificates</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No certificates issued yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Complete all course requirements to receive your certificate
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6">
                <div className="flex items-center justify-between">
                  <Award className="h-12 w-12 text-primary" />
                  <Badge 
                    variant={certificate.status === 'ACTIVE' ? 'default' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {certificate.status === 'ACTIVE' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {certificate.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Course Completion Certificate</CardTitle>
                <CardDescription>
                  Issued to: {certificate.student?.firstName} {certificate.student?.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Certificate Code:</span>
                    <span className="font-mono font-semibold">{certificate.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issued Date:</span>
                    <span>{format(new Date(certificate.issuedAt), 'PPP')}</span>
                  </div>
                  {certificate.expiresAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{format(new Date(certificate.expiresAt), 'PPP')}</span>
                    </div>
                  )}
                </div>

                {certificate.status === 'ACTIVE' && (
                  <Button 
                    className="w-full" 
                    onClick={() => handleDownload(
                      certificate.id, 
                      `${certificate.student?.firstName}-${certificate.student?.lastName}`
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
