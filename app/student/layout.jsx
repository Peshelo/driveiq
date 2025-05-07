"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../../components/toggle-theme";
import { LogOut, User2Icon, Menu } from "lucide-react";
import { use, useEffect, useState } from "react";
import pb from "@/lib/connection";

export default function RootLayout({ children }) {
  const router = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [drivingSchool, setDrivingSchool] = useState({
    name: 'Travis',
    primary_color: 'green',
    secondary_color: 'yellow',
  });
  
  // const fetchDrivingSchool = async () => {
  //   const data = await pb.collection('users').getOne(pb.authStore.record.driving_school);
  //   console.log(data);
  //   setDrivingSchool(data);
  // }

  useEffect(() => {
    // console.log(pb.authStore.record);
    // fetchDrivingSchool();
    // console.log(pb.authStore.record.expand.driving_school);
  }, []);


  return (
    <div className="flex flex-col w-full min-h-screen">
      {!router.includes('start') ? (
        <header className="p-2 bg-slate-900">
          <div className="container mx-auto flex flex-row justify-between items-center">
            <div className="flex items-center">
              <button 
                className="md:hidden text-white mr-4"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href={'/student/test'} className="flex flex-col justify-between items-start p-4">
                <h1 className={`text-2xl font-bold text-${drivingSchool.primary_color}-600`}>{drivingSchool.name.toUpperCase()}</h1>
                <p className={`text-yellow-300 text-sm font-semibold`}>DRIVING SCHOOL</p>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex flex-row items-center gap-4">
                <li>
                  <Link href="/student" className="text-white hover:text-blue-500">Dashboard</Link>
                </li>
                <li>
                  <Link href="/student/test" className="text-orange-500 hover:text-blue-500">Take a Tests</Link>
                </li>
                <span className="text-gray-500">|</span>
                <li>
                  <Link href="/student/test/results" className="text-white hover:text-blue-500">Results</Link>
                </li>
                <li>
                  <Link href="/student/profile" className="text-white hover:text-blue-500">
                    <User2Icon className="h-4 w-4" />
                  </Link>
                </li>
                <li>
                  <ModeToggle />
                </li>
                <li>
                  <Link href="/" className="text-white hover:text-blue-500">
                    <LogOut className="h-4 w-4" />
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <nav className="md:hidden absolute top-16 left-0 right-0 bg-slate-800 z-50">
                <ul className="flex flex-col items-start p-4 gap-4">
                  <li>
                    <Link 
                      href="/student" 
                      className="text-white hover:text-blue-500 block w-full py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/student/test" 
                      className="text-orange-500 hover:text-blue-500 block w-full py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Take a Tests
                    </Link>
                  </li>
                  <li className="w-full border-t border-gray-700 my-2"></li>
                  <li>
                    <Link 
                      href="/student/test/results" 
                      className="text-white hover:text-blue-500 block w-full py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Results
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/student/profile" 
                      className="text-white hover:text-blue-500 flex items-center w-full py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User2Icon className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </li>
                  <li className="flex items-center w-full py-2">
                    <ModeToggle />
                    <span className="ml-2 text-white">Theme</span>
                  </li>
                  <li>
                    <Link 
                      href="/" 
                      className="text-white hover:text-blue-500 flex items-center w-full py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </header>
      ) : null}
      
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}