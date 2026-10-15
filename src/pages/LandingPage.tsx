import { Link } from 'react-router-dom'
import { Zap, Target, TrendingUp, Users, Briefcase, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'Skill-Based Matching',
    desc: 'Our engine matches on skills, not titles — so your experience actually counts.',
  },
  {
    icon: TrendingUp,
    title: 'Score Explanations',
    desc: 'See exactly which skills matched, which partially matched, and what to learn.',
  },
  {
    icon: Users,
    title: 'For Candidates',
    desc: 'Build your skill profile, get ranked job matches, and apply with confidence.',
  },
  {
    icon: Briefcase,
    title: 'For Recruiters',
    desc: 'Post skill-driven jobs and see your best-fit candidates ranked automatically.',
  },
]

const stats = [
  { value: '150+', label: 'Skills tracked' },
  { value: '100%', label: 'Skill-based scoring' },
  { value: '0', label: 'Title bias' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">SkillMatch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-700 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
            <Zap className="h-4 w-4" />
            Matching by skills, not titles
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Get hired for what you <span className="text-yellow-300">actually know</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 max-w-2xl mx-auto mb-10">
            SkillMatch scores every job against your real skill profile — no keyword games,
            no title inflation, just honest match percentages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup?role=candidate" className="btn-primary bg-white text-brand-700 hover:bg-gray-50 text-base px-6 py-3">
              Find jobs as a candidate
            </Link>
            <Link to="/signup?role=recruiter" className="btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20 text-base px-6 py-3">
              Hire by skills
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <dl className="grid grid-cols-3 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <dt className="text-3xl font-bold text-brand-600">{value}</dt>
                <dd className="mt-1 text-sm text-gray-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <CheckCircle className="h-12 w-12 text-brand-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to match by skills?</h2>
          <p className="text-gray-500 mb-8">Join SkillMatch and let your skills speak for themselves.</p>
          <Link to="/signup" className="btn-primary text-base px-8 py-3">Create free account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>SkillMatch</span>
          </div>
          <span>© 2024 SkillMatch. Skill-based hiring.</span>
        </div>
      </footer>
    </div>
  )
}
