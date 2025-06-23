import React from 'react'
import { assets } from '../../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {toast} from 'react-toastify'
import axios from 'axios'

const AddTest = () => {

    const [testImg, setTestImg] = useState(false)
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [extra, setExtra] = useState('')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [category, setCategory] = useState('Blood Test')
    const [condition1, setCondition1] = useState('')
    const [condition2, setCondition2] = useState('')

    const {backendUrl, aToken} = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if(!testImg){
                return toast.error('Image Not Selected')
            }

            const formData = new FormData()

            formData.append('image', testImg)
            formData.append('name', name)
            formData.append('code', code)
            formData.append('password', password)
            formData.append('extra', extra)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('category', category)
            formData.append('conditions', JSON.stringify({line1:condition1, line2:condition2}))

            // console log form data
            formData.forEach((value, key) => {
                console.log(`${key} : ${value}`)
            })

            const {data} = await axios.post(backendUrl +'/api/admin/add-test', formData, {headers:{aToken}})

            if(data.success){
                toast.success(data.message)
                setTestImg(false)
                setName('')
                setPassword('')
                setCode('')
                setExtra('')
                setCondition1('')
                setCondition2('')
                setAbout('')
                setFees('')
            } else {
                toast.error(data.message)
            }


        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
        <p className='mb-3 text-2xl font-bold'>Add Test</p>

        <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
            <div className='flex items-center gap-4 mb-8 text-gray-500'>
                <label htmlFor="test-img">
                    <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={testImg ? URL.createObjectURL(testImg) : assets.upload_area} alt="" />
                </label>
                <input onChange={(e)=>setTestImg(e.target.files[0])} type="file" id='test-img' hidden/>
                <p>Upload test <br/> picture  </p>
            </div>

            <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                <div className='w-full lg:flex-1 flex flex-col gap-4'>
                    <div className='flex-1 flex flex-col gap-1'>
                        <p>Test Name</p>
                        <input onChange={(e)=> setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                    </div>

                    <div className='flex-1 flex flex-col gap-1'>
                        <p>Test Code</p>
                        <input onChange={(e)=> setCode(e.target.value)} value={code} className='border rounded px-3 py-2' type="email" placeholder='Email' />
                    </div>

                   {/*<div className='flex-1 flex flex-col gap-1'>
                        <p>Test Password</p>
                        <input onChange={(e)=> setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Password' />
                    </div> */}

                    <div className='flex-1 flex flex-col gap-1'>
                        <p>Extra Info</p>
                        <input onChange={(e)=> setExtra(e.target.value)} value={extra} className='border rounded px-3 py-2' type="text" placeholder='Extra (Optional)' />
                    </div>

                    <div className='flex-1 flex flex-col gap-1'>
                        <p>Fees</p>
                        <input onChange={(e)=> setFees(e.target.value)} value={fees} className='border rounded px-3 py-2' type="number" placeholder='Test Fee' required/>
                    </div>
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                        <p>Category</p>
                        <select onChange={(e)=> setCategory(e.target.value)} value={category}  className='border rounded px-3 py-2' name="" id="">
                            <option value="Blood Test">Blood Test</option>
                            <option value="Urine Test">Urine Test</option>
                            <option value="Hormone Test">Hormone Test</option>
                            <option value="Tissue Biopsy">Tissue Biopsy</option>
                            <option value="Microbiology Test">Microbiology Test</option>
                            <option value="Toxiology Test">Toxiology Test</option>
                        </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Conditions</p>
                            <input onChange={(e)=> setCondition1(e.target.value)} value={condition1} className='border rounded px-3 py-2' type="text" placeholder='Condition 1' />
                            <input onChange={(e)=> setCondition2(e.target.value)} value={condition2} className='border rounded px-3 py-2' type="text" placeholder='Condition 2' />
                        </div>
                       
                    </div>
                </div>

                    <div>
                        <p className='mt-4 mb-2'>About</p>
                        <textarea onChange={(e)=> setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' placeholder='write about test' rows={5} required/>
                    </div>

                    <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add Test</button>
            </div>
        
    </form>
  )
}

export default AddTest