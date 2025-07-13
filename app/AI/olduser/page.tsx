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
  Address_the_suitation: string;
  Suggest_a_bunch_of_solutions: string;
  Review_best_option_to_solve_issue_and_why: string;
  Give_a_step_by_step_guide_to_carry_out_the_solution: string;
  Best_way_to_improve_business_with_business_properties: string;
 
  id?: string;
  created_at?: string;
} | null;

type FormData = {
  Businessactivities: any;
  businesssproblem: string;
  Businessopen: string;
  Target_audience: string;
  Testedsolutions: string;
  businessGoals: string;
  propertiesofbusiness: string;
};

export default function BusinessPlanPage() {
  const [formData, setFormData] = useState<FormData>({
    Businessactivities: '',
    businesssproblem: '',
    Businessopen: '',
    Target_audience: '',
    Testedsolutions: '',
    businessGoals: '',
    propertiesofbusiness: ''
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
    return `You are SmartStart AI, a top-tier virtual business consultant trained in entrepreneurship, world wide markets, and lean startup strategy. Check currtent trends and local market conditions to provide a comprehensive business plan for a new startup. check currnt pricing and local market conditions to provide a comprehensive business plan for a new startup. the curreny sholud be determined by the Businessopen of the business get prices and currency from location provided.
    
    Generate a professional business plan in STRICT JSON FORMAT with the following EXACT structure:
    
    {
      "title"
      "Address_the_suitation": "Compelling overview (1000 words)",
      "Suggest_a_bunch_of_solutions": "A detailed list of  different solutions to the problem",
      "Review_best_option_to_solve_issue_and_why": "Pick the best solution and explain why",
      "Give_a_step_by_step_guide_to_carry_out_the_solution": "Chronological steps to get the best results",
      "Best_way_to_improve_business_with_business_properties": "Concrete marketing ideas tailored to the business",
     
    }

    Business Details:
    - Type: ${formData.businesssproblem}
    - Businessactivities: ${formData.Businessactivities}
    - Target Audience: ${formData.Target_audience}
    - Testedsolutions: ${formData.Testedsolutions}
    - Goals: ${formData.businessGoals}
    - Businessproperties: ${formData.propertiesofbusiness || 'Not specified'}

    Provide detailed, locally relevant information in a professional tone suitable for investors. 
    Only respond with valid JSON format.`;
  };

  // Update your handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setResponse(null); // Reset previous response
  
  try {
      const prompt = generatePrompt();
      const res = await axios.post('/api/gemini', { prompt });
      
      const raw = res.data?.content || res.data?.response || res.data;
      
      let planResponse: BusinessPlanResponse;
      
    // Handle both string and object responses
    
      try {
         planResponse = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (parseError) {
        // If parsing fails, use the raw response as executive summary
        planResponse = {
          title: `${formData.businesssproblem} Business Plan`,
          Address_the_suitation: res.data.response,
          Suggest_a_bunch_of_solutions: '',
            Review_best_option_to_solve_issue_and_why: '',
          Give_a_step_by_step_guide_to_carry_out_the_solution: '',
          Best_way_to_improve_business_with_business_properties: '',
         
        };
    }

    console.log('Response:', planResponse);

    // Update state with the response
    setResponse(planResponse);
    
    // Try saving to database
    try {
      await saveToDatabase(planResponse);
    } catch (saveError) {
      console.error('Save failed:', saveError);
      // Optionally show a save error message without overriding the plan
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

// Helper function to clean JSON strings
const cleanJsonResponse = (jsonString: string): string => {
  // Remove any text before the first {
  const firstBrace = jsonString.indexOf('{');
  if (firstBrace > 0) {
    jsonString = jsonString.substring(firstBrace);
  }

  // Remove any text after the last }
  const lastBrace = jsonString.lastIndexOf('}');
  if (lastBrace < jsonString.length - 1) {
    jsonString = jsonString.substring(0, lastBrace + 1);
  }

  // Fix common JSON issues
  return jsonString
    .replace(/(\w+):/g, '"$1":') // Add quotes around keys
    .replace(/'/g, '"') // Replace single quotes with double quotes
    .replace(/\\"/g, '"') // Remove escaped quotes
    .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
};

// Helper function to extract JSON from a string
const extractJsonFromString = (str: string): BusinessPlanResponse | null => {
  try {
    // First try to find JSON within markdown code blocks
    const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const cleaned = cleanJsonResponse(codeBlockMatch[1]);
      return JSON.parse(cleaned);
    }

    // Then try to find the first valid JSON object
    const jsonMatch = str.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const cleaned = cleanJsonResponse(jsonMatch[0]);
      return JSON.parse(cleaned);
    }

    return null;
  } catch (e) {
    return null;
  }
};

 const saveToDatabase = async (planResponse: BusinessPlanResponse) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  if (!planResponse || typeof planResponse === 'string') return;

  try {
    // Prepare payload with proper type handling
    const payload = {
      title: planResponse.title || '',
      Address_the_suitation: planResponse.Address_the_suitation || '',

      Suggest_a_bunch_of_solutions: 
        typeof planResponse.Suggest_a_bunch_of_solutions === 'string' 
          ? planResponse.Suggest_a_bunch_of_solutions
          : JSON.stringify(planResponse.Suggest_a_bunch_of_solutions || []),

      Give_a_step_by_step_guide_to_carry_out_the_solution: 
        planResponse.Give_a_step_by_step_guide_to_carry_out_the_solution || '',

      Review_best_option_to_solve_issue_and_why:
        planResponse.Review_best_option_to_solve_issue_and_why || '',

      Best_way_to_improve_business_with_business_properties: 
        planResponse.Best_way_to_improve_business_with_business_properties || '',
    };

    const response = await fetch('http://localhost:8000/api/save-con', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    // Add better error handling
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error details:', errorData);
      throw new Error(errorData.message || 'Save failed with status ' + response.status);
    }

    return await response.json();
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};
  const downloadAsWord = async () => {
  if (!response || typeof response === 'string') return;

  setSaving(true);

  try {
    // Create numbered lists for action items
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
            new TextRun({
              text: `${index + 1}. `,
              bold: true
            }),
            new TextRun(item.trim())
          ],
          spacing: { after: 50 }
        })
      );
    };

    // Create the document with question-focused structure
    const doc = new Document({
      styles: {
        paragraphStyles: [{
          id: "Normal",
          name: "Normal",
          run: {
            size: 24, // 12pt
            font: "Calibri"
          },
          paragraph: {
            spacing: { 
              line: 240, // Single line spacing
              before: 100,
              after: 100
            }
          }
        }]
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,  // 0.5 inch
              bottom: 720, // 0.5 inch
              left: 720    // 0.5 inch
            }
          }
        },
        children: [
          // Title page
          new Paragraph({
            text: "Business Consultation Report",
            heading: HeadingLevel.TITLE,
            spacing: { before: 800, after: 400 },
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `Prepared on: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }
          }),

          // Client Information section
          new Paragraph({
            text: "Client Information",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // Display each form question and answer
          new Paragraph({
            children: [
              new TextRun({
                text: "1. What's the main business problem?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.businesssproblem,
                break: 1
              })
            ],
            spacing: { after: 150 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "2. When did the business start?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.Businessopen,
                break: 1
              })
            ],
            spacing: { after: 150 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "3. What solutions have been tried?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.Testedsolutions,
                break: 1
              })
            ],
            spacing: { after: 150 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "4. Who are the target customers?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.Target_audience,
                break: 1
              })
            ],
            spacing: { after: 150 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "5. What are the business goals?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.businessGoals,
                break: 1
              })
            ],
            spacing: { after: 150 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "6. What resources does the business have?",
                bold: true
              }),
              new TextRun({
                text: "\n" + formData.propertiesofbusiness,
                break: 1
              })
            ],
            spacing: { after: 200 }
          }),

          // Expert Analysis section
          new Paragraph({
            text: "Expert Analysis & Recommendations",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // Process the AI response sections
          ...Object.entries(response)
            .filter(([key]) => !['title', 'id', 'created_at'].includes(key))
            .flatMap(([key, value]) => {
              const sectionTitle = key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');

              const content = [];
              
              // Add section title
              content.push(
                new Paragraph({
                  text: sectionTitle,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 }
                })
              );

              // Format content based on section type
              if (key === 'executive_summary') {
                if (typeof value === 'string') {
                  const paragraphs = value.split('\n\n');
                  paragraphs.forEach((para, index) => {
                    if (para.trim()) {
                      content.push(
                        new Paragraph({
                          text: para.trim(),
                          spacing: { after: 100 },
                          ...(index === 0 && { bold: true })
                        })
                      );
                    }
                  });
                } else {
                  content.push(...createNumberedList(value));
                }
              } 
              else if (key === 'things_needed_to_start' || key === 'setup_checklist') {
                content.push(...createNumberedList(value));
              }
              else {
                if (typeof value === 'string') {
                  const paragraphs = value.split('\n\n');
                  paragraphs.forEach(para => {
                    if (para.trim()) {
                      content.push(
                        new Paragraph({
                          text: para.trim(),
                          spacing: { after: 100 }
                        })
                      );
                    }
                  });
                } else {
                  content.push(...createNumberedList(value));
                }
              }

              return content;
            }),

          // Footer
          new Paragraph({
            text: " ",
            pageBreakBefore: true
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "For further assistance, please contact our business consultants",
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 }
          })
        ]
      }]
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Business_Consultation_${formData.businesssproblem.replace(/\s+/g, '_')}.docx`);

  } catch (error) {
    console.error('Error generating document:', error);
  } finally {
    setSaving(false);
  }
};

  const handleReset = () => {
    setFormData({
      Businessactivities: '',
      businesssproblem: '',
      Businessopen: '',
      Target_audience: '',
      Testedsolutions: '',
      businessGoals: '',
      propertiesofbusiness: ''
    });
    setResponse(null);
  };

  

  // Helper function to format content with proper spacing and lists
 

  // Helper function to format content as lists when appropriate
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

  // Helper function to safely render content (handles strings, arrays, and objects)
  const renderContent = (content: any, key: string) => {
    if (content === null || content === undefined) {
      return <p className="text-muted">No content available.</p>;
    }

    // Handle strings (split by newlines)
    if (typeof content === 'string') {
      return content.split('\n').map((para, i) => (
        <p key={i} className="mb-3">{para}</p>
      ));
    }

    // Handle arrays (render as a list)
    if (Array.isArray(content)) {
      return (
        <ul className="list-group mb-3">
          {content.map((item, index) => (
            <li key={index} className="list-group-item border-0 ps-0 py-1 bg-transparent">
              {typeof item === 'object' ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    // Handle objects (convert to key-value pairs)
    if (typeof content === 'object') {
      return (
        <div className="mb-3">
          {Object.entries(content).map(([subKey, value]) => (
            <div key={subKey} className="mb-2">
              <strong>{subKey}:</strong> {value === undefined || value === null ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
            </div>
          ))}
        </div>
      );
    }

    // Fallback for other types (numbers, booleans, etc.)
    return <p className="mb-3">{String(content)}</p>;
  };

  return (
    <div className="business-plan-container mt-5">
      {/* Header and download button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary mb-0 fw-bold">
          {response.title || 'Business Consultation Report'}
        </h3>
        <button 
          onClick={downloadAsWord}
          className="btn btn-success btn-sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Download DOCX'}
        </button>
      </div>

      {/* Client information section */}
      <div className="mb-4 p-3 bg-light rounded">
        <h5 className="text-muted mb-3">Client Information</h5>
        <ul className="list-group">
          <li className="list-group-item bg-transparent border-0 ps-0 py-1">
            <strong>Business Problem:</strong> {formData.businesssproblem}
          </li>
          <li className="list-group-item bg-transparent border-0 ps-0 py-1">
            <strong>Business Open:</strong> {formData.Businessopen}
          </li>
          <li className="list-group-item bg-transparent border-0 ps-0 py-1">
            <strong>Target Audience:</strong> {formData.Target_audience}
          </li>
          <li className="list-group-item bg-transparent border-0 ps-0 py-1">
            <strong>Business Goals:</strong> {formData.businessGoals}
          </li>
        </ul>
      </div>

      {/* Plan sections */}
      <div className="plan-sections">
        {Object.entries(response)
          .filter(([key]) => !['title', 'id', 'created_at'].includes(key))
          .map(([key, value]) => (
            <div key={key} className="plan-section mb-4 p-3 border rounded">
              <h5 className="section-title text-success mb-3 fw-bold">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h5>
              <div className="section-content">
                {renderContent(value, key)}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">Business Expert Consultant</h2>
              <small>Get expert consultation to ypur business problems</small>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Business Problem</label>
                  <input
                    type="text"
                    className="form-control"
                    name="businesssproblem"
                    placeholder="e.g. losing money, Not enough costumers etc."
                    value={formData.businesssproblem}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-bold">Business Activities</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Businessopen"
                      placeholder="Activities of the business"
                      value={formData.Businessopen}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tested solutions </label>
                    <input
                      type="text"
                      className="form-control"
                      name="Testedsolutions"
                      placeholder="What solutions have you tried? "
                      value={formData.Testedsolutions}
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
                  <label className="form-label"> What does your business own </label>
                  <input
                    type="text"
                    className="form-control"
                    name="propertiesofbusiness"
                    placeholder="100 computers, 50 chairs, etc."
                    value={formData.propertiesofbusiness}
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

      {/* Modal for AI Response */}
      {/* Modal for AI Response */}
 <div
  className="modal fade"
  id="responseModal"
  tabIndex={-1}
  aria-labelledby="responseModalLabel"
  aria-hidden="true"
 >
  <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div className="modal-content rounded-4 shadow-lg border-0">
      <div className="modal-header bg-primary text-white rounded-top-4 py-3">
        <h5 className="modal-title fs-4 fw-bold" id="responseModalLabel">
          <i className="bi bi-lightbulb me-2"></i>
          Business Consultation Report
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
            <h5 className="mt-4 text-primary">Generating Your Business Plan</h5>
            <p className="text-muted">Our AI is analyzing your business details...</p>
          </div>
        ) : renderResponse()}
      </div>

      <div className="modal-footer bg-light rounded-bottom-4 border-top-0">
        <button
          type="button"
          className="btn btn-outline-secondary rounded-pill px-4"
          data-bs-dismiss="modal"
        >
          <i className="bi bi-x-lg me-2"></i>
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
              <>
                <i className="bi bi-download me-2"></i>
                Download Full Report
              </>
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
