import testModel from "../models/testModel.js"

const changeAvailability = async (req, res) => {
    try {
        const {testId} = req.body

        const testData = await testModel.findById(testId)
        await testModel.findByIdAndUpdate(testId,{available: !testData.available})
        res.json({success:true, message:"Availability Changed"})

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const testList = async (req, res) => {
    try {

        const tests = await testModel.find({}).select(['-password', '-code'])

        res.json({success:true, tests})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}





export{changeAvailability, testList}