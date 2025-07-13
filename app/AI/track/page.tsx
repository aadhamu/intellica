'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';

// Register Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend);

type FinancialSummary = {
  Status: "Sales" | "Loss";
  Amount: number;
  Insight: string;
};

type BusinessPlanResponse = {
  title: string;
  Businessactivities: string;
  Expenditure: string;
  Sales: string;
  Timeline: string;
  FinancialSummary: FinancialSummary;
  id?: string;
  created_at?: string;
} | null;

type FormData = {
  Businessactivities: string;
  Expenditure: string;
  Sales: string;
  Timeline: string;
};

function FinancialPieChart({ expenditure, sales }: { expenditure: number; sales: number }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<'pie'> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const isProfit = sales > expenditure;

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Expenditure', 'Sales'],
        datasets: [{
          data: [expenditure, sales],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            isProfit ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            isProfit ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenditure, sales]);

  return (
    <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
      <canvas 
        ref={chartRef} 
        style={{ display: 'block', height: '100%', width: '100%' }}
      />
    </div>
  );
}

export default function BusinessPlanPage() {
  const [formData, setFormData] = useState<FormData>({
    Businessactivities: '',
    Expenditure: '',
    Sales: '',
    Timeline: ''
  });

  const [response, setResponse] = useState<BusinessPlanResponse | string>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePrompt = (): string => {
    return `You are SmartStart AI, a virtual business consultant specializing in financial analysis for small and growing businesses.

Based on the data provided, determine whether the business is operating at a Sales or a LOSS. Calculate the exact difference between Sales and Expenditure and include a brief analysis.

Respond in STRICT JSON format with the following exact structure:

{
  "Businessactivities": "...",
  "Expenditure": "...",
  "Sales": "...",
  "Timeline": "...",
  "FinancialSummary": {
    "Status": "Sales" or "Loss",
    "Amount": "Numeric value of (Sales - Expenditure)",
    "Insight": "One or two lines summarizing the financial standing and what it means"
  }
}

Input:
- Businessactivities: ${formData.Businessactivities}
- Expenditure: ${formData.Expenditure}
- Sales: ${formData.Sales}
- Timeline: ${formData.Timeline}

Be concise, professional, and only return valid JSON matching the above structure.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    
    try {
      const prompt = generatePrompt();
      const res = await axios.post('/api/gemini', { prompt });
      
      const raw = res.data?.content || res.data?.response || res.data;
      
      let planResponse: BusinessPlanResponse;
      
      try {
        planResponse = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (parseError) {
        planResponse = {
          title: `${formData.Businessactivities} Business Plan`,
          Businessactivities: formData.Businessactivities,
          Expenditure: formData.Expenditure,
          Sales: formData.Sales,
          Timeline: formData.Timeline,
          FinancialSummary: {
            Status: parseFloat(formData.Sales) > parseFloat(formData.Expenditure) ? "Sales" : "Loss",
            Amount: parseFloat(formData.Sales) - parseFloat(formData.Expenditure),
            Insight: "Financial analysis could not be generated. Please review your inputs."
          }
        };
      }

      setResponse(planResponse);
      
      try {
        await saveToDatabase(planResponse);
      } catch (saveError) {
        console.error('Save failed:', saveError);
      }

    } catch (error) {
      console.error('Error:', error);
      setResponse(
        axios.isAxiosError(error)
          ? `Error: ${error.response?.data?.error || error.message}`
          : 'Failed to generate business plan'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const modal = document.getElementById('responseModal');
    if (!modal) return;

    const handleShow = () => setModalVisible(true);
    const handleHide = () => setModalVisible(false);

    modal.addEventListener('shown.bs.modal', handleShow);
    modal.addEventListener('hidden.bs.modal', handleHide);

    return () => {
      modal.removeEventListener('shown.bs.modal', handleShow);
      modal.removeEventListener('hidden.bs.modal', handleHide);
    };
  }, []);

  const saveToDatabase = async (planResponse: BusinessPlanResponse): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Not authenticated - Please log in to save your data');
    }

    if (!planResponse || typeof planResponse === 'string') {
        console.error('Invalid plan response:', planResponse);
        throw new Error('Invalid data format - Cannot save to database');
    }

    try {
        const payload = {
            title: planResponse.title || 'Untitled Business Plan',
            Businessactivities: planResponse.Businessactivities || '',
            Expenditure: planResponse.Expenditure || '0',
            Sales: planResponse.Sales || '0',
            Timeline: planResponse.Timeline || '',
            FinancialSummary: planResponse.FinancialSummary || {
                Status: "Loss",
                Amount: 0,
                Insight: "No financial analysis available"
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('http://localhost:8000/api/save-tracker', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData: any;
            try {
                errorData = await response.json();
            } catch (parseError) {
                throw new Error(`Save failed with status ${response.status}`);
            }
            
            throw new Error(
                errorData.message || 
                errorData.error || 
                `Server responded with status ${response.status}`
            );
        }

        const savedData = await response.json();
        console.log('Successfully saved:', savedData);
        return savedData;

    } catch (error) {
        console.error('Save operation failed:', error);
        
        let errorMessage = 'Failed to save business plan';
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out - Please try again';
            } else {
                errorMessage = error.message;
            }
        }

        throw new Error(errorMessage);
    }
  };

  const downloadAsWord = async () => {
    if (!response || typeof response === 'string') return;

    setSaving(true);

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Business Financial Report",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: `Prepared on: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "Financial Summary", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(`Status: ${response.FinancialSummary.Status}`),
            new Paragraph(`Amount: $${response.FinancialSummary.Amount.toFixed(2)}`),
            new Paragraph(`Insight: ${response.FinancialSummary.Insight}`),
            new Paragraph({ text: "Details", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(`Business Activities: ${response.Businessactivities}`),
            new Paragraph(`Expenditure: $${parseFloat(response.Expenditure).toFixed(2)}`),
            new Paragraph(`Sales: $${parseFloat(response.Sales).toFixed(2)}`),
            new Paragraph(`Business Timeline: ${response.Timeline}`)
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Business_Financial_Report_${new Date().getTime()}.docx`);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      Businessactivities: '',
      Expenditure: '',
      Sales: '',
      Timeline: ''
    });
    setResponse(null);
  };

  const renderResponse = () => {
    if (typeof response === 'string') {
      return (
        <div className="alert alert-danger p-3 rounded">
          <p className="mb-0">{response}</p>
        </div>
      );
    }
    
    if (!response) {
      return (
        <div className="alert alert-info p-3 rounded">
          <p className="mb-0">No business plan generated yet.</p>
        </div>
      );
    }

    return (
      <div className="business-plan-container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary mb-0 fw-bold">
            {response.title || 'Business Financial Report'}
          </h3>
          <button 
            onClick={downloadAsWord}
            className="btn btn-success btn-sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Download DOCX'}
          </button>
        </div>

        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Financial Summary</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <FinancialPieChart 
                  expenditure={parseFloat(response.Expenditure) || 0} 
                  sales={parseFloat(response.Sales) || 0} 
                />
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-column h-100 justify-content-center">
                  <h4 className={`text-${response.FinancialSummary.Status === 'Sales' ? 'success' : 'danger'}`}>
                    {response.FinancialSummary.Status}: ${Math.abs(response.FinancialSummary.Amount).toFixed(2)}
                  </h4>
                  <p className="lead">{response.FinancialSummary.Insight}</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Total Revenue
                      <span className="badge bg-success rounded-pill">
                        ${parseFloat(response.Sales).toFixed(2)}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Total Expenses
                      <span className="badge bg-danger rounded-pill">
                        ${parseFloat(response.Expenditure).toFixed(2)}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Net Result
                      <span className={`badge bg-${response.FinancialSummary.Status === 'Sales' ? 'success' : 'danger'} rounded-pill`}>
                        ${response.FinancialSummary.Amount.toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Business Details</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Business Activities:</strong> {response.Businessactivities}</p>
                <p><strong>Business Timeline:</strong> {response.Timeline}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Expenditure:</strong> ${parseFloat(response.Expenditure).toFixed(2)}</p>
                <p><strong>Sales:</strong> ${parseFloat(response.Sales).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">Business Financial Tracker</h2>
              <small>Track and analyze your business finances</small>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Business Activities</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Businessactivities"
                    placeholder="e.g. manufacturing, retail, services"
                    value={formData.Businessactivities}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Expenditure ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="Expenditure"
                      placeholder="Total expenses"
                      value={formData.Expenditure}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sales ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="Sales"
                      placeholder="Total revenue"
                      value={formData.Sales}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Business Timeline</label>
                  <input
                    type="text"
                    className="form-control"
                    name="Timeline"
                    placeholder="one year, six months, etc."
                    value={formData.Timeline}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    data-bs-toggle="modal"
                    data-bs-target="#responseModal"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        Analyzing Finances...
                      </>
                    ) : 'Generate Financial Report'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="responseModal" tabIndex={-1} aria-labelledby="responseModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className="modal-header bg-primary text-white rounded-top-4 py-3">
              <h5 className="modal-title fs-4 fw-bold" id="responseModalLabel">
                Financial Analysis Report
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white m-0" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              {loading ? (
                <div className="text-center py-5 my-5">
                  <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5 className="mt-4 text-primary">Analyzing Your Finances</h5>
                  <p className="text-muted">Generating your financial report...</p>
                </div>
              ) : renderResponse()}
            </div>

            <div className="modal-footer bg-light rounded-bottom-4 border-top-0">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {response && typeof response !== 'string' && (
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4"
                  onClick={downloadAsWord}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Preparing Download...
                    </>
                  ) : (
                    'Download Full Report'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}