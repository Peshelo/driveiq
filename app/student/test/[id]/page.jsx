"use client"

import PocketBase from 'pocketbase'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import pb from '@/lib/connection'
import { useParams, useRouter } from 'next/navigation'

export default function Sign() {
  const router = useRouter();
  const {id} = useParams();
  const [nationalId, setNationalId] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUserVerified, setIsUserVerified] = useState(false)
  const [errors, setErrors] = useState({
    nationalId: '',
    drivingClass: ''
  })

  useEffect(() => {
    // Attempt full screen on first interaction
    const handleFirstInteraction = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          toast.error(`Full screen error: ${err.message}`, {
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))'
            }
          })
        })
      }
      document.removeEventListener('click', handleFirstInteraction)
    }
    
    document.addEventListener('click', handleFirstInteraction)
    return () => document.removeEventListener('click', handleFirstInteraction)
  }, [])

  const drivingClasses = [
    { id: 'CLASS_1', label: 'Class 1 (Motorcycles)' },
    { id: 'CLASS_2', label: 'Class 2 (Light Vehicles)' },
    { id: 'CLASS_3', label: 'Class 3 (Heavy Vehicles)' }
  ]

  const handleStartTest = () => {
    if (isUserVerified && selectedClass) {
      // Redirect to the test page with the selected class
      // alert('Test started!')

      router.push(`/student/test/${id}/start?class=${selectedClass.id}`);
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {
      nationalId: '',
      drivingClass: ''
    }

    if (!nationalId.trim()) {
      newErrors.nationalId = 'National ID is required'
      valid = false
    } else if (!/^[a-zA-Z0-9]+$/.test(nationalId.trim())) {
      newErrors.nationalId = 'Invalid National ID format'
      valid = false
    }

    if (!selectedClass) {
      newErrors.drivingClass = 'Please select a driving class'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const verifyUser = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await pb.collection('students').getFirstListItem(
        `national_id="${nationalId}"`
      )

      if (result) {
        setFullName(result.name)
        setIsUserVerified(true)
        toast.success(`Welcome back, ${result.name}`, {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))'
          }
        })
        
        // Enter full screen after verification
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setFullName('')
      setIsUserVerified(false)
      
      if (error.status === 404) {
        toast.error('User not found. Please check your National ID', {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))'
          }
        })
      } else {
        toast.error('Verification failed. Please try again', {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))'
          }
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-screen h-screen p-4 flex flex-col items-center justify-center bg-background'>
      <form 
        onSubmit={verifyUser}
        className='flex flex-col w-full max-w-md gap-4 mt-4 bg-card text-card-foreground p-6 rounded-lg shadow border border-border'
      >
        <h1 className='text-2xl text-left font-bold'>Sign In</h1>
        <p className='text-muted-foreground'>Please enter your credentials to sign in.</p>
        
        <label className='flex flex-col gap-1'>
          <span className='text-sm font-medium'>NationalID / Passport ID</span>
          <input 
            type="text" 
            className={`border rounded p-2 bg-background ${errors.nationalId ? 'border-destructive' : 'border-input'}`}
            value={nationalId}
            onChange={(e) => {
              setNationalId(e.target.value)
              setErrors(prev => ({...prev, nationalId: ''}))
            }}
            required 
          />
          {errors.nationalId && (
            <p className="text-sm text-destructive">{errors.nationalId}</p>
          )}
        </label>
        
        <label className='flex flex-col gap-1'>
          <span className='text-sm font-medium'>Full Name</span>
          <input 
            type="text" 
            className='border border-input rounded p-2 bg-muted text-muted-foreground' 
            value={fullName}
            readOnly
          />
        </label>
        
        <div className="flex flex-col gap-2">
          <span className='text-sm font-medium'>Driving Class</span>
          <div className="flex gap-2 flex-wrap">
            {drivingClasses.map((cls) => (
              <button
                key={cls.id}
                type="button"
                className={`px-4 py-2 rounded text-xs border ${
                  selectedClass?.id === cls.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary text-secondary-foreground border-input hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => {
                  setSelectedClass(cls)
                  setErrors(prev => ({...prev, drivingClass: ''}))
                }}
              >
                {cls.label}
              </button>
            ))}
          </div>
          {errors.drivingClass && (
            <p className="text-sm text-destructive">{errors.drivingClass}</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          onClick={()=>{
            handleStartTest();
          }}
          className={`w-full text-primary-foreground rounded p-2 ${
            isLoading 
              ? 'bg-muted cursor-not-allowed' 
              : isUserVerified 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isLoading ? 'Verifying...' : isUserVerified ? 'Start Test' : 'Verify'}
        </button>
      </form>
    </div>
  )
}