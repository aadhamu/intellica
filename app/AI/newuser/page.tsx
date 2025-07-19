'use client';
import { useState } from 'react';
import axios from 'axios';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Table
} from 'docx';
import { saveAs } from 'file-saver';

type BusinessPlanResponse = {
  title: string;
  executive_summary: string;
  things_needed_to_start: string;
  market_analysis: string;
  marketing_strategy: string;
  financial_plan: string;
  operations_plan: string;
  setup_checklist?: string;
  pricing_strategy?: string;
  growth_ideas?: string;
  id?: string;
  created_at?: string;
} | null;

type FormData = {
  businesstype: string;
  location: string;
  Target_audience: string;
  capital: string;
  businessGoals: string;
  preferred_timeline: string;
};

export default function BusinessPlanPage() {
  const [formData, setFormData] = useState<FormData>({
    businesstype: '',
    location: '',
    Target_audience: '',
    capital: '',
    businessGoals: '',
    preferred_timeline: ''
  });

  const [response, setResponse] = useState<BusinessPlanResponse | string>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePrompt = (): string => {
    return `You are SmartStart AI — a world-class virtual business consultant trained in global markets, startup strategy, and localized economic trends.

Based on the user's business type, location, and funding, generate a complete professional business plan in  with this exact structure:

{
  "title": "Business name and type",
  "executive_summary": "Overview (around 1000 words)",
  "things_needed_to_start": "Itemized list with estimated prices based on the capital ${formData.capital} and local rates",
  "setup_checklist": "Chronological setup steps",
  "market_analysis": "Local demand and competition analysis",
  "marketing_strategy": "Tailored marketing ideas for this location",
  "pricing_strategy": "Local pricing tiers based on current trends",
  "financial_plan": "Revenue goals and expense breakdown",
  "operations_plan": "Daily operations and staffing",
  "growth_ideas": "Scalable strategies and expansion ideas"
}

User's business input:
- Type: ${formData.businesstype}
- Location: ${formData.location}
- Target Audience: ${formData.Target_audience}
- Capital: ${formData.capital}
- Goals: ${formData.businessGoals}
- Timeline: ${formData.preferred_timeline || 'Not specified'}

Respond ONLY with a clean, valid JSON object matching the structure above. Do not include explanations or extra text.`;
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
        console.warn('JSON parse failed, falling back:', parseError);

        planResponse = {
          title: `${formData.businesstype} Business Plan`,
          executive_summary: raw || 'No content received',
          things_needed_to_start: '',
          setup_checklist: '',
          market_analysis: '',
          marketing_strategy: '',
          pricing_strategy: '',
          financial_plan: '',
          operations_plan: '',
          growth_ideas: ''
        };
      }

      // Set business plan state
      setResponse(planResponse);

      // Save to localStorage as fallback
      try {
        const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
        plans.push({
          ...planResponse,
          formData,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('savedPlans', JSON.stringify(plans));
      } catch (saveError) {
        console.error('Failed to save to localStorage:', saveError);
      }

    } catch (error) {
      console.error('AI or network error:', error);
      setResponse(
        axios.isAxiosError(error)
          ? `Error: ${error.response?.data?.error || error.message}`
          : 'Failed to generate business plan'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadAsWord = async () => {
    if (!response || typeof response === 'string') return;

    setSaving(true);

    try {
      const createNumberedList = (items: string | string[] | object) => {
        if (!items) return [];

        let itemArray: string[] = [];
        if (typeof items === 'string') {
          itemArray = items.split('\n').filter(item => item.trim() !== '');
        } else if (Array.isArray(items)) {
          itemArray = items;
        } else if (typeof items === 'object') {
          itemArray = Object.entries(items).map(([key, value]) => 
            `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
          );
        }

        return itemArray.map((item, index) => 
          new Paragraph({
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true }),
              new TextRun(item.trim())
            ],
            spacing: { after: 100 }
          })
        );
      };

      const createBulletList = (items: string | string[] | object) => {
        if (!items) return [];

        let itemArray: string[] = [];
        if (typeof items === 'string') {
          itemArray = items.split('\n').filter(item => item.trim() !== '');
        } else if (Array.isArray(items)) {
          itemArray = items;
        } else if (typeof items === 'object') {
          itemArray = Object.entries(items).map(([key, value]) => 
            `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
          );
        }

        return itemArray.map(item => 
          new Paragraph({
            children: [
              new TextRun({ text: '• ', bold: true }),
              new TextRun(item.trim())
            ],
            spacing: { after: 100 }
          })
        );
      };

      const createFinancialTables = (financialData: any) => {
        if (!financialData) return [];

        if (typeof financialData === 'string') {
          return [
            new Paragraph({ text: financialData, spacing: { after: 100 } })
          ];
        }

        const tables = [];
        for (const [sectionName, sectionData] of Object.entries(financialData)) {
          if (!sectionData) continue;

          tables.push(
            new Paragraph({
              text: sectionName.replace(/_/g, ' ').toUpperCase(),
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 100 }
            })
          );

          if (typeof sectionData === 'object') {
            const rows = Object.entries(sectionData).map(([key, value]) => (
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(key)],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph(String(value))],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ));

            tables.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph('Item')],
                        shading: { fill: 'DDDDDD' }
                      }),
                      new TableCell({
                        children: [new Paragraph('Value')],
                        shading: { fill: 'DDDDDD' }
                      })
                    ]
                  }),
                  ...rows
                ]
              })
            );
          } else {
            tables.push(
              new Paragraph({ text: String(sectionData), spacing: { after: 100 } })
            );
          }
        }

        return tables;
      };

      const sections = Object.entries(response)
        .filter(([key]) => !['title', 'id', 'created_at'].includes(key))
        .flatMap(([key, value]) => {
          const sectionTitle = key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');

          const content = [];

          content.push(
            new Paragraph({
              text: sectionTitle,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            })
          );

          switch(key) {
            case 'things_needed_to_start':
            case 'setup_checklist':
            case 'pricing_strategy':
              content.push(...createNumberedList(value));
              break;

            case 'financial_plan':
              content.push(...createFinancialTables(value));
              break;

            case 'market_analysis':
            case 'marketing_strategy':
            case 'operations_plan':
            case 'growth_ideas':
              if (typeof value === 'string') {
                const paragraphs = value.split('\n\n');
                paragraphs.forEach(para => {
                  if (para.trim()) {
                    content.push(
                      new Paragraph({ text: para.trim(), spacing: { after: 100 } })
                    );
                  }
                });
              } else {
                content.push(...createBulletList(value));
              }
              break;

            default:
              if (typeof value === 'string') {
                content.push(
                  new Paragraph({ text: value, spacing: { after: 100 } })
                );
              } else {
                content.push(...createBulletList(value));
              }
          }

          return content;
        });

      const doc = new Document({
        styles: {
          paragraphStyles: [{
            id: "Normal",
            name: "Normal",
            run: {
              size: 24,
              font: "Calibri"
            },
            paragraph: {
              spacing: { line: 240 }
            }
          }]
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: [
            new Paragraph({
              text: response.title || 'Business Plan',
              heading: HeadingLevel.TITLE,
              spacing: { before: 1600, after: 800 }
            }),
            new Paragraph({
              text: `Prepared on: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 1600 }
            }),
            new Paragraph({ text: " ", pageBreakBefore: true }),

            new Paragraph({
              text: "Table of Contents",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            }),
            ...Object.keys(response)
              .filter(key => !['title', 'id', 'created_at'].includes(key))
              .map(key => 
                new Paragraph({
                  text: key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' '),
                  heading: HeadingLevel.HEADING_4,
                  spacing: { after: 100 }
                })
              ),
            new Paragraph({ text: " ", pageBreakBefore: true }),

            ...sections
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Business_Plan_${(response.title || formData.businesstype).replace(/\s+/g, '_')}.docx`);

    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      businesstype: '',
      location: '',
      Target_audience: '',
      capital: '',
      businessGoals: '',
      preferred_timeline: ''
    });
    setResponse(null);
  };

  const renderContent = (content: any, key: string) => {
  // If content is null or undefined, return empty
  if (content == null) return null;

  // Handle string content
  if (typeof content === 'string') {
    // Split by double newlines first (for paragraphs)
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, i) => (
      <p key={i} className="mb-3">
        {paragraph.split('\n').map((line, j) => (
          <span key={j}>
            {line}
            <br />
          </span>
        ))}
      </p>
    ));
  }

  // Handle array content
  if (Array.isArray(content)) {
    return (
      <ul className="list-group mb-3">
        {content.map((item, index) => (
          <li key={index} className="list-group-item border-0 ps-0 py-1 bg-transparent">
            {typeof item === 'object' ? renderObjectContent(item) : item}
          </li>
        ))}
      </ul>
    );
  }

  // Handle object content
  if (typeof content === 'object') {
    return renderObjectContent(content);
  }

  // Fallback for other types
  return <p className="mb-3">{String(content)}</p>;
};

const renderObjectContent = (obj: Record<string, any>) => {
  return (
    <ul className="list-group mb-3">
      {Object.entries(obj).map(([key, value]) => (
        <li key={key} className="list-group-item border-0 ps-0 py-1 bg-transparent">
          <strong>{formatKey(key)}:</strong> {renderValue(value)}
        </li>
      ))}
    </ul>
  );
};

const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/(?:^|\s)\S/g, match => match.toUpperCase());
};

const renderValue = (value: any) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return (
      <ul className="mt-2 mb-0 ps-3">
        {value.map((item, i) => (
          <li key={i}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') return renderObjectContent(value);
  return String(value);
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
          {response.title || 'Business Plan'}
        </h3>
        <button 
          onClick={downloadAsWord}
          className="btn btn-success btn-sm"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-word me-2"></i>
              Download DOCX
            </>
          )}
        </button>
      </div>

      {response.executive_summary && (
        <div className="plan-section mb-4 p-3 border rounded">
          <h5 className="section-title text-success mb-3 fw-bold">Executive Summary</h5>
          <div className="section-content">
            {renderContent(response.executive_summary, 'executive_summary')}
          </div>
        </div>
      )}

      {Object.entries(response)
        .filter(([key]) => !['title', 'executive_summary', 'id', 'created_at'].includes(key))
        .map(([key, value]) => (
          <div key={key} className="plan-section mb-4 p-3 border rounded">
            <h5 className="section-title text-success mb-3 fw-bold">
              {formatKey(key)}
            </h5>
            <div className="section-content">
              {renderContent(value, key)}
            </div>
          </div>
        ))}

      <style jsx>{`
        .business-plan-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        
        .plan-section {
          background-color: #fff;
          transition: all 0.3s ease;
        }
        
        .plan-section:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .section-title {
          border-bottom: 2px solid #dee2e6;
          padding-bottom: 8px;
        }
        
        .section-content {
          line-height: 1.8;
        }
        
        .section-content p {
          text-align: justify;
        }
        
        @media (max-width: 768px) {
          .business-plan-container {
            padding: 0 10px;
          }
        }
      `}</style>
    </div>
  );
};

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">Business Start-Up Consultant</h2>
              <small>Get a personalized and complete business plan</small>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Business Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="businesstype"
                    placeholder="e.g. car wash, bookstore, poultry, etc."
                    value={formData.businesstype}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      placeholder="e.g. Lagos, Nigeria"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Starting Capital ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="capital"
                      placeholder="e.g. 5000"
                      min={0}
                      value={formData.capital}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Target Audience</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Target_audience"
                      placeholder="e.g. students, adults, urban workers"
                      value={formData.Target_audience}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Business Goals</label>
                    <input
                      type="text"
                      className="form-control"
                      name="businessGoals"
                      placeholder="e.g. profit, social impact"
                      value={formData.businessGoals}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Preferred Timeline</label>
                  <input
                    type="text"
                    className="form-control"
                    name="preferred_timeline"
                    placeholder="e.g. 3 months, 6 months"
                    value={formData.preferred_timeline}
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
                        Generating Plan...
                      </>
                    ) : 'Generate Business Plan'}
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

      <div
        className="modal fade"
        id="responseModal"
        tabIndex={-1}
        aria-labelledby="responseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content rounded-4 shadow-sm">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title" id="responseModalLabel">Your Business Plan</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-3">Generating business plan...</p>
                  <p className="text-muted">This plan is AI-generated and may contain inaccuracies. Please verify details before acting on them</p>
                </div>
              ) : renderResponse()}
            </div>

            <div className="modal-footer bg-white border-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {response && typeof response !== 'string' && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={downloadAsWord}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Preparing Download...
                    </>
                  ) : 'Download as Word'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}