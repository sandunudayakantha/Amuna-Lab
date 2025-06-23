import express from 'express'
import { testList } from '../controllers/testController.js'

const testRouter = express.Router()

testRouter.get('/list', testList)
//testRouter.post('/delete-test', deleteTest)

export default testRouter