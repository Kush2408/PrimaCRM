import axios from 'axios';
import { FiPlus, FiSend } from 'react-icons/fi';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { reportService } from '../services/reportService';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BsStopFill } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';
import '../App.css'

type MessageType = {
  sender: 'user' | 'bot';
  text?: string;
  type?: 'text' | 'iframe' | 'secondary-note';
  url?: string;
  date?: string;
  month?: string;
};

type Coach = { id: number; name: string };
type ProgramDuration = | '1_MONTH' | '2_MONTH' | '3_MONTHS' | '6_MONTHS' | '12_MONTHS';

type ReportHistoryItem = {
  id: string;
  date: string;
  firstName: string;
  lastName: string;
  coachName: string;
  coachId: number;
  programName: string;
  programType: string;
  programDuration: string;
  programActiveDate: string;
  programCompletedDate: string;
  report_date: string;
  note: string;
  report: string;
  chat?: MessageType[];
};

const FIRST_NAMES = ['Cherie', 'Lauren', 'Dean', 'Maria', 'Miranda', 'Adrienne', 'John', 'Brad', 'David', 'Samantha', 'Allister', 'Yujia', 'Minu', 'Sidd', 'Darren', 'Rebecca', 'Josephine', 'Jodie', 'Tommy', 'Roy', 'Glenn', 'Nick', 'Joey'];
const LAST_NAMES = ['Johnson', 'Smith', 'Williams', 'Popovic', 'Scott', 'Hecimovic', 'Chalmers', 'Hunt', 'Wang', 'Elgie', 'Caruana', 'Schwilk', 'Greenhill', 'Talbot', 'Fioravanti', 'Sharma', 'Cadd', 'Teslya', 'Gough', 'Cartwright', 'Vulic', 'Nallaiah', 'Troy'];
const COACHES: Coach[] = [
  { id: 515, name: 'Andrea Van Der Merwe' },
  { id: 513, name: 'Anne Hutton' },
  { id: 504, name: 'Brooke Rutledge' },
  { id: 514, name: 'Bryan Waters' },
  { id: 502, name: 'Claire Thomas' },
  { id: 508, name: 'Claire Austin' },
  { id: 511, name: 'Cathy Thorpe' },
  { id: 507, name: 'Carla Nicholson' },
  { id: 509, name: 'Elizabeth Logan' },
  { id: 510, name: 'Jenni Simmons' },
  { id: 503, name: 'Nigel Thompson' },
  { id: 505, name: 'Mary Jane Cormack' },
  { id: 506, name: 'Paul Di Michiel' },
  { id: 501, name: 'Sarah Felice' },
  { id: 512, name: 'Simon Bruce' },

];
const PROGRAM_DURATIONS: ProgramDuration[] = [
  '1_MONTH',
  '2_MONTH',
  '3_MONTHS',
  '6_MONTHS',
  '12_MONTHS',
];
const PROGRAM_NAMES = [
  'Executive Leadership Program',
  'Sales Accelerator',
  'Tech Mentorship',
];
const PROGRAM_TYPES = [
  'COACHING',
  'REVIEW',
  'ASSESSMENT',
];

function isExpired(expiry: string | undefined | null): boolean {
  if (!expiry) return true;

  // Clean and convert ISO 8601 format to something JS Date can parse
  const safeExpiry = expiry.replace(/\.\d+/, '').replace(/\+00:00$/, 'Z');
  const expiryDate = new Date(safeExpiry);
  if (isNaN(expiryDate.getTime())) return true;
  console.log('Checking expiry:', expiryDate.toISOString(), 'Current time:', new Date().toISOString());
  return expiryDate.getTime() < Date.now();
}

function generateId(prefix: string = 'id_') {
  return prefix + Math.random().toString(36).substring(2, 10) + Date.now();
}

function saveSelectionsToLocalStorage(data: {
  firstName: string;
  lastName: string;
  coach: Coach | null;
  programDuration: ProgramDuration | '';
  programName: string;
  programType: string;
  programActiveDate: string;
  programCompletedDate: string;
}) {
  localStorage.setItem(
    'prima_crm_selections',
    JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      coach: data.coach,
      programDuration: data.programDuration,
      programName: data.programName,
      programType: data.programType,
      programActiveDate: data.programActiveDate,
      programCompletedDate: data.programCompletedDate
    })
  );
}

function saveReportHistory(history: ReportHistoryItem[]) {
  localStorage.setItem('prima_crm_report_history', JSON.stringify(history));
}

function getReportHistory(): ReportHistoryItem[] {
  try {
    const data = localStorage.getItem('prima_crm_report_history');
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [programDuration, setProgramDuration] = useState<string>('');
  const [programName, setProgramName] = useState('');
  const [programType, setProgramType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [programActiveDate, setProgramActiveDate] = useState('');
  const [programCompletedDate, setProgramCompletedDate] = useState('');

  const [requestId, setRequestId] = useState('');
  const [candidateId] = useState(() => Math.floor(Math.random() * 100000) + 1);
  const [createdBy] = useState(1);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>(getReportHistory());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const loggedOutRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);



  const loadingMessages = ['Analyzing', 'Generating', 'Finalizing'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      toast.error(' Generation stopped.');
    }
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    startNewChat();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    saveSelectionsToLocalStorage({
      firstName,
      lastName,
      coach: selectedCoach,
      programDuration: programDuration as ProgramDuration | '',
      programName,
      programType,
      programActiveDate,
      programCompletedDate
    });
  }, [firstName, lastName, selectedCoach, programDuration, programName, programType,
    programActiveDate,
    programCompletedDate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const accessTokenExpiry = Cookies.get('access_token_expiry');
      const refreshTokenExpiry = Cookies.get('refresh_token_expiry');
      if (isExpired(refreshTokenExpiry)) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('access_token_expiry');
        Cookies.remove('refresh_token_expiry');
        if (!loggedOutRef.current) {
          loggedOutRef.current = true;
          navigate('/login');
        }
        return;
      }
      if (
        accessTokenExpiry &&
        new Date(accessTokenExpiry.replace(/\.\d+/, '').replace(/\+00:00$/, 'Z')).getTime() -
        Date.now() <
        60000
      ) {
        await refreshAccessToken();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const startNewChat = () => {
    setMessages([
      {
        sender: 'bot',
        type: 'text',
        text: '👋 Hi there! Please select your details and enter your prompt to generate the report.',
      },
    ]);
    setInput('');
    setFirstName('');
    setLastName('');
    setSelectedCoach(null);
    setProgramDuration('');
    setProgramName('');
    setProgramType('');
    setSelectedDate('');
    setProgramActiveDate('');
    setProgramCompletedDate('');
    setRequestId(generateId('req_'));
  };

  const refreshAccessToken = async () => {
    const refreshToken = Cookies.get('refresh_token');
    const refreshTokenExpiry = Cookies.get('refresh_token_expiry');
    if (!refreshToken || isExpired(refreshTokenExpiry)) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('access_token_expiry');
      Cookies.remove('refresh_token_expiry');
      if (!loggedOutRef.current) {
        loggedOutRef.current = true;
        navigate('/login');
      }
      return null;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/get-new-access-token`,
        { refresh_token: refreshToken },
      );

      const { access_token, access_token_expiry } = res.data.data;

      Cookies.set('access_token', access_token, { secure: false, sameSite: 'Lax' });
      Cookies.set('access_token_expiry', access_token_expiry, { secure: false, sameSite: 'Lax' });

      return access_token;
    } catch {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('access_token_expiry');
      Cookies.remove('refresh_token_expiry');

      if (!loggedOutRef.current) {
        loggedOutRef.current = true;
        navigate('/login');
      }
      return null;
    }

  };

  const callWithAuth = async (apiCall: (token: string) => Promise<any>) => {
    let token = Cookies.get('access_token');
    const accessTokenExpiry = Cookies.get('access_token_expiry');
    const refreshTokenExpiry = Cookies.get('refresh_token_expiry');
    if (!token || isExpired(accessTokenExpiry)) {
      token = await refreshAccessToken();
      if (!token) return null;
    }
    if (isExpired(refreshTokenExpiry)) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('access_token_expiry');
      Cookies.remove('refresh_token_expiry');
      if (!loggedOutRef.current) {
        loggedOutRef.current = true;
        navigate('/login');
      }
      return null;
    }
    try {
      return await apiCall(token);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        token = await refreshAccessToken();
        if (!token) return null;
        return await apiCall(token);
      } else {
        throw err;
      }
    }
  };

  const handleAddSecondaryNote = () => {
    if (!selectedDate) {
      toast.error("Please select a Report Date first.");
      return;
    }

    const note = input.trim();

    if (!note || note.length < 5) {
      toast.error("Secondary note cannot be empty or too short.");
      return;
    }
    setInput('');

    const selectedMonth = new Date(selectedDate).toISOString().slice(0, 7);

    const secondaryNoteMsg: MessageType = {
      sender: 'user',
      type: 'secondary-note',
      text: note,
      date: new Date(selectedDate).toISOString(),
      month: selectedMonth,
    };
    setMessages((prev) => [...prev, secondaryNoteMsg]);
  };



  const handleSendMessage = async (customInput?: string, isSecondary = false) => {
    const selectedMonth = new Date(selectedDate).toISOString().slice(0, 7);
    const note = (customInput ?? input).trim();
    const isOnlyNumbers = /^\d+$/.test(note);
    if (!note || note.length < 10 || isOnlyNumbers || !isNaN(Number(note))) {
      toast.error(
        !note
          ? 'Prompt cannot be empty.'
          : note.length < 10
            ? 'Prompt must be at least 10 characters.'
            : isOnlyNumbers
              ? 'Prompt cannot be only consecutive numbers.'
              : 'Invalid prompt.'
      );
      return;
    }

    if (!firstName) {
      toast.error('Please select a First Name.');
      return;
    }

    if (!lastName) {
      toast.error('Please select a Last Name.');
      return;
    }

    if (!selectedCoach) {
      toast.error('Please select a Coach.');
      return;
    }

    if (!programName) {
      toast.error('Please select a Program Name.');
      return;
    }

    if (!programType) {
      toast.error('Please select a Program Type.');
      return;
    }

    if (!programDuration) {
      toast.error('Please select a Program Duration.');
      return;
    }

    if (!programActiveDate) {
      toast.error('Please select a Active Date.');
      return;
    }

    if (!programCompletedDate) {
      toast.error('Please select a Completed Date.');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a Report Date.');
      return;
    }

    setLoading(true);
    setInput('');


    const userMsg: MessageType = {
      sender: 'user',
      type: isSecondary ? 'secondary-note' : 'text',
      text: note,
      date: new Date(selectedDate).toISOString(),
      month: selectedMonth,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');
    let botMsgs: MessageType[] = [];
    let generatedReport = '';
    const newMessages: MessageType[] = [];
    const previousUserReports = reportHistory.filter(
      (report) =>
        report.firstName.trim().toLowerCase() === firstName.trim().toLowerCase()
    );

    // Extract bot messages & safe unique IDs
    const previous_reports: string[] = [];
    const previous_reports_id: string[] = [];

    previousUserReports.forEach((report) => {
      if (Array.isArray(report.chat)) {
        report.chat.forEach((chatEntry, index) => {
          if (chatEntry?.sender === 'bot' && typeof chatEntry.text === 'string') {
            previous_reports.push(chatEntry.text.trim());
            previous_reports_id.push(`${report.id}_msg_${index}`);
          }
        });
      }
    });

    const currentMonthUserNotes = messages
      .filter((msg) => {
        const msgMonth = msg.month || (msg.date ? new Date(msg.date).toISOString().slice(0, 7) : '');
        return (
          msg.sender === 'user' &&
          (msg.type === 'text' || msg.type === 'secondary-note') &&
          msgMonth === selectedMonth
        );
      })
      .map((msg) => msg.text?.trim())
      .filter((text): text is string => !!text);

    const notes = [...currentMonthUserNotes, note];

    const payload = {
      request_id: requestId,
      candidate: {
        id: candidateId,
        first_name: firstName,
        last_name: lastName,
      },
      coach: {
        id: selectedCoach.id,
        name: selectedCoach.name,
      },
      program: {
        program_name: programName,
        program_type: programType,
        program_duration: programDuration,
        initial_meeting_date: null,
        program_active_date: programActiveDate,
        program_completed_date: programCompletedDate,
      },
      notes: notes,
      previous_reports: previous_reports,
      parent_report_id: previousUserReports[0]?.id || null,
      previous_reports_id: previous_reports_id,
      output_config: { type: 'TEXT' },
      status: 'completed',
      created_by: createdBy,
      report_date: selectedDate, // ✅ Still required
    };

    abortControllerRef.current = new AbortController(); // ✅ Assign controller
    try {
      const result = await toast.promise(
        callWithAuth((token) =>
          reportService.generateReport(payload, token, abortControllerRef.current!.signal)
        ),
        {
          loading: '⏳ Generating report...',
          success: 'Report generated successfully!',
          error: 'Failed to generate report.',
        }
      );

      if (!result) return;

      if (result.success && Array.isArray(result.content) && result.content.length > 0) {
        let hasValidSegment = false;

        result.content.forEach((segment: any) => {
          if (
            segment &&
            typeof segment.report_segment === 'string' &&
            segment.report_segment.trim() !== ''
          ) {
            const formatted = segment.report_segment;
            const botMsg: MessageType = {
              sender: 'bot',
              type: 'text',
              text: formatted,
              date: new Date(selectedDate).toISOString(),
            };

            newMessages.push({
              sender: 'bot' as const,
              type: 'text' as const,
              text: botMsg.text,
            });

            botMsgs.push({
              sender: 'bot' as const,
              type: 'text' as const,
              text: botMsg.text,
            });

            generatedReport += formatted + '\n\n';
            hasValidSegment = true;
          }
        });

        if (!hasValidSegment) {
          toast.error("Report generated but returned no usable content.");
        }

      } else {
        toast.error("Report generated but returned no content.");
      }


      const newChatMessages = [userMsg, ...botMsgs];

      const matchingIndex = reportHistory.findIndex(
        (item) =>
          item.firstName.toLowerCase() === firstName.toLowerCase()
      );

      let updatedHistory: ReportHistoryItem[] = [];

      if (matchingIndex !== -1) {
        const updatedItem = { ...reportHistory[matchingIndex] };
        updatedItem.chat = [...(updatedItem.chat || []), ...newChatMessages];
        updatedItem.report = (updatedItem.report || '') + '\n\n' + generatedReport.trim();
        updatedItem.date = selectedDate;
        updatedItem.note = note;

        updatedHistory = [
          updatedItem,
          ...reportHistory.filter((_, i) => i !== matchingIndex),
        ];
      } else {
        const newHistory: ReportHistoryItem = {
          id: requestId,
          date: selectedDate,
          firstName,
          lastName,
          coachId: selectedCoach.id,
          coachName: selectedCoach.name,
          programName,
          programType,
          programDuration,
          programActiveDate,
          programCompletedDate,
          report_date: selectedDate,
          note,
          report: generatedReport.trim(),
          chat: newChatMessages,
        };

        updatedHistory = [newHistory, ...reportHistory];
      }

      setReportHistory(updatedHistory);
      saveReportHistory(updatedHistory);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || '❌ Failed to generate report.';
      newMessages.push({
        sender: 'bot',
        type: 'text',
        text: errorMessage,
      });
    } finally {
      setMessages((prev) => [...prev, ...newMessages]);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-['Poppins'] bg-white text-gray-800 overflow-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1e1f23',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#e7f5ec',
            },
            style: {
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
            style: {
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
            },
          },
          loading: {
            style: {
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#075985',
            },
          },
        }}
      />

      <aside className="w-[260px] min-w-[200px] bg-gray-100 border-r border-gray-300 flex flex-col p-4 max-md:hidden">
        <div className="text-xl font-bold text-gray-800 mb-3 tracking-wide animate-fade-in">Prima CRM</div>
        <button
          onClick={startNewChat}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-400 text-white py-2 rounded-lg mb-4 hover:brightness-110 transition-all duration-300 ease-in-out shadow hover:shadow-xl animate-pulse cursor-pointer"
        >
          + New report
        </button>

        <div className="text-sm text-gray-600 mb-2">Recent Chats</div>
        <div className="flex flex-col gap-2 overflow-y-scroll pr-1 scrollbar-hidden">
          {reportHistory.length === 0 && (
            <div className="text-xs text-gray-500 animate-fade-in">No previous reports</div>
          )}
          {reportHistory.map((item, idx) => (
            <div
              key={item.id}
              className="relative bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 hover:shadow transition-all duration-300 ease-in-out group animate-fade-in"
              title={`View report for ${item.firstName} ${item.lastName} (${item.programName})`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex-1 min-w-0 space-y-1"
                  onClick={() => {
                    setFirstName(item.firstName?.trim());
                    setLastName(item.lastName);
                    setSelectedCoach(COACHES.find(c => c.id === item.coachId) || null);
                    setProgramName(item.programName);
                    setProgramType(item.programType);
                    setProgramDuration(item.programDuration as ProgramDuration);
                    setSelectedDate(item.date);
                    setProgramActiveDate(item.programActiveDate);
                    setProgramCompletedDate(item.programCompletedDate);
                    setMessages(
                      (item.chat && item.chat.length > 1
                        ? item.chat
                        : ([{ sender: 'user', type: 'text', text: item.note }, ...(item.report ? [{ sender: 'bot', type: 'text', text: item.report }] : [])]) as MessageType[]
                      ).map((msg) => ({
                        ...msg,
                        month: msg.month || (msg.date ? new Date(msg.date).toISOString().slice(0, 7) : undefined),
                      }))
                    );

                  }}
                >
                  <div>
                    <span className="font-semibold text-blue-600">{item.firstName} {item.lastName}</span>
                    <span className="ml-1 text-gray-500">({item.programName})</span>
                  </div>
                  <div className="text-gray-500">
                    Coach: <span className="font-medium">{item.coachName}</span>
                  </div>
                  <div className="text-gray-400 text-xs">{item.date}</div>
                  <div className="truncate text-gray-700">{item.note}</div>
                  {item.report && (
                    <div className="truncate text-green-600 mt-1 italic">
                      {item.report.replace(/[#*`>]/g, '').slice(0, 60)}
                      {item.report.length > 60 ? '...' : ''}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end ml-2 gap-1">
                  <button
                    title="Delete"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-transform duration-200 p-1 hover:scale-125 cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();

                      const updated = reportHistory.filter((_, i) => i !== idx);
                      setReportHistory(updated);
                      saveReportHistory(updated);
                      toast.success(' Report deleted');
                      startNewChat();
                    }}
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white text-[#1e1f23] text-[14px]">
        {/* Header with dense inline dropdowns */}
        <div className="p-3 border-b border-gray-200 bg-white flex flex-col gap-1">
          {/* Prima CRM + Assistant */}
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-bold text-[#1e1f23] leading-tight">Prima CRM</h1>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">
              Assistant
            </span>
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap justify-start items-end gap-2 w-full">
            <select
              className="w-[120px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            >
              <option value="">First Name</option>
              {FIRST_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              className="w-[120px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            >
              <option value="">Last Name</option>
              {LAST_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              className="w-[120px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={selectedCoach?.id || ''}
              onChange={e => {
                const coachId = Number(e.target.value);
                const coach = COACHES.find(c => c.id === coachId) || null;
                setSelectedCoach(coach);
              }}
            >
              <option value="">Coach</option>
              {COACHES.map(coach => (
                <option key={coach.id} value={coach.id}>{coach.name}</option>
              ))}
            </select>

            <select
              className="w-[130px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={programName}
              onChange={e => setProgramName(e.target.value)}
            >
              <option value="">Program Name</option>
              {PROGRAM_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              className="w-[130px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={programType}
              onChange={e => setProgramType(e.target.value)}
            >
              <option value="">Program Type</option>
              {PROGRAM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="w-[140px] px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
              value={programDuration}
              onChange={e => setProgramDuration(e.target.value as ProgramDuration)}
            >
              <option value="">Program Duration</option>
              {PROGRAM_DURATIONS.map(duration => (
                <option key={duration} value={duration}>{duration.replace('_', ' ')}</option>
              ))}
            </select>

            <div className="flex flex-col gap-1 w-[140px]">
              <label className="text-[11px] font-medium text-gray-600 pl-2">Active Date</label>
              <input
                type="date"
                className="w-full px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
                value={programActiveDate}
                onChange={(e) => setProgramActiveDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex flex-col gap-1 w-[140px]">
              <label className="text-[11px] font-medium text-gray-600 pl-2">Completed Date</label>
              <input
                type="date"
                className="w-full px-2 py-1 text-xs rounded-full border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
                value={programCompletedDate}
                onChange={(e) => setProgramCompletedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>


        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth bg-white">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {/* Display selected date above each message */}
              {msg.date && (
                <div className="text-center text-gray-500 text-xs my-2">
                  {new Date(msg.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}


              <div
                className={`relative max-w-[95%] sm:max-w-[80%] whitespace-pre-wrap break-words px-4 py-3 rounded-2xl transition-all duration-300 ease-out shadow-md ${msg.sender === 'user'
                  ? 'bg-blue-100 self-end ml-auto text-blue-800'
                  : 'bg-gray-100 self-start mr-auto text-gray-900'
                  }`}
              >
                {msg.sender === 'bot' &&
                  msg.text !== '👋 Hi there! Please select your details and enter your prompt to generate the report.' &&
                  msg.text && (
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(msg.text?.toString() || '');
                          toast.success('Message copied!');
                        } catch (error) {
                          toast.error('Failed to copy message');
                          console.error('Copy error:', error);
                        }
                      }}
                      className="absolute top-2 right-2 text-xs text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      📋Copy
                    </button>
                  )}
                <div className="prose prose-sm max-w-full text-sm sm:text-base">
                  <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}


          {/* Typing animation */}
          {loading && (
            <div className="self-start mr-auto px-4 py-3 rounded-2xl bg-gray-100 shadow-md flex items-center space-x-2 text-sm text-gray-700">
              <span>{loadingMessages[loadingMessageIndex]}</span>
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.3s]" />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area with date picker */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 sticky bottom-0">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[11px] pl-2 font-medium text-gray-600">Report Date</label>
            <input
              type="date"
              className="w-full sm:w-[140px] px-2.5 py-1.5 text-sm rounded-full border border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-gray-800 bg-white transition"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
          </div>

          <div className="flex-1">
            <input
              className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-full outline-none placeholder:text-gray-500 border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter your prompt to generate the report..."
              value={input}
              min={10}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>

          {loading ? (
            <motion.button
              onClick={handleStopGenerating}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-blue-300 shadow-lg flex items-center justify-center"
            >
              <BsStopFill className="text-black text-xl" />
            </motion.button>

          ) : (
            <>
              <button
                onClick={handleAddSecondaryNote}
                disabled={loading}
                title="Add Secondary Note"
                className="bg-blue-400 hover:bg-indigo-500 p-3 rounded-full shadow-md text-white"
              >
                <FiPlus className="text-xl" />
              </button>

              <button
                onClick={() => handleSendMessage()} // ✅ wrapped in arrow function to match expected type
                disabled={loading}
                className="bg-blue-400 hover:bg-indigo-500 p-3 rounded-full shadow-md text-white"
              >
                <FiSend className="text-xl" />
              </button>
            </>
          )}
        </div>
      </main >
    </div >
  );
}