// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <SteeringWheelIcon />
          <span className="text-xl font-bold text-gray-800">DriverIQ</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">About</Link>
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Courses</Link>
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Instructors</Link>
          <Link href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>
        </div>
        <button className="hidden md:block px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
          Learn More
        </button>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Master the Road with <span className="text-blue-600">DriveIQ</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional driving education platform for students and instructors.
            Get started by selecting your role below.
          </p>
        </div>

        {/* Split Screen Login */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Login */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
            <div className="flex items-center justify-center mb-4">
              <UserIcon />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Student Portal</h2>
            <p className="text-gray-600 mb-6 text-center">
              Access your courses, schedule lessons, track progress, and communicate with instructors.
            </p>
            <Link href="/auth/student/sign-in">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Student Sign In <ChevronRightIcon />
              </button>
            </Link>
          </div>

          {/* Admin Login */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
            <div className="flex items-center justify-center mb-4">
              <ShieldIcon />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Admin Portal</h2>
            <p className="text-gray-600 mb-6 text-center">
              Manage students, instructors, schedules, and platform settings.
            </p>
            <Link href="/auth/sign-in">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Admin Sign In <ChevronRightIcon />
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<CalendarClockIcon />}
            title="Flexible Scheduling"
            description="Book lessons at your convenience with our easy-to-use scheduling system."
          />
          <FeatureCard 
            icon={<BookOpenIcon />}
            title="Comprehensive Courses"
            description="From beginner to advanced, we cover all aspects of safe driving."
          />
          <FeatureCard 
            icon={<BarChartIcon />}
            title="Progress Tracking"
            description="Monitor your improvement with detailed analytics and feedback."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <SteeringWheelIcon className="text-blue-400" />
              <span className="text-lg font-bold">DriveIQ</span>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="hover:text-blue-400 transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-400 transition">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-400 transition">Contact Us</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} DriveIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-50 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}

// Icons
function SteeringWheelIcon({ className = "h-8 w-8 text-blue-600" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function UserIcon({ className = "h-12 w-12 text-blue-500" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon({ className = "h-12 w-12 text-blue-500" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ChevronRightIcon({ className = "ml-2 h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CalendarClockIcon({ className = "h-8 w-8 text-blue-600" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h5" />
      <path d="M17.5 17.5 16 16.3V14" />
      <circle cx="16" cy="16" r="6" />
    </svg>
  );
}

function BookOpenIcon({ className = "h-8 w-8 text-blue-600" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function BarChartIcon({ className = "h-8 w-8 text-blue-600" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}