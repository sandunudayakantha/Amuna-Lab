import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AIAnalysisPage = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  // Fetch recent invoices with analyses
  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/invoices/recent-with-analyses`);
        setRecentInvoices(response.data);
      } catch (err) {
        console.error('Error fetching recent analyses:', err);
      }
    };
    
    fetchRecentAnalyses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai-analysis`, { invoiceId });
      
      if (response.data.success) {
        setAnalysis(response.data.analysis);
        setSnackbarOpen(true);
        // Refresh recent invoices
        const recentResponse = await axios.get(`${API_BASE_URL}/api/invoices/recent-with-analyses`);
        setRecentInvoices(recentResponse.data);
      } else {
        setError(response.data.message || 'Failed to perform analysis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform analysis');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/test-reports/${reportId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        AI-Powered Test Analysis
      </Typography>
      
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Analyze Test Results
            </Typography>
            <IconButton 
              color="primary" 
              onClick={() => setShowHistory(true)}
              title="View analysis history"
            >
              <HistoryIcon />
            </IconButton>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Invoice ID"
              variant="outlined"
              fullWidth
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton type="submit" disabled={loading}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !invoiceId}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  Analyzing...
                </>
              ) : (
                'Run Comprehensive Analysis'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analysis && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              AI Analysis Results
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {/* Patient Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body1">
                Name: {analysis.patientInfo.name}
              </Typography>
              <Typography variant="body1">
                Age: {analysis.patientInfo.age}
              </Typography>
              <Typography variant="body1">
                Gender: {analysis.patientInfo.gender}
              </Typography>
            </Box>

            {/* Test Results Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Results Summary
              </Typography>
              <Typography variant="body1">
                Total Tests: {analysis.summary.totalTests}
              </Typography>
              <Typography variant="body1">
                Completed Tests: {analysis.summary.completedTests}
              </Typography>
              <Typography variant="body1">
                Pending Tests: {analysis.summary.pendingTests}
              </Typography>
            </Box>

            {/* AI Analysis */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI Analysis
              </Typography>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  borderLeft: '4px solid #1976d2'
                }}
              >
                <Typography variant="body1" component="div">
                  {analysis.aiAnalysis}
                </Typography>
              </Box>
            </Box>

            {/* Test Results Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Detailed Test Results
              </Typography>
              {analysis.testResults.map((test, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {test.testName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {test.status}
                  </Typography>
                  {test.results.map((result, idx) => (
                    <Typography key={idx} variant="body2">
                      {result.testName}: {result.result} {result.unit}
                    </Typography>
                  ))}
                  {test.comments && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Comments: {test.comments}
                    </Typography>
                  )}
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses Dialog */}
      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Recent Analyses</DialogTitle>
        <DialogContent>
          {recentInvoices.length === 0 ? (
            <Typography>No recent analyses found</Typography>
          ) : (
            <Box>
              {recentInvoices.map((invoice) => (
                <Card key={invoice._id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1">
                    Invoice: {invoice.invoiceNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(invoice.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {invoice.testReports?.map(report => (
                      <Chip
                        key={report._id}
                        label={`View ${report.templateId?.templateName} analysis`}
                        onClick={() => handleViewReport(report._id)}
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Analysis completed successfully"
      />
    </Container>
  );
};

export default AIAnalysisPage; 