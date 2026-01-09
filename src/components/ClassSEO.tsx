import { Helmet } from 'react-helmet-async';
import { ClassData } from '@/data/classesData';

interface ClassSEOProps {
  classData: ClassData;
}

export function ClassSEO({ classData }: ClassSEOProps) {
  const baseUrl = window.location.origin;
  const classUrl = `${baseUrl}/class/${classData.id}`;
  
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": classData.className,
    "description": classData.overview,
    "provider": {
      "@type": "Organization",
      "name": "Lekki Gathering Place",
      "sameAs": baseUrl
    },
    "instructor": {
      "@type": "Person",
      "name": classData.instructor.name
    },
    "courseCode": classData.id,
    "educationalLevel": classData.level,
    "courseMode": classData.mode,
    "duration": `P${classData.duration.totalWeeks}W`,
    "numberOfLessons": classData.duration.totalLessons,
    "coursePrerequisites": classData.courseRequirements,
    "teaches": classData.learningOutcomes,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": classData.mode,
      "courseWorkload": `PT${classData.duration.totalWeeks * 2}H`
    }
  };

  if (classData.scheduleInfo) {
    structuredData.hasCourseInstance.courseSchedule = {
      "@type": "Schedule",
      "repeatFrequency": "Weekly",
      "byDay": classData.scheduleInfo.day,
      "startTime": classData.scheduleInfo.time.split(' - ')[0],
      "endTime": classData.scheduleInfo.time.split(' - ')[1] || ""
    };
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{`${classData.className} - ${classData.category} | Lekki Gathering Place`}</title>
      <meta name="title" content={`${classData.className} - ${classData.category} | Lekki Gathering Place`} />
      <meta name="description" content={classData.overview} />
      <meta name="keywords" content={`${classData.className}, ${classData.category}, ${classData.level}, ${classData.instructor.name}, Lekki classes, skill development`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={classUrl} />
      <meta property="og:title" content={`${classData.className} | Lekki Gathering Place`} />
      <meta property="og:description" content={classData.overview} />
      {classData.image && <meta property="og:image" content={`${baseUrl}${classData.image}`} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={classUrl} />
      <meta property="twitter:title" content={`${classData.className} | Lekki Gathering Place`} />
      <meta property="twitter:description" content={classData.overview} />
      {classData.image && <meta property="twitter:image" content={`${baseUrl}${classData.image}`} />}

      {/* Canonical URL */}
      <link rel="canonical" href={classUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
