"use client"

import { Cards } from "@/components/ui/cards"
import { Button } from "@/components/ui/button"
import { Badges } from "@/components/ui/badges"
import { Award, Images, MapPin } from "lucide-react"

const instructors = [
  {
    name: "Francis Happy",
    skill: " Designer & Software Engineer",
    experience: "5 years",
    ward: "Lekki Ward",
    about: "Francis Happy is a highly skilled and experienced Graphic Designer and Software Engineer with over 5 years of expertise in creating visually stunning designs and developing robust software solutions. With a strong background in both design and technology, Francis has successfully delivered numerous projects across various industries, showcasing a unique blend of creativity and technical proficiency. Known for his attention to detail, innovative approach, and ability to understand client needs, Francis consistently produces high-quality work that exceeds expectations. His passion for design and technology drives him to stay updated with the latest trends and advancements in the field, ensuring that his work remains cutting-edge and impactful.",
    students: 15,
    rating: 4.9,
    Images: "/images/Francis.jpg",

  },
  {
    name: "Amara Okonkwo",
    skill: "Content Creation",
    experience: "3 years",
    about: " Amara Okonkwo is a Creative and results-oriented Content Creator, Social Media Manager, UI/UX Designer, and Graphics Designer with strong experience developing engaging digital content and improving brand visibility across social platforms. Skilled in crafting compelling narratives, designing user-friendly interfaces, and executing data-driven campaigns that drive audience engagement and brand growth. Experienced across real estate, hospitality, and lifestyle sectors, with a proven ability to produce visually appealing content, build cohesive brand identities, and deliver measurable results through strategic content creation. ",
    ward: "Lekki Ward",
    students: 62,
    rating: 4.8,
    Images: "/images/Amara.jpg",
  },
  {
    name: "Kingsley Ugwumba",
    skill: "Barbing and Mobile videography",
    experience: "12 years",
    about: "Kingsley Peter Ugwumba is a creative and results-driven Digital Marketing & Social Media Specialist with over 3 years of experience executing high-impact campaigns, producing compelling content, and driving brand engagement across multiple platforms. He is highly skilled in content creation, graphic design, video editing, branding, digital analytics, mobile phone photographer and videographer, creating visually captivating content tailored for social media and digital audiences. Beyond his work in digital media, Kingsley is a professional barber with over 5 years of experience, known for precision grooming and premium customer service.Kingsley’s diverse background spans real estate operations, business development, and executive support, backed by a results-oriented and collaborative approach to work. He is recognised for his innovation, problem-solving ability, and commitment to delivering measurable growth and brand impact.",
    ward: "Ward 5",
    students: 38,
    rating: 5.0,
    Images: "/images/Kingsley.jpeg",
  },
]

export function InstructorSpotlight() {
  return (
    <section className="py-5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Meet Our <span className="text-accent">Expert Instructors</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Learn from experienced professionals dedicated to your growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructors.map((instructor, index) => (
            <Cards
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-slate-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-slate-100 overflow-hidden">
                <img
                  src={`/professional-instructor-portrait-.jpg?height=400&width=400&query=professional instructor portrait ${index + 1}`}
                  alt={instructor.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4">
                  <Badges className="bg-amber-500 text-white flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {instructor.rating} Rating
                  </Badges>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-2">{instructor.name}</h3>
                <p className="text-accent font-semibold mb-4">{instructor.skill}</p>
                
                {/* Divider */}
                <div className="w-full h-px bg-slate-200 mb-4"></div>
                
                {/* T-shape with vertical line */}
                <div className="relative">
                  {/* Vertical line - extends from divider down */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-px -top-4 h-[calc(100%+1rem)] bg-slate-200"></div>
                     
                  {/* Experience   */}
                  <div className="space-y-2 mb-6 text-sm text-slate-600 relative z-10">
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-900">{instructor.experience}</span>
                    </div>

                    {/* location */}
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="w-3 h-3" />
                        {instructor.ward}
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">View Profile</Button>
              </div>
            </Cards>
          ))}
        </div>
      </div>
    </section>
  )
}
