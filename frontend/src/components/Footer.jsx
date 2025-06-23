import React from 'react'
import logo from '../assets/slLogo.png'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

            {/* left section */}
            <div>
                <img className='mb-5 w-40' src={logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>At SmartLab, we provide accurate, fast, and reliable medical testing services to ensure your health and well-being. Our state-of-the-art laboratory is equipped with advanced technology to deliver precise diagnostic results, helping you and your doctor make informed healthcare decisions.</p>
            </div>

            {/* center section */}
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy policy</li>
                </ul>
            </div>

            {/* right section */}
            <div>
                <p  className='text-xl font-medium mb-5'>GET IN TOUCH</p>

                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+94-2344-45643</li>
                    <li>smartlab@gmail.com</li>
                </ul>

            </div>
        </div>

        <div>
            {/* copyright text */}
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025@ Smartlab - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer