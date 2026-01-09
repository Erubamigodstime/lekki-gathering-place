import { Helmet } from 'react-helmet-async';
import { Instructor } from '@/data/instructors';

interface InstructorSEOProps {
  instructor: Instructor;
  baseUrl?: string;
}

export function InstructorSEO({ instructor, baseUrl = 'https://lekki-gathering-place.org' }: InstructorSEOProps) {
  const pageUrl = `${baseUrl}/instructor/${instructor.id}`;
  const imageUrl = `${baseUrl}${instructor.image}`;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: instructor.name,
    jobTitle: instructor.skill,
    worksFor: {
      '@type': 'Organization',
      name: 'Lekki Stake Gathering Place YSA Skills Training',
    },
    description: instructor.about,
    image: imageUrl,
    email: instructor.email,
    telephone: instructor.phone,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: instructor.rating,
      bestRating: '5',
      ratingCount: instructor.students,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: instructor.ward,
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{`${instructor.name} - ${instructor.skill} | Lekki Gathering Place`}</title>
      <meta name="title" content={`${instructor.name} - ${instructor.skill}`} />
      <meta name="description" content={instructor.about.substring(0, 160)} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={`${instructor.name} - ${instructor.skill}`} />
      <meta property="og:description" content={instructor.about.substring(0, 200)} />
      <meta property="og:image" content={imageUrl} />
      <meta property="profile:first_name" content={instructor.name.split(' ')[0]} />
      <meta property="profile:last_name" content={instructor.name.split(' ').slice(1).join(' ')} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={`${instructor.name} - ${instructor.skill}`} />
      <meta property="twitter:description" content={instructor.about.substring(0, 200)} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
