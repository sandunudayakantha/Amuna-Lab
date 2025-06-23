import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { evaluate } from "mathjs";

const CreateReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [template, setTemplate] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [comment, setComment] = useState("");
  const [completeStatus, setCompleteStatus] = useState(false);
  const [repeatStatus, setRepeatStatus] = useState(false);
  const [outSideStatus, setOutSideStatus] = useState(false);
  const [error, setError] = useState("");
  const variablesRef = useRef({});

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get('invoiceId');
  const patientId = searchParams.get('patientId');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/testTemplates/${id}`);
        setTemplate(response.data);
        initializeTestResults(response.data.tests);
      } catch (err) {
        setError("Failed to fetch test template");
        console.error(err);
      }
    };

    fetchTemplate();
  }, [id]);

  const initializeTestResults = (tests) => {
    const initialResults = tests.map((test) => ({
      testName: test.testName,
      result: "",
      unit: test.unit,
      normalRange: test.normalRange,
      inputType: test.inputType,
      options: test.options,
      formula: test.formula,
      variable: test.variable,
    }));
    setTestResults(initialResults);
  };

  const handleInputChange = (index, value) => {
    const updatedResults = [...testResults];
    let parsedValue = parseFloat(value) || 0;

    if (!isNaN(parsedValue)) {
      parsedValue = parseFloat(parsedValue.toFixed(1)); // Round to two decimal places
    }

    updatedResults[index].result = parsedValue;

    if (updatedResults[index].variable) {
      variablesRef.current[updatedResults[index].variable] = parsedValue;
    }

    setTestResults(updatedResults);
    evaluateFormulas(updatedResults);
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  const evaluateFormulas = (results) => {
    const updatedResults = [...results];
    const updatedVariables = { ...variablesRef.current };

    const dependencyGraph = buildDependencyGraph(updatedResults);

    dependencyGraph.forEach((testIndex) => {
      const test = updatedResults[testIndex];
      if (test.formula) {
        try {
          let result = evaluate(test.formula, updatedVariables);
          result = parseFloat(result.toFixed(1)); // Round to two decimal places
          updatedResults[testIndex].result = result.toString();

          if (test.variable) {
            updatedVariables[test.variable] = result;
          }
        } catch (err) {
          console.error("Error evaluating formula:", err);
        }
      }
    });

    setTestResults(updatedResults);
    variablesRef.current = updatedVariables;
  };

  const buildDependencyGraph = (results) => {
    const graph = [];
    const visited = new Set();

    const visit = (index) => {
      if (visited.has(index)) return;
      visited.add(index);

      const test = results[index];
      if (test.formula) {
        const dependencies = results
          .map((t, i) => (t.variable && test.formula.includes(t.variable) ? i : -1))
          .filter((i) => i !== -1);

        dependencies.forEach((depIndex) => visit(depIndex));
      }

      graph.push(index);
    };

    results.forEach((_, index) => visit(index));

    return graph;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Invoice ID from URL:", invoiceId);
      console.log("Patient ID from URL:", patientId);
      
      if (!invoiceId) {
        setError("Invoice ID is missing. Please try again.");
        return;
      }

      if (!patientId) {
        setError("Patient ID is missing. Please try again.");
        return;
      }

      const testReportData = {
        patientId,
        invoiceId,
        templateId: id,
        comment,
        completeStatus: true,
        repeatStatus,
        outSideStatus,
        testResults,
      };

      console.log("Submitting test report data:", testReportData);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/testReports`, testReportData);
      alert("Test report saved successfully!");
      navigate("/allreports");
    } catch (err) {
      setError("Failed to save test report");
      console.error(err);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Enter Test Results</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Test: {template.templateName}</h2>

        <div className="space-y-2">
          <label className="block font-semibold">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter additional notes"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">Status</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" checked={completeStatus} onChange={(e) => setCompleteStatus(e.target.checked)} className="mr-2" disabled />
              Complete Status
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={repeatStatus} onChange={(e) => setRepeatStatus(e.target.checked)} className="mr-2" />
              Repeat Status
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={outSideStatus} onChange={(e) => setOutSideStatus(e.target.checked)} className="mr-2" />
              Outside Status
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {testResults.map((test, index) => (
            <div key={index} className="p-4 border rounded-xl border-black bg-white">
              <label className="block font-semibold">
                {test.testName} ({test.unit}):
              </label>
              {test.inputType === "select" ? (
                <select value={test.result} onChange={(e) => handleInputChange(index, e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select</option>
                  {test.options.map((option, i) => (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={test.inputType}
                  value={test.result}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onWheel={handleWheel}
                  className="w-full p-2 border rounded"
                />
              )}
              <span className="text-gray-600">Normal Range: {test.normalRange}</span>
              {test.formula && <span className="text-sm text-gray-500">Formula: {test.formula}</span>}
            </div>
          ))}
        </div>

        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl mx-auto block">
  Save Test Report
</button>

      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default CreateReport;
