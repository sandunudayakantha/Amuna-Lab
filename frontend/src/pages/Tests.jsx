import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Tests = () => {

    const {category} = useParams()
    const  [filtertest, setFilterTest] = useState([])
    const [showFilter, setShowFilter] = useState(false)

    const navigate = useNavigate()
    const {tests} = useContext(AppContext)

    const applyFilter = () => {
        if(category){
            setFilterTest(tests.filter(test => test.category === category))
        } else {
            setFilterTest(tests)
        }
    }

    useEffect(()=> {
        applyFilter()
    },[tests, category])

  return (
    <div>
        <p className='text-gray-600'>Browse through the test categories.</p>
        <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
            <button onClick={()=>setShowFilter(prev => !prev)} className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
            <div className={` flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
                <p onClick={()=> category === 'Blood Test' ? navigate('/tests'): navigate('/tests/Blood Test')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Blood Test" ? "bg-indigo-100 text-black" : ""}`}>Blood Test</p>
                <p onClick={()=> category === 'Urine Test' ? navigate('/tests'): navigate('/tests/Urine Test')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Urine Test" ? "bg-indigo-100 text-black" : ""}`}>Urine Test</p>
                <p onClick={()=> category === 'Hormone Test' ? navigate('/tests'): navigate('/tests/Hormone Test')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Hormone Test" ? "bg-indigo-100 text-black" : ""}`}>Hormone Test</p>
                <p onClick={()=> category === 'Tissue Biopsy' ? navigate('/tests'): navigate('/tests/Tissue Biopsy')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Tissue Biopsy" ? "bg-indigo-100 text-black" : ""}`}>Tissue Biopsy</p>
                <p onClick={()=> category === 'Microbiology Test' ? navigate('/tests'): navigate('/tests/Microbiology Test')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Microbiology Test" ? "bg-indigo-100 text-black" : ""}`}>Microbiology Test</p>
                <p onClick={()=> category === 'Toxiology Test' ? navigate('/tests'): navigate('/tests/Toxiology Test')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === "Toxiology Test" ? "bg-indigo-100 text-black" : ""}`}>Toxiology Test</p>
            </div>
            <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
                {
                    filtertest.map((item, index)=>(
                        <div onClick={()=>navigate(`/appointment/${item._id}`)} className='border border-x-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                            <img className='bg-blue-50 ' src={item.image} alt="" />
                            <div className='p-4'>
                                <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                                    <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                                </div>
                                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                                <p className='text-gray-600 text-sm '>{item.category}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default Tests