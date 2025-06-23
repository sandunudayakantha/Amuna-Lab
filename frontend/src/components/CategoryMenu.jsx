import React from 'react'
import { CategoryData } from '../assets/assets'
import { Link } from 'react-router-dom'

const CategoryMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='category'>
        <h1 className='text-3xl font-medium'>Find by Category</h1>
        <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of various tests, schedule your appointment hassle-free.</p>

        <div className='flex sm:justify-center gap-10 pt-5 w-full overflow-scroll'>
            {CategoryData.map((item, index)=>(
                <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' key={index} to={`/tests/${item.category}`}>
                    <img className='w-20 sm:w-24 rounded-full mb-2' src={item.image} alt="" />
                    <p className=''>{item.name}</p>
                </Link>
            ))}
        </div>

    </div>
  )
}

export default CategoryMenu