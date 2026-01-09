"use client"

export function WhyThisMatters() {
  const statements = [
    {
      text: "Structure builds discipline",
      description: "Organized systems create consistent habits that lead to lasting growth",
    },
    {
      text: "Growth thrives in accountability",
      description: "When progress is tracked and shared, commitment deepens",
    },
    {
      text: "Community amplifies impact",
      description: "Together we achieve more than we ever could alone",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(34,197,94,0.1),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why This <span className="text-amber-400">Matters</span>
          </h2>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">More than software—a foundation for transformation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statements.map((statement, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-amber-500 mx-auto mb-6 group-hover:w-24 transition-all duration-300" />
                <h3 className="text-2xl font-bold text-white mb-4 text-balance">{statement.text}</h3>
                <p className="text-green-100 leading-relaxed">{statement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
