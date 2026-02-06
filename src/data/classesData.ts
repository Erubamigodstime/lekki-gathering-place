export interface WeeklyLesson {
  week: number;
  phase?: string;
  title: string;
  objectives?: string[];
  activities?: string[];
  topics?: string[];
  miniProject?: string;
  resources?: string[];
}

export interface ClassSchedule {
  weeklyLessons: WeeklyLesson[];
}

export interface Certification {
  issued: boolean;
  certificateTitle?: string;
  criteria: string;
}

export interface ClassInstructor {
  name: string;
  profileSlug: string;
}

export interface ClassDuration {
  totalLessons: number;
  totalWeeks: number;
}

export interface ScheduleInfo {
  day: string;
  time: string;
}

export interface ClassData {
  id: string;
  className: string;
  category: string;
  level: string;
  mode: string;
  targetAudience?: string;
  scheduleInfo?: ScheduleInfo;
  duration: ClassDuration;
  instructor: ClassInstructor;
  overview: string;
  learningOutcomes: string[];
  courseRequirements: string[];
  toolsAndMaterials: string[];
  schedule: ClassSchedule;
  certification: Certification;
  image?: string;
  color?: string;
  students?: number;
  available?: number;
}

export const classes: ClassData[] = [
  {
    id: "mobile-photography-videography",
    className: "Mobile Photography & Videography",
    category: "Media & Content Creation",
    level: "Beginner",
    mode: "In-person / Practical",
    duration: {
      totalLessons: 10,
      totalWeeks: 10
    },
    instructor: {
      name: "Kingsley Peter Ugwumba (Spectra)",
      profileSlug: "kingsley-ugwumba"
    },
    overview: "This course introduces beginners to the fundamentals of mobile photography and videography using smartphones. Students learn camera setup, composition, lighting, video stability, and professional editing using Canva and CapCut. The program combines theory with hands-on practice to help students create social-media-ready content.",
    learningOutcomes: [
      "Understand smartphone camera settings including focus, exposure, HDR, frame rate, and stabilization",
      "Capture clear, sharp, and well-composed photographs",
      "Record smooth and properly framed video clips",
      "Edit photos professionally using Canva",
      "Edit videos using CapCut including cuts, transitions, text, and music syncing",
      "Create content optimized for Instagram, TikTok, and YouTube"
    ],
    courseRequirements: [
      "Smartphone with a functional camera (Android or iPhone)",
      "Canva application installed",
      "CapCut application installed",
      "Access to good lighting or natural light",
      "Notebook for note-taking"
    ],
    toolsAndMaterials: [
      "Smartphone camera",
      "Canva app",
      "CapCut app",
      "Tripod or phone stabilizer (optional)",
      "LED or ring light (optional)",
      "Phone cleaning cloth"
    ],
    schedule: {
      weeklyLessons: [
        {
          week: 1,
          title: "Introduction to Mobile Photography & Videography",
          objectives: [
            "Understand course structure",
            "Explore smartphone camera interface"
          ],
          activities: [
            "Camera tour",
            "Exploring camera modes"
          ]
        },
        {
          week: 2,
          title: "Understanding Mobile Camera Settings",
          objectives: [
            "Learn focus, exposure, HDR, resolution, and stabilization"
          ],
          activities: [
            "Adjust camera settings",
            "Capture test photos and videos"
          ]
        },
        {
          week: 3,
          title: "Lighting Basics & Natural Light Techniques",
          objectives: [
            "Understand lighting positions and shadows"
          ],
          activities: [
            "Indoor window-light practice",
            "Outdoor lighting exercises"
          ]
        },
        {
          week: 4,
          title: "Angles & Composition Techniques",
          objectives: [
            "Apply rule of thirds, symmetry, and framing"
          ],
          activities: [
            "Composition-based photo shooting"
          ]
        },
        {
          week: 5,
          title: "Mobile Videography Basics",
          objectives: [
            "Learn stable shooting and transitions"
          ],
          activities: [
            "Record short clips using correct angles"
          ]
        },
        {
          week: 6,
          title: "Editing Photos with Canva",
          objectives: [
            "Apply filters and color correction"
          ],
          activities: [
            "Edit multiple photos for social media"
          ]
        },
        {
          week: 7,
          title: "Editing Videos with CapCut",
          objectives: [
            "Learn cuts, transitions, text, and audio"
          ],
          activities: [
            "Edit a short-form video"
          ]
        },
        {
          week: 8,
          title: "Colour Grading & Sound Choices",
          objectives: [
            "Enhance mood and audio quality"
          ],
          activities: [
            "Color grading practice",
            "Music synchronization"
          ]
        },
        {
          week: 9,
          title: "Creating Social Media Content",
          objectives: [
            "Understand platform-specific formats"
          ],
          activities: [
            "Create a complete social media post"
          ]
        },
        {
          week: 10,
          title: "Assessment, Portfolio Review & Certification",
          objectives: [
            "Demonstrate skill mastery"
          ],
          activities: [
            "Submit final photo and video project"
          ]
        }
      ]
    },
    certification: {
      issued: true,
      criteria: "Completion of final assessment and submission of required projects"
    },
    image: "/images/photo-vid-2.webp",
    color: "from-blue-500 to-purple-500",
    students: 25,
    available: 15
  },

  {
    id: "advanced-wig-making",
    className: "Advanced Wig-Making & Customization",
    category: "Fashion & Beauty",
    level: "Intermediate to Advanced",
    mode: "In-person / Practical",
    duration: {
      totalLessons: 10,
      totalWeeks: 10
    },
    instructor: {
      name: "Divine-gift Ogitie",
      profileSlug: "divinegift-ogitie"
    },
    overview: "This advanced course teaches professional wig-making techniques including lace identification, knot bleaching, lace tinting, hairline customization, bundle sewing, and salon-grade styling. Students complete a premium-quality wig from start to finish.",
    learningOutcomes: [
      "Identify professional wig-making tools and lace types",
      "Bleach knots safely and evenly",
      "Tint lace to match different skin tones",
      "Customize realistic hairlines using advanced plucking",
      "Sew bundles professionally",
      "Apply salon-grade styling techniques",
      "Complete a premium wig build independently"
    ],
    courseRequirements: [
      "Frontal or closure",
      "2–3 bundles of quality hair",
      "Mannequin head and tripod",
      "Sewing and ventilating tools",
      "Notebook for notes"
    ],
    toolsAndMaterials: [
      "HD or transparent lace",
      "Mannequin head with tripod",
      "Bundles of hair",
      "Needle, thread, scissors, T-pins",
      "Bleaching products",
      "Lace tint or foundation",
      "Hot comb and heat protectant"
    ],
    schedule: {
      weeklyLessons: [
        { week: 1, title: "Tools, Products & Lace Identification" },
        { week: 2, title: "Bleaching Knots (Professional Method)" },
        { week: 3, title: "Lace Tinting & Skin Tone Matching" },
        { week: 4, title: "Advanced Plucking & Hairline Customization" },
        { week: 5, title: "Sewing Bundles – Foundation" },
        { week: 6, title: "Sewing Bundles – Completion" },
        { week: 7, title: "Advanced Styling Techniques" },
        { week: 8, title: "Complete Wig Assembly" },
        { week: 9, title: "Professional Wig Finishing" },
        { week: 10, title: "Final Assessment & Certification" }
      ]
    },
    certification: {
      issued: true,
      criteria: "Successful completion of final wig build and instructor grading"
    },
    image: "/images/wig.webp",
    color: "from-pink-500 to-rose-500",
    students: 18,
    available: 12
  },

  {
    id: "content-creation",
    className: "Content Creation Masterclass",
    category: "Digital Media",
    level: "Beginner to Intermediate",
    mode: "In-person",
    duration: {
      totalLessons: 10,
      totalWeeks: 10
    },
    instructor: {
      name: "Okonkwo Amara",
      profileSlug: "amara-okonkwo"
    },
    overview: "This class teaches students how to create content across multiple niches, craft attention-grabbing hooks, write scripts, and produce voice-note-based content for social media platforms.",
    learningOutcomes: [
      "Understand multiple content niches",
      "Create effective content hooks",
      "Write scripts for short-form platforms",
      "Produce engaging voice-note content",
      "Adapt content for different audiences"
    ],
    courseRequirements: [
      "Smartphone",
      "Internet access",
      "Notebook"
    ],
    toolsAndMaterials: [
      "Smartphone microphone",
      "Social media apps",
      "Quiet recording space"
    ],
    schedule: {
      weeklyLessons: [
        { week: 1, title: "Understanding Niches & Hooks" },
        { week: 2, title: "Scriptwriting for Social Media" },
        { week: 3, title: "Voice Note Content Creation" },
        { week: 4, title: "Content Angles & Engagement" }
      ]
    },
    certification: {
      issued: true,
      criteria: "Completion of weekly assignments"
    },
    image: "/images/content.webp",
    color: "from-yellow-500 to-orange-500",
    students: 30,
    available: 20
  },

  {
    id: "ysa-programming-academy",
    className: "YSA Programming Academy: Web & Mobile Development",
    category: "Technology & Software Development",
    level: "Beginner to Job-Ready",
    targetAudience: "Young Single Adults (Ages 18–35)",
    mode: "In-person / Practical",
    scheduleInfo: {
      day: "Thursday",
      time: "5:00 PM - 7:00 PM"
    },
    duration: {
      totalLessons: 12,
      totalWeeks: 12
    },
    instructor: {
      name: "David Ogbaudu",
      profileSlug: "david-ogbaudu"
    },
    overview: "A comprehensive programming course designed to take young single adults from beginner level to job-ready web and mobile developers. The program combines structured teaching, weekly hands-on projects, and real-world tools covering frontend, backend, mobile development, deployment, and career preparation.",
    learningOutcomes: [
      "Understand how the web works and how frontend and backend systems interact",
      "Build responsive websites using HTML, CSS, Tailwind CSS, and modern design principles",
      "Write clean, modern JavaScript and work with APIs",
      "Build dynamic web applications using React",
      "Develop cross-platform mobile applications using React Native and Expo",
      "Integrate backend services, databases, and authentication",
      "Deploy web applications and prepare a professional developer portfolio",
      "Gain confidence for internships, freelance work, or entry-level developer roles"
    ],
    courseRequirements: [
      "Laptop capable of running development tools",
      "Basic computer literacy",
      "Willingness to practice outside class hours",
      "Stable internet access"
    ],
    toolsAndMaterials: [
      "VS Code",
      "Web browser (Chrome recommended)",
      "Node.js",
      "Git & GitHub",
      "Tailwind CSS",
      "React",
      "React Native",
      "Expo",
      "Supabase",
      "Vercel or Netlify"
    ],
    schedule: {
      weeklyLessons: [
        {
          week: 1,
          phase: "Web Foundations",
          title: "Introduction to Web Development",
          topics: [
            "What is web development?",
            "Frontend vs Backend",
            "How the internet works (DNS, HTTP, browsers)",
            "Setting up development environment",
            "HTML structure and semantics"
          ],
          miniProject: "Personal Bio Page",
          resources: [
            "MDN Web Docs",
            "VS Code",
            "freeCodeCamp HTML Course"
          ]
        },
        {
          week: 2,
          phase: "Web Foundations",
          title: "Styling with CSS",
          topics: [
            "CSS syntax and selectors",
            "Colors, fonts, and typography",
            "Box model",
            "Flexbox layout"
          ],
          miniProject: "Styled Profile Card",
          resources: [
            "CSS Tricks Flexbox Guide",
            "Google Fonts",
            "Flexbox Froggy"
          ]
        },
        {
          week: 3,
          phase: "Web Foundations",
          title: "Responsive Design & CSS Grid",
          topics: [
            "Mobile-first design",
            "Media queries",
            "CSS Grid",
            "Introduction to Tailwind CSS"
          ],
          miniProject: "Responsive Photo Gallery",
          resources: [
            "CSS Grid Garden",
            "Tailwind CSS Documentation"
          ]
        },
        {
          week: 4,
          phase: "JavaScript & Interactivity",
          title: "JavaScript Fundamentals",
          topics: [
            "Variables and data types",
            "Functions and control flow",
            "Arrays and objects",
            "DOM manipulation"
          ],
          miniProject: "Interactive Quiz App",
          resources: [
            "JavaScript.info",
            "Eloquent JavaScript"
          ]
        },
        {
          week: 5,
          phase: "JavaScript & Interactivity",
          title: "Modern JavaScript & APIs",
          topics: [
            "ES6+ features",
            "Async/Await and Promises",
            "Fetching APIs",
            "Working with JSON"
          ],
          miniProject: "Weather Dashboard",
          resources: [
            "Public APIs List",
            "RapidAPI Hub"
          ]
        },
        {
          week: 6,
          phase: "React Development",
          title: "Introduction to React",
          topics: [
            "What is React",
            "Components and JSX",
            "Props and composition",
            "Project setup with Vite"
          ],
          miniProject: "Component Library",
          resources: [
            "React Official Docs",
            "Vite Documentation"
          ]
        },
        {
          week: 7,
          phase: "React Development",
          title: "React State & Hooks",
          topics: [
            "useState",
            "useEffect",
            "Event handling",
            "Conditional rendering"
          ],
          miniProject: "Task Manager App",
          resources: [
            "React Hooks Documentation"
          ]
        },
        {
          week: 8,
          phase: "React Development",
          title: "Routing & Full React Apps",
          topics: [
            "React Router",
            "Multi-page applications",
            "Shared layouts",
            "UI libraries (shadcn/ui)"
          ],
          miniProject: "Personal Portfolio Website",
          resources: [
            "React Router Docs",
            "shadcn/ui"
          ]
        },
        {
          week: 9,
          phase: "Mobile Development",
          title: "Introduction to Mobile Development",
          topics: [
            "Native vs cross-platform",
            "React Native basics",
            "Expo setup",
            "Mobile UI principles"
          ],
          miniProject: "Hello Mobile App",
          resources: [
            "React Native Docs",
            "Expo Documentation"
          ]
        },
        {
          week: 10,
          phase: "Mobile Development",
          title: "Mobile UI Components & Navigation",
          topics: [
            "Core React Native components",
            "React Navigation",
            "Forms and input",
            "Platform-specific styling"
          ],
          miniProject: "Scripture Journal App",
          resources: [
            "React Navigation Docs",
            "AsyncStorage"
          ]
        },
        {
          week: 11,
          phase: "Full Stack Integration",
          title: "Backend Basics & Databases",
          topics: [
            "Backend fundamentals",
            "Database basics",
            "Supabase integration",
            "Authentication"
          ],
          miniProject: "Backend-Enabled Portfolio",
          resources: [
            "Supabase Docs",
            "SQL Tutorials"
          ]
        },
        {
          week: 12,
          phase: "Launch & Career",
          title: "Deployment & Career Preparation",
          topics: [
            "Web deployment",
            "Mobile publishing overview",
            "Portfolio building",
            "Job search strategies"
          ],
          miniProject: "Launch Day & Showcase",
          resources: [
            "Vercel",
            "Netlify",
            "Tech Interview Handbook"
          ]
        }
      ]
    },
    certification: {
      issued: true,
      certificateTitle: "YSA Programming Academy Certificate of Completion",
      criteria: "Completion of weekly projects, final deployment, and active participation"
    },
    image: "/images/web-dev.jpg",
    color: "from-green-500 to-teal-500",
    students: 22,
    available: 8
  }
];
