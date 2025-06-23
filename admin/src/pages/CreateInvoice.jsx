import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Autocomplete,
    Divider,
    Container,
    CircularProgress,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PaymentForm from '../components/PaymentForm';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RJ5zgQfpmzONuRxsOXD7kVLad3oXLOEelrkYLVCBLLk514JGSwGasvgMF1v1taPeGpYZ6weRwWIBJN0mgi68kJw00RiWOtxL3');

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [testTemplates, setTestTemplates] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [formData, setFormData] = useState({
        userId: '',
        paymentType: 'Cash',
        amount: 0,
        payingAmount: 0,
        dueAmount: 0,
        notes: '',
        isFullPayment: false
    });
    const [newUser, setNewUser] = useState({
        title: 'Mr',
        name: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: '',
        dob: '',
        age: {
            years: 0,
            months: 0
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filteredTests, setFilteredTests] = useState([]);
    const [searchError, setSearchError] = useState('');
    const searchTimeoutRef = useRef(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userSearchError, setUserSearchError] = useState('');
    const userSearchTimeoutRef = useRef(null);
    const [isUserSearchFocused, setIsUserSearchFocused] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchTestTemplates();
    }, []);

    // Debounce search
    useEffect(() => {
        if (!isSearchFocused) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (searchTerm && searchTerm.trim()) {
                searchTestTemplates();
            } else {
                setFilteredTests(testTemplates);
            }
        }, 500); // Increased debounce time

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, testTemplates, isSearchFocused]);

    // Debounce user search
    useEffect(() => {
        if (!isUserSearchFocused) return;

        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        userSearchTimeoutRef.current = setTimeout(() => {
            if (userSearchTerm && userSearchTerm.trim()) {
                searchUsers();
            } else {
                setFilteredUsers(users);
            }
        }, 500);

        return () => {
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
        };
    }, [userSearchTerm, users, isUserSearchFocused]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTestTemplates = async () => {
        try {
            setLoading(true);
            console.log('Fetching all test templates...');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/testTemplates`);
            console.log('All templates response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setTestTemplates(response.data);
                setFilteredTests(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Error: Unexpected data format received from server');
            }
        } catch (error) {
            console.error('Error fetching test templates:', error);
            if (error.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Please make sure the backend is running.');
            } else if (error.response) {
                console.error('Server response:', error.response.data);
                setError(error.response.data.message || 'Error loading test templates');
            } else {
                setError('Error loading test templates. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const searchTestTemplates = async () => {
        try {
            setLoading(true);
            setSearchError('');
            
            // Don't search if the term is too short
            if (searchTerm.length < 2) {
                setFilteredTests(testTemplates);
                return;
            }

            console.log('Making search request with term:', searchTerm);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/testTemplates/search`, {
                params: {
                    templateName: searchTerm,
                    shortName: searchTerm
                }
            });
            
            console.log('Search response:', response.data);
            
            // The backend now returns an array directly
            if (Array.isArray(response.data)) {
                setFilteredTests(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setFilteredTests([]);
            }
        } catch (error) {
            console.error('Error searching test templates:', error);
            if (error.response) {
                // Server returned an error response
                const errorMessage = error.response.data?.message || 'Error searching tests';
                const errorDetails = error.response.data?.error || '';
                console.error('Server error details:', error.response.data);
                setSearchError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            } else if (error.request) {
                // Request was made but no response received
                console.error('No response received:', error.request);
                setSearchError('No response from server. Please try again.');
            } else {
                // Something else happened
                console.error('Other error:', error.message);
                setSearchError('Error searching tests. Please try again.');
            }
            setFilteredTests([]);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        try {
            setLoading(true);
            setUserSearchError('');
            
            // Don't search if the term is too short
            if (userSearchTerm.length < 2) {
                setFilteredUsers(users);
                return;
            }

            console.log('Making user search request with term:', userSearchTerm);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/search`, {
                params: {
                    name: userSearchTerm
                }
            });
            
            console.log('User search response:', response.data);
            
            if (Array.isArray(response.data)) {
                setFilteredUsers(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setFilteredUsers([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Error searching users';
                const errorDetails = error.response.data?.error || '';
                console.error('Server error details:', error.response.data);
                setUserSearchError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                setUserSearchError('No response from server. Please try again.');
            } else {
                console.error('Other error:', error.message);
                setUserSearchError('Error searching users. Please try again.');
            }
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (event, newValue) => {
        if (newValue) {
            // Set the selected user ID
            setFormData({ ...formData, userId: newValue._id });
            
            // Auto-fill the new user form
            setNewUser({
                name: newValue.name,
                email: newValue.email,
                phone: newValue.phone,
                title: newValue.title || 'Mr',
                address: newValue.address || '',
                gender: newValue.gender || 'Male',
                dob: newValue.dob || '',
                age: {
                    years: newValue.age?.years || 0,
                    months: newValue.age?.months || 0
                }
            });
            
            // Clear search and close dropdown
            setUserSearchTerm('');
            setIsUserSearchFocused(false);
        }
    };

    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        
        // Handle age fields separately
        if (name === 'ageYears' || name === 'ageMonths') {
            setNewUser(prev => ({
                ...prev,
                age: {
                    ...prev.age,
                    [name === 'ageYears' ? 'years' : 'months']: parseInt(value) || 0
                }
            }));
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleTestSelect = (event, newValue) => {
        console.log('Selected test:', newValue);
        if (newValue && !selectedTests.find(t => t._id === newValue._id)) {
            setSelectedTests([...selectedTests, newValue]);
            setSearchTerm('');
        }
    };

    const handleRemoveTest = (testId) => {
        setSelectedTests(selectedTests.filter(test => test._id !== testId));
    };

    const calculateTotal = () => {
        return selectedTests.reduce((total, test) => total + test.price, 0);
    };

    const handleCardPayment = async () => {
        try {
            const stripe = await stripePromise;
            
            // Create payment intent on your backend
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/create-payment-intent`, {
                amount: formData.payingAmount * 100, // Convert to cents
                currency: 'lkr'
            });

            const { clientSecret } = response.data;

            // Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: {
                        number: cardDetails.cardNumber,
                        exp_month: cardDetails.expiryDate.split('/')[0],
                        exp_year: cardDetails.expiryDate.split('/')[1],
                        cvc: cardDetails.cvv
                    },
                    billing_details: {
                        name: cardDetails.cardHolderName
                    }
                }
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                // Payment successful
                handleSubmit(null, true);
            }
        } catch (error) {
            setError('Payment failed: ' + error.message);
        }
    };

    const handleFullPaymentChange = (event) => {
        const isFullPayment = event.target.checked;
        const totalAmount = calculateTotal();
        setFormData({
            ...formData,
            isFullPayment,
            payingAmount: isFullPayment ? totalAmount : 0,
            dueAmount: isFullPayment ? 0 : totalAmount
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let userId = formData.userId;

            // If creating new user
            if (!userId && newUser.name) {
                // Ensure age values are numbers and include password
                const formattedUser = {
                    ...newUser,
                    age: {
                        years: parseInt(newUser.age.years) || 0,
                        months: parseInt(newUser.age.months) || 0
                    },
                    password: "default123" // Add default password
                };
                const userResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users`, formattedUser);
                userId = userResponse.data._id;
            }

            if (!userId) {
                setError('Please select a user or create a new one');
                return;
            }

            if (selectedTests.length === 0) {
                setError('Please select at least one test');
                return;
            }

            const totalAmount = calculateTotal();
            const payingAmount = formData.isFullPayment ? totalAmount : parseFloat(formData.payingAmount) || 0;
            const dueAmount = totalAmount - payingAmount;

            const invoiceData = {
                userId,
                testTemplateId: selectedTests[0]._id,
                paymentType: formData.paymentType,
                amount: totalAmount,
                payingAmount: payingAmount,
                dueAmount: dueAmount,
                notes: formData.notes,
                paymentStatus: formData.isFullPayment ? 'Paid' : (formData.paymentType === 'Card' ? 'Pending' : 'Partial')
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, invoiceData);
            
            if (formData.paymentType === 'Card') {
                setCreatedInvoiceId(response.data._id);
                setShowPaymentForm(true);
                setSuccess('Invoice created successfully! Please complete the payment.');
            } else {
                setSuccess('Invoice created successfully!');
                // Reset form for new invoice
                setFormData({
                    userId: '',
                    paymentType: 'Cash',
                    amount: 0,
                    payingAmount: 0,
                    dueAmount: 0,
                    notes: '',
                    isFullPayment: false
                });
                setSelectedTests([]);
                setNewUser({
                    title: 'Mr',
                    name: '',
                    gender: 'Male',
                    email: '',
                    phone: '',
                    address: '',
                    dob: '',
                    age: {
                        years: 0,
                        months: 0
                    }
                });
                setUserSearchTerm('');
                setSearchTerm('');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating invoice');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (paymentId) => {
        setPaymentStatus('success');
        setSuccess('Payment processed successfully!');
        
    };

    const handlePaymentFailure = (error) => {
        setPaymentStatus('failed');
        setError(`Payment failed: ${error}`);
    };

    const handleDownloadPDF = async () => {
        try {
            // First create the invoice
            const invoiceData = {
                userId: formData.userId,
                testTemplateId: selectedTests[0]._id,
                paymentType: formData.paymentType,
                amount: calculateTotal(),
                payingAmount: formData.payingAmount,
                dueAmount: calculateTotal() - (parseFloat(formData.payingAmount) || 0),
                notes: formData.notes,
                paymentStatus: formData.paymentType === 'Card' ? 'Pending' : 'Paid'
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, invoiceData);
            const createdInvoice = response.data;

            // Get user data
            const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${formData.userId}`);
            const user = userResponse.data;

            // Generate PDF
            const doc = generateInvoicePDF(createdInvoice, user, selectedTests);
            
            // Save the PDF
            doc.save(`invoice_${createdInvoice._id}.pdf`);
            
            setSuccess('Invoice created and PDF downloaded successfully!');
        } catch (error) {
            setError('Failed to create invoice and generate PDF: ' + error.message);
        }
    };

    const handlePrintInvoice = async () => {
        try {
            // First create the invoice
            const invoiceData = {
                userId: formData.userId,
                testTemplateId: selectedTests[0]._id,
                paymentType: formData.paymentType,
                amount: calculateTotal(),
                payingAmount: formData.payingAmount,
                dueAmount: calculateTotal() - (parseFloat(formData.payingAmount) || 0),
                notes: formData.notes,
                paymentStatus: formData.paymentType === 'Card' ? 'Pending' : 'Paid'
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, invoiceData);
            const createdInvoice = response.data;

            // Get user data
            const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${formData.userId}`);
            const user = userResponse.data;

            // Generate PDF
            const doc = generateInvoicePDF(createdInvoice, user, selectedTests);
            
            // Open in new window for printing
            const pdfWindow = window.open('', '_blank');
            pdfWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${createdInvoice._id}</title>
                    </head>
                    <body>
                        <embed width="100%" height="100%" name="plugin" 
                            src="data:application/pdf;base64,${doc.output('datauristring').split(',')[1]}" 
                            type="application/pdf">
                    </body>
                </html>
            `);
            
            setSuccess('Invoice created and ready for printing!');
        } catch (error) {
            setError('Failed to create invoice and generate PDF: ' + error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">Create Invoice</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}
                {!showPaymentForm ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Selection/Creation */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-blue-600 mb-4">User Information</h2>
                                        <Autocomplete
                                            options={filteredUsers}
                                            getOptionLabel={(option) => 
                                                `${option.name} - ${option.phone}`
                                            }
                                            value={users.find(user => user._id === formData.userId) || null}
                                            onChange={handleUserSelect}
                                            inputValue={userSearchTerm}
                                            onInputChange={(event, newInputValue) => {
                                                setUserSearchTerm(newInputValue);
                                            }}
                                            onFocus={() => setIsUserSearchFocused(true)}
                                            onBlur={() => {
                                                setTimeout(() => setIsUserSearchFocused(false), 200);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Search Users"
                                                    fullWidth
                                                    margin="normal"
                                                    placeholder="Type at least 2 characters to search"
                                                    error={!!userSearchError}
                                                    helperText={userSearchError}
                                            className="rounded-md"
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                        <li key={option._id} {...props} className="p-2 hover:bg-gray-100">
                                                    {option.name}
                                            <span className="text-gray-500 ml-2">
                                                        {option.phone} - {option.email}
                                            </span>
                                                </li>
                                            )}
                                            loading={loading}
                                            loadingText="Loading users..."
                                            noOptionsText={userSearchError || "No users found"}
                                            freeSolo={false}
                                            clearOnBlur={false}
                                            clearOnEscape={false}
                                            filterOptions={(options, state) => options}
                                            open={isUserSearchFocused}
                                        />

                                <h3 className="text-lg font-bold text-blue-600 mt-6 mb-4">Or Create New User</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="col-span-1 sm:col-span-1">
                                                <FormControl fullWidth>
                                                    <InputLabel>Title</InputLabel>
                                                    <Select
                                                        value={newUser.title}
                                                        onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                                                        label="Title"
                                                className="rounded-md"
                                                    >
                                                        <MenuItem value="Mr">Mr</MenuItem>
                                                        <MenuItem value="Mrs">Mrs</MenuItem>
                                                <MenuItem value="Ms">Ms</MenuItem>
                                                        <MenuItem value="Dr">Dr</MenuItem>
                                                        <MenuItem value="Baby">Baby</MenuItem>
                                                        <MenuItem value="Ven">Ven</MenuItem>
                                                    </Select>
                                                </FormControl>
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <TextField
                                                    fullWidth
                                                    label="Name"
                                                    name="name"
                                                    value={newUser.name}
                                                    onChange={handleNewUserChange}
                                            className="rounded-md"
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <FormControl fullWidth>
                                                    <InputLabel>Gender</InputLabel>
                                                    <Select
                                                        value={newUser.gender}
                                                        onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                                                        label="Gender"
                                                className="rounded-md"
                                                    >
                                                        <MenuItem value="Male">Male</MenuItem>
                                                        <MenuItem value="Female">Female</MenuItem>
                                                        <MenuItem value="Other">Other</MenuItem>
                                                        <MenuItem value="Not Selected">Prefer not to say</MenuItem>
                                                    </Select>
                                                </FormControl>
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <TextField
                                                    fullWidth
                                                    label="Phone"
                                                    name="phone"
                                                    type="number"
                                                    value={newUser.phone}
                                                    onChange={handleNewUserChange}
                                            className="rounded-md"
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={handleNewUserChange}
                                            className="rounded-md"
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <TextField
                                                    fullWidth
                                                    label="Age (Years)"
                                                    name="ageYears"
                                                    type="number"
                                                    value={newUser.age.years}
                                                    onChange={handleNewUserChange}
                                            InputProps={{ inputProps: { min: 0 }, className: "rounded-md" }}
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                                <TextField
                                                    fullWidth
                                                    label="Age (Months)"
                                                    name="ageMonths"
                                                    type="number"
                                                    value={newUser.age.months}
                                                    onChange={handleNewUserChange}
                                            InputProps={{ inputProps: { min: 0, max: 11 }, className: "rounded-md" }}
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                                <TextField
                                                    fullWidth
                                                    label="Address"
                                                    name="address"
                                                    value={newUser.address}
                                                    onChange={handleNewUserChange}
                                            className="rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Test Selection */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-blue-600 mb-4">Test Selection</h2>
                                        {loading ? (
                                    <div className="flex justify-center p-6">
                                        <CircularProgress />
                                    </div>
                                        ) : (
                                            <>
                                                <Autocomplete
                                                    options={filteredTests}
                                                    getOptionLabel={(option) => 
                                                        `${option.templateName} (${option.shortName}) - Rs. ${option.price}`
                                                    }
                                                    value={null}
                                                    onChange={handleTestSelect}
                                                    inputValue={searchTerm}
                                                    onInputChange={(event, newInputValue) => {
                                                        setSearchTerm(newInputValue);
                                                    }}
                                                    onFocus={() => setIsSearchFocused(true)}
                                                    onBlur={() => {
                                                        setTimeout(() => setIsSearchFocused(false), 200);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Search Tests"
                                                            fullWidth
                                                            margin="normal"
                                                            placeholder="Type at least 2 characters to search"
                                                            error={!!searchError}
                                                            helperText={searchError}
                                                    className="rounded-md"
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                <li key={option._id} {...props} className="p-2 hover:bg-gray-100">
                                                            {option.templateName}
                                                    <span className="text-gray-500 ml-2">
                                                                ({option.shortName}) - Rs. {option.price}
                                                    </span>
                                                        </li>
                                                    )}
                                                    loading={loading}
                                                    loadingText="Loading tests..."
                                                    noOptionsText={searchError || "No tests found"}
                                                    freeSolo={false}
                                                    clearOnBlur={false}
                                                    clearOnEscape={false}
                                                    filterOptions={(options, state) => options}
                                                    open={isSearchFocused}
                                                />

                                        <div className="mt-4 bg-white rounded-lg shadow-sm">
                                                    <Table>
                                                        <TableHead>
                                                    <TableRow className="bg-blue-600">
                                                        <TableCell className="font-bold text-white">Test Name</TableCell>
                                                        <TableCell className="font-bold text-white">Short Name</TableCell>
                                                        <TableCell className="font-bold text-white">Price</TableCell>
                                                        <TableCell className="font-bold text-white">Action</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedTests.map(test => (
                                                        <TableRow key={test._id} className="hover:bg-gray-50">
                                                                    <TableCell>{test.templateName}</TableCell>
                                                                    <TableCell>{test.shortName}</TableCell>
                                                                    <TableCell>Rs. {test.price}</TableCell>
                                                                    <TableCell>
                                                                <IconButton 
                                                                    onClick={() => handleRemoveTest(test._id)}
                                                                    className="text-red-500 hover:bg-red-50"
                                                                >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                        </div>
                                            </>
                                        )}
                            </div>

                            {/* Invoice Details */}
                            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-blue-600 mb-4">Invoice Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                                <FormControl fullWidth>
                                                    <InputLabel>Payment Type</InputLabel>
                                                    <Select
                                                        value={formData.paymentType}
                                                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                                        label="Payment Type"
                                                className="rounded-md"
                                                    >
                                                        <MenuItem value="Cash">Cash</MenuItem>
                                                        <MenuItem value="Card">Card</MenuItem>
                                                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                                        <MenuItem value="Online Payment">Online Payment</MenuItem>
                                                    </Select>
                                                </FormControl>
                                    </div>
                                    <div className="flex items-center">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.isFullPayment}
                                                            onChange={handleFullPaymentChange}
                                                            color="primary"
                                                        />
                                                    }
                                                    label="Full Payment"
                                                />
                                    </div>
                                    <div>
                                                <TextField
                                                    fullWidth
                                                    label="Paying Amount"
                                                    name="payingAmount"
                                                    type="number"
                                                    value={formData.payingAmount}
                                                    onChange={(e) => {
                                                        const payingAmount = parseFloat(e.target.value) || 0;
                                                        const totalAmount = calculateTotal();
                                                        setFormData({
                                                            ...formData,
                                                            payingAmount,
                                                            dueAmount: totalAmount - payingAmount,
                                                            isFullPayment: payingAmount === totalAmount
                                                        });
                                                    }}
                                                    disabled={formData.isFullPayment}
                                                    InputProps={{ inputProps: { min: 0, max: calculateTotal() } }}
                                            className="rounded-md"
                                                />
                                    </div>
                                    <div>
                                                <TextField
                                                    fullWidth
                                                    label="Due Amount"
                                                    name="dueAmount"
                                                    type="number"
                                                    value={formData.dueAmount}
                                                    disabled
                                            className="rounded-md"
                                                />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Notes"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Total and Submit */}
                            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-blue-600 mb-4">
                                            Total Amount: Rs. {calculateTotal()}
                                </h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                startIcon={<AddIcon />}
                                                fullWidth
                                        className="rounded-md normal-case font-bold"
                                            >
                                                {formData.paymentType === 'Card' ? 'Pay with Card' : 'Create Invoice'}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleDownloadPDF}
                                                startIcon={<DownloadIcon />}
                                                disabled={!formData.userId || selectedTests.length === 0}
                                        className="rounded-md normal-case font-bold"
                                            >
                                                Download PDF
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={handlePrintInvoice}
                                                startIcon={<PrintIcon />}
                                                disabled={!formData.userId || selectedTests.length === 0}
                                        className="rounded-md normal-case font-bold"
                                            >
                                                Print
                                            </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Process Payment</h2>
                        <PaymentForm
                            amount={calculateTotal()}
                            invoiceId={createdInvoiceId}
                            onSuccess={handlePaymentSuccess}
                            onFailure={handlePaymentFailure}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInvoice; 