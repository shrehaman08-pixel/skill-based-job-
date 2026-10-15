// Stub pages — will be filled in Phases 3–6
import { Link } from 'react-router-dom'
import { Briefcase, Plus } from 'lucide-react'

export function CandidateDashboard() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Feed</h1>
        <p className="text-gray-500 mt-1">Jobs ranked by your skill match</p>
      </div>
      <div className="card text-center py-16">
        <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-700">Complete your profile to see matches</p>
        <p className="text-sm text-gray-500 mt-1">Add your skills to unlock ranked job recommendations</p>
        <Link to="/candidate/profile" className="btn-primary mt-4">Set up profile →</Link>
      </div>
    </div>
  )
}

export function CandidateProfilePage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="card"><p className="text-gray-500">Profile builder coming in Phase 3…</p></div>
    </div>
  )
}

export function CandidateApplicationsPage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>
      <div className="card"><p className="text-gray-500">Applications view coming in Phase 6…</p></div>
    </div>
  )
}

export function CandidateSavedJobsPage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
      <div className="card"><p className="text-gray-500">Saved jobs coming in Phase 6…</p></div>
    </div>
  )
}

export function RecruiterDashboard() {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your job postings</p>
        </div>
        <Link to="/recruiter/post" className="btn-primary">
          <Plus className="h-4 w-4" /> Post a Job
        </Link>
      </div>
      <div className="card text-center py-16">
        <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-700">No jobs posted yet</p>
        <p className="text-sm text-gray-500 mt-1">Post your first skill-based job to find the best candidates</p>
        <Link to="/recruiter/post" className="btn-primary mt-4">Post a job →</Link>
      </div>
    </div>
  )
}

export function RecruiterPostJobPage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Job</h1>
      <div className="card"><p className="text-gray-500">Job posting form coming in Phase 4…</p></div>
    </div>
  )
}
