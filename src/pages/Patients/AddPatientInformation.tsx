import React from 'react'
import AddPatient from './AddPatient'


export const AddPatientInformation:React.FC = () => {
  
  return (
    <div className='bg-white lg:w-[50%] border border-gray-50 m-auto mt-20 shadow-md rounded-lg'>
        <AddPatient toggleClose={function (): void {
        throw new Error('Function not implemented.')
      } } patientInformation={true}/>
    </div>
  )
}
