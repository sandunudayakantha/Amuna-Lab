import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { FaTrash } from "react-icons/fa";

const TestsList = () => {

  const {tests, aToken, getAllTests, changeAvailability, deleteTest} = useContext(AdminContext) 



  useEffect(()=>{
    if(aToken){
      getAllTests()
    }
  },[aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-2xl font-bold'>All Tests</h1>
      <div className='flex flex-wrap w-full gap-4 pt-5 gap-y-6'>
        {
          tests.map((item, index)=>(
            <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
                <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
                <div className='p-4'>
                  <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                  <p className='text-zinc-600 text-sm'>{item.category}</p>
                  <div className='mt-2 flex items-center gap-2 text-sm'>
                    <input onChange={()=>changeAvailability(item._id)} type="checkbox" checked={item.available} />
                    <p>Available</p>
                  </div>
                </div>
                <div></div>
                <div className="flex justify-end p-4">
              <button
                onClick={() => deleteTest(item._id)}
                className="border border-red-500 text-red-500 py-2 px-4 rounded text-sm hover:bg-red-500 hover:text-white transition-all hover:scale-125 duration-500 ease-in-out"
              >
                <FaTrash />
              </button>
            </div>
            </div>
          ))
          
        }
      </div>
    </div>
  )
}

export default TestsList