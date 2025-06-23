import OpenAI from 'openai';
import TestReport from '../models/testReport.model.js';
import Invoice from '../models/invoiceModel.js';

// Initialize OpenAI client for GitHub-hosted model
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN
});

// Enhanced clinical analysis fallback
const generateFallbackAnalysis = (patientInfo, testResults) => {
  // Detect abnormal results
  const abnormalResults = testResults.filter(result => {
    try {
      const value = parseFloat(result.result);
      if (isNaN(value)) return false;
      
      if (result.normalRange) {
        const rangeParts = result.normalRange.split('-').map(part => {
          const num = parseFloat(part.replace(/[^0-9.-]/g, ''));
          return isNaN(num) ? null : num;
        }).filter(Boolean);
        
        if (rangeParts.length === 2) {
          return value < rangeParts[0] || value > rangeParts[1];
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  // Generate interpretation
  let interpretation = '';
  if (abnormalResults.length > 0) {
    interpretation = `Abnormal Findings:\n${
      abnormalResults.map(r => `- ${r.testName}: ${r.result} (Normal range: ${r.normalRange})`).join('\n')
    }\n\nClinical Significance:\n`;
    
    // Add specific interpretations based on test types
    abnormalResults.forEach(test => {
      if (test.testName.toLowerCase().includes('urine')) {
        interpretation += `- Low urine glucose could suggest renal issues\n`;
      } else if (test.testName.toLowerCase().includes('crp')) {
        interpretation += `- Elevated CRP may indicate inflammation\n`;
      } else if (test.testName.toLowerCase().includes('cholesterol')) {
        interpretation += `- Abnormal cholesterol levels may indicate cardiovascular risk\n`;
      }
    });
  } else {
    interpretation = 'All results appear within normal ranges.';
  }

  return `Medical Analysis Report for ${patientInfo.name} (${patientInfo.age}, ${patientInfo.gender})

Test Results Overview:
${
  testResults.map(t => 
    `- ${t.testName}: ${t.result} ${t.unit || ''} ${
      t.normalRange ? `(Normal range: ${t.normalRange})` : ''
    }${
      abnormalResults.some(ab => ab.testName === t.testName) ? ' [ABNORMAL]' : ''
    }`
  ).join('\n')
}

${interpretation}

Recommendations:
1. ${abnormalResults.length > 0 ? 
  'Review abnormal results with a physician' : 
  'Routine follow-up as clinically indicated'}
2. Consider ${abnormalResults.length > 0 ? 
  'repeat testing and additional investigations' : 
  'maintaining current health monitoring'}
3. Clinical correlation required for final interpretation

[This automated analysis is based on provided test values and normal ranges]`;
};

const analyzeWithGitHubGPT4 = async (patientInfo, testResults) => {
  try {
    // Format test results for input
    const testResultsText = testResults.map(t => 
      `- ${t.testName}: ${t.result} ${t.unit || ''} ${t.normalRange ? `(Normal range: ${t.normalRange})` : ''}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical expert analyzing laboratory test results. Provide a professional analysis with:\n" +
                   "1. Interpretation of abnormal values\n" +
                   "2. Clinical significance\n" +
                   "3. Recommendations\n" +
                   "4. Any urgent concerns\n\n" +
                   "Format as a clean medical report without introductory text."
        },
        {
          role: "user",
          content: `Patient: ${patientInfo.name}, ${patientInfo.age} years, ${patientInfo.gender}\n\n` +
                   `Test Results:\n${testResultsText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1
    });

    const analysis = response.choices[0]?.message?.content || '';
    
    // Clean the output to remove any prompt artifacts
    return analysis.replace(/^.*?(Medical Analysis Report|Test Results|Abnormal Findings)/i, '$1')
                  .replace(/As a medical expert.*?Results:/is, '')
                  .trim();
  } catch (error) {
    console.error('GitHub Model API error:', error);
    throw new Error('Failed to generate analysis with GitHub-hosted GPT-4');
  }
};

const analyzeTestResults = async (req, res) => {
  try {
    console.log('AI Analysis request received:', req.body);
    const { invoiceId } = req.body;

    // Validate input
    if (!invoiceId) {
      return res.status(400).json({ 
        success: false,
        message: 'Invoice ID is required' 
      });
    }

    // Find invoice and patient info
    const invoice = await Invoice.findById(invoiceId).populate('userId');
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: 'Invoice not found' 
      });
    }

    // Get completed test reports
    const testReports = await TestReport.find({ 
      invoiceId,
      completeStatus: true
    }).populate('templateId');

    if (!testReports?.length) {
      return res.status(404).json({ 
        success: false,
        message: 'No completed test reports found' 
      });
    }

    // Prepare patient info
    const patientInfo = {
      name: invoice.userId?.name || 'Unknown',
      age: invoice.userId?.age?.years || 'Unknown',
      gender: invoice.userId?.gender || 'Unknown'
    };

    // Prepare test results data
    const testResultsData = testReports.flatMap(report => 
      report.testResults.map(result => ({
        testName: result.testName,
        result: result.result,
        unit: result.unit,
        normalRange: result.normalRange
      }))
    );

    // Attempt AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeWithGitHubGPT4(patientInfo, testResultsData);
      console.log('GitHub-hosted GPT-4 analysis successful');
    } catch (error) {
      console.error('Using fallback analysis due to:', error.message);
      aiAnalysis = generateFallbackAnalysis(patientInfo, testResultsData);
    }

    // Prepare response
    res.json({
      success: true,
      analysis: {
        invoiceId,
        patientInfo,
        testResults: testReports.map(report => ({
          testName: report.templateId?.templateName || 'Unknown Test',
          results: report.testResults || [],
          status: 'completed',
          comments: report.comment || ''
        })),
        summary: {
          totalTests: testReports.length,
          completedTests: testReports.length,
          pendingTests: 0
        },
        aiAnalysis,
        isFallback: aiAnalysis.includes('This automated analysis')
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Analysis failed',
      error: error.message 
    });
  }
};

const getReportAnalysis = async (req, res) => {
  try {
    const report = await TestReport.findById(req.params.id)
      .populate('templateId')
      .populate('patientId');

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Test report not found' 
      });
    }

    if (!report.aiAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis available'
      });
    }

    res.json({
      success: true,
      analysis: report.aiAnalysis,
      reportId: report._id,
      patientName: report.patientId?.name,
      testName: report.templateId?.templateName
    });

  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis',
      error: error.message
    });
  }
};

export default { analyzeTestResults, getReportAnalysis };