export interface Instructor {
  id: string;
  name: string;
  skill: string;
  experience: string;
  ward: string;
  students: number;
  rating: number;
  image: string;
  about: string;
  email?: string;
  phone?: string;
  specializations?: string[];
  achievements?: string[];
}

export const instructors: Instructor[] = [

  // Francis Happy
  {
    id: "francis-happy",
    name: "Francis Happy",
    skill: "Designer & Software Engineer",
    experience: "5 years",
    ward: "Lekki Ward",
    about: "Francis Happy is a highly skilled and experienced Graphic Designer and Software Engineer with over 5 years of expertise in creating visually stunning designs and developing robust software solutions. With a strong background in both design and technology, Francis has successfully delivered numerous projects across various industries, showcasing a unique blend of creativity and technical proficiency. Known for his attention to detail, innovative approach, and ability to understand client needs, Francis consistently produces high-quality work that exceeds expectations. His passion for design and technology drives him to stay updated with the latest trends and advancements in the field, ensuring that his work remains cutting-edge and impactful.",
    students: 15,
    rating: 5.0,
    image: "/images/Francis.jpeg",
    email: "francis.happy@gathering.org",
    phone: "+234 801 234 5678",
    specializations: [
      "Graphic Design",
      "Software Development",
      "UI/UX Design",
      "Web Development"
    ],
    achievements: [
      "5+ years of professional experience",
      "Trained 15+ students successfully",
      "Delivered 5+ projects across industries"
    ]
  },
  // Amara Okonkwo
  {
    id: "amara-okonkwo",
    name: "Amara Okonkwo",
    skill: " Designer & Content Creator",
    experience: "3 years",
    about: "Amara Okonkwo is a Creative and results-oriented Content Creator, Social Media Manager, UI/UX Designer, and Graphics Designer with strong experience developing engaging digital content and improving brand visibility across social platforms. Skilled in crafting compelling narratives, designing user-friendly interfaces, and executing data-driven campaigns that drive audience engagement and brand growth. Experienced across real estate, hospitality, and lifestyle sectors, with a proven ability to produce visually appealing content, build cohesive brand identities, and deliver measurable results through strategic content creation.",
    ward: "Lekki Ward",
    students: 62,
    rating: 5.0,
    image: "/images/Amara.jpeg",
    email: "amara.okonkwo@gathering.org",
    phone: "+234 802 345 6789",
    specializations: [
      "Content Creation",
      "Social Media Management",
      "UI/UX Design",
      "Graphics Design"
    ],
    achievements: [
      "3+ years in content creation",
      "Trained 10+ students",
      "Managed multiple brand campaigns",
      "Expert in digital marketing"
    ]
  },
  // Kingsley Ugwumba
  {
    id: "kingsley-ugwumba",
    name: "Kingsley Ugwumba",
    skill: "Digital Marketer & mobile Videographer",
    experience: "5 years",
    about: "Kingsley Peter Ugwumba is a creative and results-driven Digital Marketing & Social Media Specialist with over 3 years of experience executing high-impact campaigns, producing compelling content, and driving brand engagement across multiple platforms. He is highly skilled in content creation, graphic design, video editing, branding, digital analytics, mobile phone photographer and videographer, creating visually captivating content tailored for social media and digital audiences. Beyond his work in digital media, Kingsley is a professional barber with over 5 years of experience, known for precision grooming and premium customer service. Kingsley's diverse background spans real estate operations, business development, and executive support, backed by a results-oriented and collaborative approach to work. He is recognised for his innovation, problem-solving ability, and commitment to delivering measurable growth and brand impact.",
    ward: "Lekki Ward",
    students: 38,
    rating: 5.0,
    image: "/images/Kingsley.jpeg",
    email: "kingsley.ugwumba@gathering.org",
    phone: "+234 803 456 7890",
    specializations: [
      "Professional Barbing",
      "Mobile Videography",
      "Content Creation",
      "Digital Marketing"
    ],
    achievements: [
      "12+ years combined experience",
      "Trained 38+ students",
      "Expert in mobile photography & videography",
      "Professional barber with premium service"
    ]
  },
  // Rachel Akpan
  {
    id: "rachel-akpan",
    name: "Rachel Akpan",
    skill: "Catering",
    experience: "5 years",
    about: "Rachel Akpan is a skilled and passionate caterer with over 5 years of experience in providing exceptional culinary services for various events and occasions. She specializes in creating delicious and visually appealing dishes that cater to diverse tastes and dietary requirements. Rachel is known for her attention to detail, creativity, and commitment to quality, ensuring every event she caters is a memorable experience. Her expertise extends to menu planning, food presentation, and customer service, making her a trusted professional in the catering industry.",
    ward: "Lekki Ward",
    students: 38,
    rating: 5.0,
    image: "/images/rachel-new.jpeg",
    email: "rachel.akpan@gathering.org",
    phone: "+234 803 456 7890",
    specializations: [
      "snacks and small chops",
      "Intercontinental Cuisine",
      "Local Delicacies",
      "Drinks and Beverages"
    ],
    achievements: [
      "7+ years of professional experience",
      "Trained 5 students",
      "Expert in catering and event management",
      "Known for exceptional culinary skills"
    ]
  },

  // Divine Gift Ogite
  {
    id: "divine-gift-ogite",
    name: "Divine Gift Ogite",
    skill: "Advanced Wig Making & Hair Styling",
    experience: "7 years",
    about: "Divine Gift Ogite is a highly experienced and creative wig maker with over 7 years of expertise in the art of wig construction, hair styling, and custom hair solutions. She specializes in creating premium quality wigs, from lace frontals to full lace wigs, using both human and synthetic hair. Divine Gift has mastered advanced techniques including wig customization, coloring, bleaching knots, and creating natural-looking hairlines. Known for her attention to detail and commitment to excellence, she has transformed countless clients' looks and built a reputation for delivering high-quality, durable wigs. Her passion for empowering others through beauty and self-expression drives her to share her knowledge and skills with aspiring wig makers.",
    ward: "Ajah Ward",
    students: 25,
    rating: 5.0,
    image: "/images/divine-gift.jpeg",
    email: "divine.ogite@gathering.org",
    phone: "+234 804 567 8901",
    specializations: [
      "Lace Frontal Wig Making",
      "Full Lace Wig Construction",
      "Wig Customization & Styling",
      "Hair Coloring & Bleaching",
      "Wig Installation & Maintenance"
    ],
    achievements: [
      "7+ years of professional wig making experience",
      "Trained 25+ aspiring wig makers",
      "Specialist in premium quality wigs",
      "Expert in advanced wig techniques"
    ]
  },
  // Amara Dorinda
  {
    id: "amara-dorinda",
    name: "Amara Dorinda",
    skill: "Public Speaking & Communication",
    experience: "6 years",
    about: "Amara Dorinda is a dynamic and inspiring Public Speaking Coach with over 6 years of experience helping individuals overcome their fear of public speaking and develop powerful communication skills. She specializes in training professionals, students, and aspiring speakers to deliver confident, engaging, and impactful presentations. Amara's coaching approach combines proven techniques in voice modulation, body language, storytelling, and audience engagement to transform nervous speakers into compelling communicators. She has facilitated numerous workshops, seminars, and training sessions across various organizations and communities. Known for her encouraging and patient teaching style, Amara creates a supportive environment where students can practice, receive constructive feedback, and build genuine confidence in their speaking abilities.",
    ward: "Shangotedo Ward",
    students: 42,
    rating: 5.0,
    image: "/images/amara-dorinda.jpeg",
    email: "amara.dorinda@gathering.org",
    phone: "+234 805 678 9012",
    specializations: [
      "Public Speaking & Presentation Skills",
      "Voice Modulation & Articulation",
      "Body Language & Stage Presence",
      "Speech Writing & Storytelling",
      "Confidence Building & Communication"
    ],
    achievements: [
      "6+ years of coaching experience",
      "Trained 42+ successful speakers",
      "Conducted 50+ workshops and seminars",
      "Expert in transforming nervous speakers"
    ]
  },
  // David Ogbaudu
  {
    id: "david-ogbaudu",
    name: "David Ogbaudu",
    skill: "Software Development & Programming",
    experience: "8 years",
    about: "David Ogbaudu is a seasoned Software Developer with over 8 years of professional experience in building scalable web applications, mobile apps, and enterprise software solutions. He specializes in modern web technologies including React, Node.js, TypeScript, Python, and cloud platforms. David has worked with startups and established companies, delivering robust software solutions that solve real-world problems. His expertise spans full-stack development, API design, database architecture, and DevOps practices. As an instructor, David is passionate about mentoring aspiring developers and helping them build practical coding skills. He focuses on teaching industry-standard practices, problem-solving techniques, and the fundamentals needed to succeed in the tech industry. His teaching approach emphasizes hands-on projects, code reviews, and real-world application development.",
    ward: "Lekki Ward",
    students: 55,
    rating: 5.0,
    image: "/images/david-ogbaudu.jpeg",
    email: "david.ogbaudu@gathering.org",
    phone: "+234 806 789 0123",
    specializations: [
      "Full-Stack Web Development",
      "React & Node.js",
      "Python Programming",
      "Database Design & Management",
      "API Development & Integration",
      "Cloud Computing & DevOps"
    ],
    achievements: [
      "8+ years in software development",
      "Trained 55+ software developers",
      "Built 20+ production applications",
      "Expert in modern web technologies"
    ]
  }
  
];

