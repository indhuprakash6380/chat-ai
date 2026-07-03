import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Code, Mail, BookOpen, ArrowLeft, Trash2, Copy, 
  Download, Check, Upload, Plus, X, Sparkles, Clock, Edit3, Save
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function ToolsPage() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [toolOutput, setToolOutput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutput, setEditedOutput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Resume Generator Inputs
  const [resumeDetails, setResumeDetails] = useState({ name: '', email: '', phone: '', website: '' });
  const [resumeSkills, setResumeSkills] = useState('');
  const [resumeEducation, setResumeEducation] = useState([{ school: '', degree: '', year: '' }]);
  const [resumeExperience, setResumeExperience] = useState([{ company: '', role: '', duration: '', desc: '' }]);

  // Code Assistant Inputs
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeAction, setCodeAction] = useState('explain');

  // Email Writer Inputs
  const [emailType, setEmailType] = useState('job_application');
  const [emailContext, setEmailContext] = useState('');
  const [emailDesc, setEmailDesc] = useState('');

  // Notes Summarizer Inputs
  const [summaryText, setSummaryText] = useState('');
  const [summaryFile, setSummaryFile] = useState(null);
  const [summaryKeywords, setSummaryKeywords] = useState([]);

  const tools = [
    { id: "resume", title: "Resume Generator", icon: <FileText size={28}/>, desc: "Build a professional resume", color: "indigo" },
    { id: "code", title: "Code Assistant", icon: <Code size={28}/>, desc: "Debug, write, or explain code", color: "blue" },
    { id: "email", title: "Email Writer", icon: <Mail size={28}/>, desc: "Draft cold emails & replies", color: "purple" },
    { id: "summary", title: "Notes Summarizer", icon: <BookOpen size={28}/>, desc: "Summarize huge texts quickly", color: "emerald" },
  ];

  // Fetch History on load
  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/tools/history');
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleExportText = (text, defaultName = 'output.txt') => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = defaultName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePDF = (resumeText, personalDetails) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    const lines = resumeText.split('\n');
    let y = 15;

    doc.setFont('Helvetica', 'normal');
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        y += 4;
        continue;
      }
      
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }

      if (line.startsWith('# ')) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(line.substring(2), margin, y);
        y += 8;
      } else if (line.startsWith('## ')) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        y += 2;
        doc.text(line.substring(3), margin, y);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
        y += 8;
      } else if (line.startsWith('### ')) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(line.substring(4), margin, y);
        y += 6;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        const bulletText = line.substring(2);
        const wrappedText = doc.splitTextToSize(`• ${bulletText}`, contentWidth);
        doc.text(wrappedText, margin, y);
        y += (wrappedText.length * 5);
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        const cleanLine = line.replace(/\*\*/g, '');
        const wrappedText = doc.splitTextToSize(cleanLine, contentWidth);
        doc.text(wrappedText, margin, y);
        y += (wrappedText.length * 5);
      }
    }

    const filename = `${personalDetails.name ? personalDetails.name.replace(/\s+/g, '_') : 'Resume'}_CV.pdf`;
    doc.save(filename);
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/tools/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const loadHistoryItem = (item) => {
    setActiveTool(item.toolType);
    setIsEditing(false);

    if (item.toolType === 'resume') {
      setResumeDetails(item.input.personalDetails || { name: '', email: '', phone: '', website: '' });
      setResumeSkills(item.input.skills || '');
      setResumeEducation(item.input.education || [{ school: '', degree: '', year: '' }]);
      setResumeExperience(item.input.experience || [{ company: '', role: '', duration: '', desc: '' }]);
      setToolOutput(item.output);
    } else if (item.toolType === 'code') {
      setCodeSnippet(item.input.code || '');
      setCodeLanguage(item.input.language || 'javascript');
      setCodeAction(item.input.action || 'explain');
      setToolOutput(item.output);
    } else if (item.toolType === 'email') {
      setEmailType(item.input.emailType || 'job_application');
      setEmailContext(item.input.context || '');
      setEmailDesc(item.input.description || '');
      setToolOutput(item.output);
    } else if (item.toolType === 'summary') {
      setSummaryText('');
      setSummaryFile(null);
      setToolOutput(item.output.summary || '');
      setSummaryKeywords(item.output.keywords || []);
    }
    setHistoryOpen(false);
  };

  // Submit Handlers
  const handleGenerateResume = async () => {
    setIsLoading(true);
    setToolOutput('');
    try {
      const { data } = await api.post('/tools/resume', {
        personalDetails: resumeDetails,
        skills: resumeSkills,
        education: resumeEducation,
        experience: resumeExperience
      });
      setToolOutput(data.result);
      fetchHistory();
    } catch (err) {
      setToolOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeAssistant = async () => {
    setIsLoading(true);
    setToolOutput('');
    try {
      const { data } = await api.post('/tools/code', {
        code: codeSnippet,
        language: codeLanguage,
        action: codeAction
      });
      setToolOutput(data.result);
      fetchHistory();
    } catch (err) {
      setToolOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteEmail = async () => {
    setIsLoading(true);
    setToolOutput('');
    try {
      const { data } = await api.post('/tools/email', {
        emailType,
        context: emailContext,
        description: emailDesc
      });
      setToolOutput(data.result);
      fetchHistory();
    } catch (err) {
      setToolOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeNotes = async () => {
    setIsLoading(true);
    setToolOutput('');
    setSummaryKeywords([]);
    try {
      let data;
      if (summaryFile) {
        const formData = new FormData();
        formData.append('file', summaryFile);
        const { data: resData } = await api.post('/tools/summarize', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        data = resData;
      } else {
        const { data: resData } = await api.post('/tools/summarize', { text: summaryText });
        data = resData;
      }
      setToolOutput(data.summary);
      setSummaryKeywords(data.keywords);
      fetchHistory();
    } catch (err) {
      setToolOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic input adjustments
  const addEducationField = () => {
    setResumeEducation([...resumeEducation, { school: '', degree: '', year: '' }]);
  };
  const removeEducationField = (idx) => {
    setResumeEducation(resumeEducation.filter((_, i) => i !== idx));
  };
  const addExperienceField = () => {
    setResumeExperience([...resumeExperience, { company: '', role: '', duration: '', desc: '' }]);
  };
  const removeExperienceField = (idx) => {
    setResumeExperience(resumeExperience.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative flex flex-col transition-colors duration-200">
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all text-sm shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Chat
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-850 dark:text-white">
              <Sparkles size={18} className="text-indigo-400" /> AI Tools
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-750 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 px-4 py-1.5 rounded-lg transition-all text-sm font-medium shadow-sm"
          >
            <Clock size={16} /> Tool History
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-start">
        {!activeTool ? (
          /* DASHBOARD VIEW */
          <div className="py-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
              >
                AI Tools Dashboard
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 dark:text-slate-400 text-base"
              >
                Boost your productivity with specialized AI assistants. Click on any card below to launch the tool.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool, idx) => {
                const borderColors = {
                  indigo: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
                  blue: 'hover:border-blue-500 hover:shadow-blue-500/10',
                  purple: 'hover:border-purple-500 hover:shadow-purple-500/10',
                  emerald: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
                };
                
                const iconColors = {
                  indigo: 'text-indigo-400 bg-indigo-950/60 border-indigo-900/40',
                  blue: 'text-blue-400 bg-blue-950/60 border-blue-900/40',
                  purple: 'text-purple-400 bg-purple-950/60 border-purple-900/40',
                  emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/40',
                };

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setActiveTool(tool.id);
                      setToolOutput('');
                      setIsEditing(false);
                      setSummaryKeywords([]);
                    }}
                    className={`bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-900/90 transition-all shadow-lg hover:-translate-y-1 duration-300 flex flex-col h-full group ${borderColors[tool.color]}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 group-hover:scale-110 transition-transform ${iconColors[tool.color]}`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">{tool.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1">{tool.desc}</p>
                    <div className="mt-4 flex items-center text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors uppercase gap-1">
                      Launch Tool <Plus size={12} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ACTIVE TOOL SPLIT SCREEN VIEW */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 flex-1 h-full"
          >
            {/* INPUT PANEL */}
            <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col h-full transition-colors duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-950/40 border border-indigo-900/40 rounded-lg text-indigo-400">
                    {activeTool === 'resume' && <FileText size={20} />}
                    {activeTool === 'code' && <Code size={20} />}
                    {activeTool === 'email' && <Mail size={20} />}
                    {activeTool === 'summary' && <BookOpen size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white">
                      {tools.find(t => t.id === activeTool)?.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Fill details & generate
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTool(null)} 
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 space-y-4">
                {/* 1. RESUME BUILDER FORM */}
                {activeTool === 'resume' && (
                  <div className="space-y-6">
                    {/* Personal Details */}
                    <div className="bg-slate-900/50 p-4 border border-slate-800/60 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-indigo-400">Personal Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" 
                            placeholder="John Doe"
                            value={resumeDetails.name}
                            onChange={(e) => setResumeDetails({ ...resumeDetails, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" 
                            placeholder="johndoe@example.com"
                            value={resumeDetails.email}
                            onChange={(e) => setResumeDetails({ ...resumeDetails, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" 
                            placeholder="+1 (555) 019-2834"
                            value={resumeDetails.phone}
                            onChange={(e) => setResumeDetails({ ...resumeDetails, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">LinkedIn / Website</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" 
                            placeholder="linkedin.com/in/johndoe"
                            value={resumeDetails.website}
                            onChange={(e) => setResumeDetails({ ...resumeDetails, website: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-slate-900/50 p-4 border border-slate-800/60 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-indigo-400">Skills</h4>
                      <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 h-20 resize-none" 
                        placeholder="e.g. JavaScript, React, Node.js, Project Management, Agile, Communication"
                        value={resumeSkills}
                        onChange={(e) => setResumeSkills(e.target.value)}
                      />
                    </div>

                    {/* Education */}
                    <div className="bg-slate-900/50 p-4 border border-slate-800/60 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-indigo-400">Education</h4>
                        <button 
                          onClick={addEducationField}
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <Plus size={14} /> Add Education
                        </button>
                      </div>

                      {resumeEducation.map((edu, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/60 rounded-lg relative space-y-2">
                          {resumeEducation.length > 1 && (
                            <button 
                              onClick={() => removeEducationField(idx)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            <input 
                              type="text" 
                              placeholder="Degree (e.g. B.S. CS)" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...resumeEducation];
                                newEdu[idx].degree = e.target.value;
                                setResumeEducation(newEdu);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="School/University" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={edu.school}
                              onChange={(e) => {
                                const newEdu = [...resumeEducation];
                                newEdu[idx].school = e.target.value;
                                setResumeEducation(newEdu);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Year (e.g. 2024)" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={edu.year}
                              onChange={(e) => {
                                const newEdu = [...resumeEducation];
                                newEdu[idx].year = e.target.value;
                                setResumeEducation(newEdu);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Experience */}
                    <div className="bg-slate-900/50 p-4 border border-slate-800/60 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-indigo-400">Work Experience</h4>
                        <button 
                          onClick={addExperienceField}
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <Plus size={14} /> Add Work
                        </button>
                      </div>

                      {resumeExperience.map((exp, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/60 rounded-lg relative space-y-2">
                          {resumeExperience.length > 1 && (
                            <button 
                              onClick={() => removeExperienceField(idx)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            <input 
                              type="text" 
                              placeholder="Company" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...resumeExperience];
                                newExp[idx].company = e.target.value;
                                setResumeExperience(newExp);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Role" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={exp.role}
                              onChange={(e) => {
                                const newExp = [...resumeExperience];
                                newExp[idx].role = e.target.value;
                                setResumeExperience(newExp);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Duration (e.g. 2021-Present)" 
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              value={exp.duration}
                              onChange={(e) => {
                                const newExp = [...resumeExperience];
                                newExp[idx].duration = e.target.value;
                                setResumeExperience(newExp);
                              }}
                            />
                          </div>
                          <textarea 
                            placeholder="Description of duties/projects..." 
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                            value={exp.desc}
                            onChange={(e) => {
                              const newExp = [...resumeExperience];
                              newExp[idx].desc = e.target.value;
                              setResumeExperience(newExp);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. CODE ASSISTANT FORM */}
                {activeTool === 'code' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Language</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                          value={codeLanguage}
                          onChange={(e) => setCodeLanguage(e.target.value)}
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Action</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                          value={codeAction}
                          onChange={(e) => setCodeAction(e.target.value)}
                        >
                          <option value="explain">Explain Code</option>
                          <option value="fix">Fix Errors</option>
                          <option value="optimize">Optimize Code</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Paste Code</label>
                      <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 h-80 resize-none" 
                        placeholder="paste your code snippet here..."
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* 3. EMAIL WRITER FORM */}
                {activeTool === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Email Type</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        value={emailType}
                        onChange={(e) => setEmailType(e.target.value)}
                      >
                        <option value="job_application">Job Application</option>
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Recipient / Context</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" 
                        placeholder="e.g. Hiring Manager at Google, My team lead, HR department"
                        value={emailContext}
                        onChange={(e) => setEmailContext(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Points/Description to Include</label>
                      <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 h-48 resize-none" 
                        placeholder="e.g. Apply for Front-end dev position, mention 3 years React experience, state availability for interviews next week"
                        value={emailDesc}
                        onChange={(e) => setEmailDesc(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* 4. NOTES SUMMARIZER FORM */}
                {activeTool === 'summary' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Paste Text</label>
                      <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 h-48 resize-none" 
                        placeholder="Paste long text notes here..."
                        value={summaryText}
                        onChange={(e) => {
                          setSummaryText(e.target.value);
                          if (e.target.value) setSummaryFile(null); // Clear file if user types
                        }}
                        disabled={!!summaryFile}
                      />
                    </div>

                    <div className="text-center text-xs text-slate-500 my-2">OR</div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Upload File (PDF or TXT)</label>
                      <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-6 flex flex-col items-center justify-center relative transition-colors">
                        <Upload size={28} className="text-indigo-400 mb-2" />
                        <span className="text-xs text-slate-300 font-medium">
                          {summaryFile ? summaryFile.name : 'Select PDF or TXT File'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">Max 10MB</span>
                        <input 
                          type="file" 
                          accept=".pdf,.txt"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setSummaryFile(e.target.files[0]);
                              setSummaryText(''); // Clear pasted text
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {summaryFile && (
                        <button 
                          onClick={() => setSummaryFile(null)}
                          className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <X size={12} /> Clear Selected File
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  disabled={isLoading}
                  onClick={() => {
                    if (activeTool === 'resume') handleGenerateResume();
                    if (activeTool === 'code') handleCodeAssistant();
                    if (activeTool === 'email') handleWriteEmail();
                    if (activeTool === 'summary') handleSummarizeNotes();
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> {isLoading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {/* OUTPUT PANEL */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-full relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Generated Output
                </h3>

                {toolOutput && !isLoading && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(isEditing ? editedOutput : toolOutput)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copySuccess ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setToolOutput(editedOutput);
                          setIsEditing(false);
                        } else {
                          setEditedOutput(toolOutput);
                          setIsEditing(true);
                        }
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title={isEditing ? "Save changes" : "Edit content"}
                    >
                      {isEditing ? <Save size={16} className="text-emerald-400" /> : <Edit3 size={16} />}
                    </button>

                    {activeTool === 'resume' ? (
                      <button
                        onClick={() => generatePDF(isEditing ? editedOutput : toolOutput, resumeDetails)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Download PDF Resume"
                      >
                        <Download size={16} /> PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => handleExportText(isEditing ? editedOutput : toolOutput, `${activeTool}_output.txt`)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Download Text File"
                      >
                        <Download size={16} /> TXT
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* OUTPUT CONTAINER */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-2 bg-slate-950/40 border border-slate-900 rounded-xl p-5 relative">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <div>
                        <p className="text-sm text-slate-300 font-semibold">Creating Magic...</p>
                        <p className="text-xs text-slate-500 mt-1">This should only take a few seconds.</p>
                      </div>
                    </motion.div>
                  ) : toolOutput ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {isEditing ? (
                        <textarea
                          className="w-full bg-slate-950/80 border border-slate-850 rounded-lg p-3 text-sm font-sans text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[350px] h-full resize-y"
                          value={editedOutput}
                          onChange={(e) => setEditedOutput(e.target.value)}
                        />
                      ) : (
                        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
                          {activeTool === 'code' ? (
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  return inline ? (
                                    <code className="bg-slate-900 text-pink-400 px-1 py-0.5 rounded text-xs" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono my-3 text-indigo-300">
                                      <code {...props}>{children}</code>
                                    </pre>
                                  );
                                }
                              }}
                            >
                              {toolOutput}
                            </ReactMarkdown>
                          ) : (
                            <ReactMarkdown>{toolOutput}</ReactMarkdown>
                          )}

                          {activeTool === 'summary' && summaryKeywords.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-slate-900">
                              <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">Key Concepts</h4>
                              <div className="flex flex-wrap gap-2">
                                {summaryKeywords.map((tag, idx) => (
                                  <span key={idx} className="bg-indigo-950/60 border border-indigo-900/50 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-600 px-4"
                    >
                      <Sparkles size={36} className="text-slate-800 mb-3" />
                      <p className="text-sm font-medium">No output generated yet.</p>
                      <p className="text-xs text-slate-700 mt-1">Fill the details on the left and click generate to begin.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-600 py-4 text-center text-xs">
        AI Tools Dashboard v1.1 • Built with React.js & Tailwind CSS
      </footer>

      {/* HISTORY DRAWER */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* DRAWER */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-slate-800 z-50 shadow-2xl p-6 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock size={18} className="text-indigo-400" /> Tool History
                </h3>
                <button 
                  onClick={() => setHistoryOpen(false)}
                  className="text-slate-500 hover:text-white p-1 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-sm">
                    No history items yet.
                  </div>
                ) : (
                  history.map((item) => {
                    const toolLabels = {
                      resume: { title: 'Resume Generator', icon: <FileText size={16} />, color: 'indigo' },
                      code: { title: 'Code Assistant', icon: <Code size={16} />, color: 'blue' },
                      email: { title: 'Email Writer', icon: <Mail size={16} />, color: 'purple' },
                      summary: { title: 'Notes Summarizer', icon: <BookOpen size={16} />, color: 'emerald' }
                    };

                    const toolMeta = toolLabels[item.toolType] || { title: 'AI Tool', icon: <Sparkles size={16} />, color: 'slate' };
                    
                    const borderColors = {
                      indigo: 'hover:border-indigo-500/50',
                      blue: 'hover:border-blue-500/50',
                      purple: 'hover:border-purple-500/50',
                      emerald: 'hover:border-emerald-500/50',
                    };

                    const badgeColors = {
                      indigo: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/40',
                      blue: 'text-blue-400 bg-blue-950/40 border-blue-900/40',
                      purple: 'text-purple-400 bg-purple-950/40 border-purple-900/40',
                      emerald: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40',
                    };

                    return (
                      <div
                        key={item._id}
                        onClick={() => loadHistoryItem(item)}
                        className={`bg-slate-900/40 border border-slate-900 rounded-xl p-4 cursor-pointer hover:bg-slate-900/80 transition-all flex items-start gap-3 relative group ${borderColors[toolMeta.color]}`}
                      >
                        <div className={`p-2 rounded-lg border ${badgeColors[toolMeta.color]}`}>
                          {toolMeta.icon}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="text-sm font-semibold text-white truncate">{toolMeta.title}</h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {item.toolType === 'resume' && `Name: ${item.input.personalDetails?.name || 'N/A'}`}
                            {item.toolType === 'code' && `${item.input.action} - ${item.input.language}`}
                            {item.toolType === 'email' && `Type: ${item.input.emailType?.replace('_', ' ')}`}
                            {item.toolType === 'summary' && `File: ${item.input.fileName || 'Pasted'}`}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item._id, e)}
                          className="absolute right-3 top-3 text-slate-600 hover:text-red-400 p-1 hover:bg-slate-950 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="Delete History"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
