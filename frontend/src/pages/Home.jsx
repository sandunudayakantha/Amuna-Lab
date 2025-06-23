import React from 'react'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import TopTests from '../components/TopTests'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
        <Header/>
        <CategoryMenu/>
        <TopTests/>
        <Banner/>
    </div>
  )
}

export default Home