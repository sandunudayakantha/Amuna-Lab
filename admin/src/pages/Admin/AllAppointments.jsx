import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  
  const {aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment} = useContext(AdminContext)
  const {calculateAge, slotDateFormat, currency} = useContext(AppContext)

  useEffect(()=> {
    if(aToken){
      getAllAppointments()
    }

  },[aToken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-2xl font-bold'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>

        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Test Name</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index)=>(
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'  key={index}>
              <p className='max-sm:hidden'>{index+1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full bg-purple-100' src={item.testData.image} alt="" /> <p>{item.testData.name}</p>
              </div>
              <p>{currency} {item.amount}</p>
              <div className='flex flex-row'>
               {/* {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : <><img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                <img className='w-10 cursor-pointer' src={assets.tick_icon} alt="" /> </>
                }  */}

{item.isCompleted ? (
  <p className='text-green-500 text-xs font-medium'>Completed</p>
) : (
  <>
    {!item.cancelled && (
      <>
        <img
          onClick={() => cancelAppointment(item._id)}
          className='w-10 cursor-pointer'
          src={assets.cancel_icon}
          alt="Cancel"
        />
        <img
          onClick={() => completeAppointment(item._id)}
          className='w-10 cursor-pointer'
          src={assets.tick_icon}
          alt="Complete"
        />
      </>
    )}
    {item.cancelled && <p className='text-red-500 text-xs font-medium'>Cancelled</p>}
  </>
)}

              
              
              </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllAppointments