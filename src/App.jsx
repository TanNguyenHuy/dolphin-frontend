import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

// Import Icons cho giao diện mới
import { LayoutDashboard, Users, CalendarDays, LogOut, Menu, Plus, Clock, RefreshCw } from 'lucide-react';

// Import các Component giao diện
import Auth from './Auth';
import AdminPanel from './components/AdminPanel';
import DashboardView from './components/DashboardView';
import DetailView from './components/DetailView';
import ChatBox from './components/ChatBox';
import Toast from './components/Toast';
import PersonalCalendar from './components/dashboard/PersonalCalendar';

// Import các Modals
import SyncModal from './components/modals/SyncModal';
import EditRowModal from './components/modals/EditRowModal';
import EditSessionModal from './components/modals/EditSessionModal';
import DeleteSessionModal from './components/modals/DeleteSessionModal';
import DeleteRowModal from './components/modals/DeleteRowModal';
import SalaryModal from './components/modals/SalaryModal';
import BlockModal from './components/modals/BlockModal';

// Import Utils và Bộ Não Logic
import { API_URL, AD_COST_PER_SALE, parseInput, formatDateDisplay, getSessionName, getTodayString, Confetti } from './utils';
import { parseIGSyncText, calculateGlobalStats, calculateDetailStats } from './logic';

// ============================================================================
// LÁ CHẮN CƯỜNG LỰC (ERROR BOUNDARY)
// ============================================================================
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Crash:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 md:p-10 bg-[#FFF5F5] border-2 border-red-200 rounded-[32px] shadow-2xl max-w-5xl mx-auto mt-20 relative z-50">
                    <h2 className="text-[24px] font-black text-red-600 mb-4 uppercase tracking-widest">🚨 Hệ thống phát hiện Crash (Sập giao diện)!</h2>
                    <p className="text-[15px] text-gray-700 font-medium mb-6">Thay vì hiện màn hình trắng, lá chắn đã chặn lại. Hãy chụp màn hình khung đỏ dưới đây và gửi lại cho tôi:</p>
                    <div className="bg-white p-5 rounded-2xl overflow-x-auto text-[13px] font-mono text-red-800 border border-red-100 shadow-inner max-h-[300px] overflow-y-auto">
                        <strong className="text-red-600 text-[15px]">{this.state.error?.toString()}</strong>
                        <br/><br/>
                        {this.state.errorInfo?.componentStack}
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-8 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95">
                        Tải lại trang
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    const [authUser, setAuthUser] = useState(() => {
        if (typeof window !== 'undefined') { 
            const sessionUser = sessionStorage.getItem('authUser');
            if (sessionUser) return JSON.parse(sessionUser);
            const localUser = localStorage.getItem('authUser');
            if (localUser) return JSON.parse(localUser);
        }
        return null;
    });

    const [view, setView] = useState('DASHBOARD');
    const [activeTab, setActiveTab] = useState('CHART');
    const [sessions, setSessions] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [detailData, setDetailData] = useState(null);
    
    // --- STATE DÀNH CHO BỐ CỤC MỚI (LAYOUT) ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingTasksCount, setPendingTasksCount] = useState(0); 

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteRowModal, setShowDeleteRowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [editingSession, setEditingSession] = useState(null);
    const [syncRow, setSyncRow] = useState(null);
    const [syncText, setSyncText] = useState('');
    const [syncManualQty, setSyncManualQty] = useState('');
    const [syncManualRev, setSyncManualRev] = useState('');
    const [isProcessingCreate, setIsProcessingCreate] = useState(false);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [isProcessingAdd, setIsProcessingAdd] = useState(false);
    const [isProcessingEdit, setIsProcessingEdit] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [salarySession, setSalarySession] = useState(null);
    const [momoPhone, setMomoPhone] = useState(() => {
        if (typeof window !== 'undefined') { return localStorage.getItem('momoPhone') || ''; }
        return '';
    });
    const [newItem, setNewItem] = useState({ ten_san_pham: '', link_san_pham: '', ngay_ban: getTodayString(), so_luong_nhap: '', so_luong: '', so_tien_ban_duoc: '' });
    const [baleName, setBaleName] = useState(''); const [baleCost, setBaleCost] = useState(''); const [baleQty, setBaleQty] = useState('');
    const [importedBales, setImportedBales] = useState([]);

    const isAdmin = authUser?.role === 'admin';
    const canEdit = isAdmin || authUser?.permissions?.canEdit === true;
    const canDelete = isAdmin || authUser?.permissions?.canDelete === true;
    const canPay = isAdmin || authUser?.permissions?.canPay === true;
    const canViewDetail = isAdmin || authUser?.permissions?.canViewDetail === true;
    const canExportExcel = isAdmin || authUser?.plan === '100k' || authUser?.plan === 'premium';

    const [timeLeftDisplay, setTimeLeftDisplay] = useState('');
    const [isExpiredState, setIsExpiredState] = useState(false);
    const [blockModal, setBlockModal] = useState({ show: false, message: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (!window.history.state || !window.history.state.view) {
            window.history.replaceState({ view: 'DASHBOARD' }, '');
        }

        const handlePopState = (event) => {
            if (event.state && event.state.view) {
                const targetView = event.state.view;
                setView(targetView);
                if (targetView === 'DASHBOARD') {
                    fetchDashboard(); setDetailData(null); setImportedBales([]);
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigate = (newView) => {
        if (view !== newView) {
            window.history.pushState({ view: newView }, '');
            setView(newView);
            setIsSidebarOpen(false); 
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        if (!authUser || authUser.role === 'admin' || authUser.plan === 'premium' || !authUser.planExpiry) { setIsExpiredState(false); return; }
        const checkExpiry = () => {
            const now = new Date(); const exp = new Date(authUser.planExpiry);
            if (now >= exp) { if (!isExpiredState) setIsExpiredState(true); } 
            else {
                if (isExpiredState) setIsExpiredState(false);
                const diff = Math.abs(exp - now);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                if (days > 0) setTimeLeftDisplay(`Còn ${days} ngày ${hours} giờ`);
                else if (hours > 0) setTimeLeftDisplay(`Còn ${hours} giờ ${mins} phút`);
                else if (mins > 0) setTimeLeftDisplay(`Còn ${mins} phút ${secs} giây`);
                else setTimeLeftDisplay(`Còn ${secs} giây`);
            }
        };
        checkExpiry();
        const timer = setInterval(checkExpiry, 1000);
        return () => clearInterval(timer);
    }, [authUser, isExpiredState]);

    useEffect(() => { localStorage.setItem('momoPhone', momoPhone); }, [momoPhone]);
    useEffect(() => { if(authUser) { fetchDashboard(); } }, [authUser]);

    useEffect(() => {
        if (!authUser || !authUser.email) return; 
        const checkRealTimeStatus = async () => {
            try {
                const res = await axios.post(`${API_URL}/check-status`, { email: authUser.email });
                const latestData = res.data;
                const isActuallyExpired = latestData.planExpiry && new Date(latestData.planExpiry) <= new Date();

                if (latestData.isBanned || (!latestData.isApproved && !isActuallyExpired && !latestData.paymentImage)) {
                    setBlockModal({ show: true, message: 'Tài khoản của bạn đã bị khóa hoặc mất quyền truy cập!' }); return;
                }
                if (JSON.stringify(authUser.permissions) !== JSON.stringify(latestData.permissions) || authUser.role !== latestData.role || authUser.planExpiry !== latestData.planExpiry || authUser.plan !== latestData.plan || authUser.isApproved !== latestData.isApproved || authUser.isChatBanned !== latestData.isChatBanned || authUser.chatRestrictedUntil !== latestData.chatRestrictedUntil) {
                    setAuthUser(prev => {
                        const updated = { ...prev, permissions: latestData.permissions, role: latestData.role, plan: latestData.plan, planExpiry: latestData.planExpiry, isApproved: latestData.isApproved, isChatBanned: latestData.isChatBanned, chatRestrictedUntil: latestData.chatRestrictedUntil };
                        if (localStorage.getItem('authUser')) localStorage.setItem('authUser', JSON.stringify(updated));
                        if (sessionStorage.getItem('authUser')) sessionStorage.setItem('authUser', JSON.stringify(updated));
                        return updated;
                    });
                }
            } catch (error) {}
        };
        const radar = setInterval(checkRealTimeStatus, 5000);
        return () => clearInterval(radar); 
    }, [authUser, isExpiredState]);

    const handleLogout = () => { setAuthUser(null); localStorage.removeItem('authUser'); sessionStorage.removeItem('authUser'); handleNavigate('DASHBOARD'); setDetailData(null); setIsExpiredState(false); };

    const fetchDashboard = async () => { 
        try { 
            const res = await axios.get(`${API_URL}/sessions`); 
            const sessionsData = Array.isArray(res.data) ? res.data : [];
            let enrichedSessions = await Promise.all(sessionsData.map(async (ss) => {
                try {
                    const detailRes = await axios.get(`${API_URL}/data/${ss.id}`);
                    const dailyList = detailRes.data?.daily || [];
                    
                    let computedTongNhap = 0; let computedTongBan = 0; let computedDoanhThu = 0;
                    dailyList.forEach(item => {
                        computedTongNhap += (Number(item.so_luong_nhap) || 0);
                        computedTongBan += (Number(item.so_luong) || 0);
                        computedDoanhThu += (Number(item.so_tien_ban_duoc) || 0);
                    });

                    ss.tong_sl_nhap = computedTongNhap; ss.tong_sl_ban = computedTongBan; ss.tong_doanh_thu = computedDoanhThu; ss.quang_cao = dailyList.length * AD_COST_PER_SALE; ss.daily = dailyList;

                    let balesData = []; try { balesData = (await axios.get(`${API_URL}/bales/${ss.id}`)).data; } catch(e) {}
                    const safeBalesData = Array.isArray(balesData) ? balesData : [];
                    const sortedBales = [...safeBalesData].sort((a,b) => String(b.name || '').length - String(a.name || '').length);
                    let computedVonTon = 0; let trungBinh = ss.tong_sl_nhap > 0 ? (ss.so_tien_cua_kien / ss.tong_sl_nhap) : 0;
                    
                    dailyList.forEach((row) => {
                        const matchedBale = sortedBales.find(b => String(row.ten_san_pham || '').toLowerCase().includes(String(b.name || '').toLowerCase()));
                        let sl_con = (Number(row.so_luong_nhap) || 0) - (Number(row.so_luong) || 0);
                        if (matchedBale) { computedVonTon += Math.round(sl_con * ((matchedBale.cost || 0) / (matchedBale.qty || 1))); } else { computedVonTon += Math.round(sl_con * trungBinh); }
                    });
                    ss.tong_tien_ton_computed = computedVonTon;
                    
                    const dates = dailyList.map(d => new Date(d.ngay_ban).getTime()).filter(t => !isNaN(t));
                    if (dates.length > 0) { 
                        ss.actual_start_date = new Date(Math.min(...dates)).toISOString().split('T')[0]; 
                        ss.actual_end_date = new Date(Math.max(...dates)).toISOString().split('T')[0]; 
                    } else { ss.actual_start_date = ss.start_date || getTodayString(); ss.actual_end_date = ss.end_date || ss.actual_start_date; }
                } catch(e) { ss.quang_cao = 0; ss.tong_tien_ton_computed = 0; ss.actual_start_date = ss.start_date || getTodayString(); ss.actual_end_date = ss.start_date || getTodayString(); }
                return ss;
            }));
            enrichedSessions.forEach((ss, idx) => ss.originalIndex = idx);
            enrichedSessions.sort((a, b) => {
                const dateA = new Date(a.actual_start_date || a.start_date || Date.now()).getTime();
                const dateB = new Date(b.actual_start_date || b.start_date || Date.now()).getTime();
                if (dateB === dateA) return b.originalIndex - a.originalIndex; return dateB - dateA;
            });
            setSessions(enrichedSessions); 
        } catch (err) {} 
    };

    const fetchDetail = async (id) => { 
        if (!canViewDetail) { showToast("Gói của bạn không hỗ trợ xem chi tiết. Vui lòng nâng cấp lên gói VIP hoặc cao hơn!", "error"); return; }
        try { 
            const res = await axios.get(`${API_URL}/data/${id}`); 
            let balesData = []; try { balesData = (await axios.get(`${API_URL}/bales/${id}`)).data; } catch(e) {}
            
            if(res.data && typeof res.data === 'object' && !Array.isArray(res.data)) { 
                const safeData = { 
                    ...res.data, name: res.data.name || 'Đợt bán', start_date: res.data.start_date || getTodayString(), end_date: res.data.end_date || getTodayString(), daily: Array.isArray(res.data.daily) ? res.data.daily : [] 
                };
                setDetailData(safeData); setImportedBales(Array.isArray(balesData) ? balesData : []); setCurrentId(id); 
                window.history.pushState({ view: 'DETAIL', id: id }, ''); setView('DETAIL'); 
            }
        } catch (err) { showToast("Lỗi tải dữ liệu. Vui lòng thử lại.", "error"); } 
    };
    
    // ============================================================================
    // BỘ XỬ LÝ SỰ KIỆN: ĐÃ FIX LỖI CLICK CHUỘT KHÔNG ĂN
    // Các hàm này sẽ tự động phân loại rác sự kiện (event click) để chắt lọc đúng data cần thiết.
    // ============================================================================

    const handleStartEdit = (...args) => {
        // Tự động tìm và bóc tách object chứa dữ liệu thật (loại bỏ event click của React)
        const validRow = args.find(arg => arg && typeof arg === 'object' && !arg.nativeEvent && !arg.target);
        if (validRow) {
            setEditingRow({ ...validRow });
        }
    };

    const handleStartEditSession = (...args) => {
        const event = args.find(arg => arg && (arg.nativeEvent || arg.target));
        if (event && event.stopPropagation) event.stopPropagation();

        const validSession = args.find(arg => arg && typeof arg === 'object' && !arg.nativeEvent && !arg.target);
        if (validSession) {
            setEditingSession({ ...validSession, name: validSession.name === 'Thống kê tự động' ? '' : validSession.name });
        }
    };

    const handleStartSync = (...args) => {
        const validRow = args.find(arg => arg && typeof arg === 'object' && !arg.nativeEvent && !arg.target);
        if (validRow) {
            setSyncRow({ ...validRow });
        }
    };

    // Các hàm không bị lỗi (do gọi bằng String/ID thay vì Object)
    const handleCreateAutoSession = async () => { if (!canEdit || isProcessingCreate) return; setIsProcessingCreate(true); try { const res = await axios.post(`${API_URL}/sessions`, { name: 'Thống kê tự động', start_date: getTodayString() }); await fetchDashboard(); if(res.data && res.data.id) fetchDetail(res.data.id); } catch (err) {} finally { setIsProcessingCreate(false); } };
    
    const handleDeleteSession = (...args) => { 
        const event = args.find(arg => arg && (arg.nativeEvent || arg.target));
        if (event && event.stopPropagation) event.stopPropagation();
        const validId = args.find(arg => typeof arg === 'string' || typeof arg === 'number');
        if (validId) { setDeleteId(validId); setShowDeleteModal(true); }
    };

    const confirmDeleteSession = async () => { if (!deleteId) return; try { await axios.delete(`${API_URL}/sessions/${deleteId}`); fetchDashboard(); setShowDeleteModal(false); setDeleteId(null); } catch(err) {} };
    
    const handleDeleteRow = (...args) => { 
        const validId = args.find(arg => typeof arg === 'string' || typeof arg === 'number');
        if (validId) { setRowToDelete(validId); setShowDeleteRowModal(true); }
    };

    const confirmDeleteRow = async () => { const id = rowToDelete; if (!id || isProcessingDelete) return; setIsProcessingDelete(true); setRowToDelete(null); try { await axios.delete(`${API_URL}/daily/${id}`); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setShowDeleteRowModal(false); } catch (err) { setShowDeleteRowModal(false); } finally { setIsProcessingDelete(false); } };
    
    const updateSessionField = async (field, value) => { if(!canEdit || !detailData) return; const newData = { ...detailData, [field]: value }; setDetailData(newData); try { await axios.put(`${API_URL}/sessions/${currentId}`, { [field]: value }); } catch (err) {} };

    const handleAddBale = async (e) => { 
        e.preventDefault(); if(!canEdit) return; const cost = parseInput(baleCost); const qty = parseInput(baleQty); if(!baleName || cost === 0) return; 
        try { 
            const res = await axios.post(`${API_URL}/bales`, { session_id: currentId, name: baleName, cost: cost, qty: qty }); 
            const updated = [...(Array.isArray(importedBales) ? importedBales : []), res.data]; setImportedBales(updated); 
            const newCost = updated.reduce((sum, b) => sum + (b.cost || 0), 0); const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
            setBaleName(''); setBaleCost(''); setBaleQty(''); 
        } catch (err) {} 
    };

    const handleDeleteBale = async (id) => { 
        if(!canDelete) return; 
        try { 
            await axios.delete(`${API_URL}/bales/${id}`); 
            const safeBales = Array.isArray(importedBales) ? importedBales : []; const updated = safeBales.filter(b => b._id !== id); setImportedBales(updated); 
            const newCost = updated.reduce((sum, b) => sum + (b.cost || 0), 0); const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
        } catch (err) {} 
    };

    const handleAddItem = async (e) => { 
        e.preventDefault(); if (!canEdit || isProcessingAdd) return; setIsProcessingAdd(true);
        try { await axios.post(`${API_URL}/daily`, { session_id: currentId, ten_san_pham: newItem.ten_san_pham, link_san_pham: newItem.link_san_pham, ngay_ban: newItem.ngay_ban, so_luong_nhap: parseInput(newItem.so_luong_nhap), so_luong: parseInput(newItem.so_luong), so_tien_ban_duoc: parseInput(newItem.so_tien_ban_duoc), updatedAt: new Date().toISOString() }); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setNewItem({ ten_san_pham: '', link_san_pham: '', so_luong: '', so_luong_nhap: '', so_tien_ban_duoc: '', ngay_ban: getTodayString() }); } catch (err) {} finally { setIsProcessingAdd(false); }
    };
    
    const handleSaveEdit = async () => { 
        if (!editingRow || isProcessingEdit) return; setIsProcessingEdit(true); 
        try { const updatedRow = { ...editingRow, so_luong_nhap: parseInput(editingRow.so_luong_nhap), so_luong: parseInput(editingRow.so_luong), so_tien_ban_duoc: parseInput(editingRow.so_tien_ban_duoc), updatedAt: new Date().toISOString() }; await axios.put(`${API_URL}/daily/${updatedRow.id}`, updatedRow); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setEditingRow(null); } catch (err) {} finally { setIsProcessingEdit(false); } 
    };

    useEffect(() => {
        if (typeof syncText !== 'string' || !syncText.trim()) { setSyncManualQty(''); setSyncManualRev(''); return; }
        const { q, r } = parseIGSyncText(syncText);
        setSyncManualQty(q > 0 ? q.toString() : ''); setSyncManualRev(r > 0 ? r.toString() : (q > 0 ? '0' : '0'));
    }, [syncText]);

    const handleConfirmSync = async () => {
        if (!syncRow || isProcessingEdit) return; setIsProcessingEdit(true);
        try {
            const newQty = syncManualQty !== '' ? parseInput(syncManualQty) : (Number(syncRow.so_luong) || 0);
            const newRev = syncManualRev !== '' ? parseInput(syncManualRev) : (Number(syncRow.so_tien_ban_duoc) || 0);
            const updatedRow = { ...syncRow, so_luong: newQty, so_tien_ban_duoc: newRev, updatedAt: new Date().toISOString() };
            await axios.put(`${API_URL}/daily/${syncRow.id}`, updatedRow); 
            const freshRes = await axios.get(`${API_URL}/data/${currentId}`); 
            if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); 
            setSyncRow(null); setSyncText(''); setSyncManualQty(''); setSyncManualRev('');
        } catch (err) {} finally { setIsProcessingEdit(false); }
    };

    const handleSaveSession = async () => { 
        if (!editingSession) return; 
        try { 
            const newKien = parseInput(editingSession.so_tien_cua_kien); const newGiatUi = Math.round(newKien * 0.04);
            await axios.put(`${API_URL}/sessions/${editingSession.id}`, { name: editingSession.name || 'Thống kê tự động', end_date: editingSession.end_date, so_tien_cua_kien: newKien, so_tien_giat_ui: newGiatUi }); 
            await fetchDashboard(); 
            if (view === 'DETAIL' && currentId === editingSession.id) fetchDetail(currentId); 
            setEditingSession(null); 
        } catch (err) {} 
    };
    
    const handleBack = () => { 
        if (window.history.state) { window.history.back(); } 
        else { handleNavigate('DASHBOARD'); fetchDashboard(); setDetailData(null); setImportedBales([]); }
    };

    // TÍNH TOÁN DỮ LIỆU
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const enrichedSessions = safeSessions.map(ss => {
        const autoAdCost = ss.quang_cao || 0; 
        const computedGiatUi = Math.round((ss.so_tien_cua_kien || 0) * 0.04); 
        const realProfit = (ss.tong_doanh_thu || 0) - (ss.so_tien_cua_kien || 0) - computedGiatUi - autoAdCost;
        return { ...ss, autoAdCost, realProfit, computedGiatUi };
    });

    let dashboardProfit = 0, totalRevenueForTax = 0, taxAmount = 0, showTax = false, displayRevenueTr = 0, globalTongNhap = 0, globalTongBan = 0, globalVonTon = 0, globalTongCon = 0;
    try {
        const completedSessions = enrichedSessions.filter(ss => ss.is_completed === true);
        const gStats = calculateGlobalStats(completedSessions) || {};
        dashboardProfit = gStats.dashboardProfit || 0; totalRevenueForTax = gStats.totalRevenueForTax || 0; taxAmount = gStats.taxAmount || 0; showTax = gStats.showTax || false; displayRevenueTr = gStats.displayRevenueTr || 0; globalTongNhap = gStats.globalTongNhap || 0; globalTongBan = gStats.globalTongBan || 0; globalVonTon = gStats.globalVonTon || 0; globalTongCon = gStats.globalTongCon || 0;
    } catch(e) {}

    let detailProfit = 0, mvpRowId = null, enrichedDaily = [], detailAutoAdCost = 0, actualStartDate = null, actualEndDate = null, dynamicTarget = 0, isTargetReached = false;
    try {
        const dStats = calculateDetailStats(detailData, importedBales, AD_COST_PER_SALE) || {};
        detailProfit = dStats.detailProfit || 0; mvpRowId = dStats.mvpRowId || null; enrichedDaily = Array.isArray(dStats.enrichedDaily) ? dStats.enrichedDaily : []; detailAutoAdCost = dStats.detailAutoAdCost || 0; actualStartDate = dStats.actualStartDate || null; actualEndDate = dStats.actualEndDate || null; dynamicTarget = dStats.dynamicTarget || 0; isTargetReached = dStats.isTargetReached || false;
    } catch(e) {}

    const progressPercent = dynamicTarget > 0 ? Math.min(Math.max((detailProfit / dynamicTarget) * 100, 0), 100) : 0;

    useEffect(() => {
        if (view === 'DETAIL' && isTargetReached) { setShowFireworks(true); const t = setTimeout(() => setShowFireworks(false), 5500); return () => clearTimeout(t); } 
        else { setShowFireworks(false); }
    }, [view, isTargetReached, currentId]);

    const handleExport = () => { 
        if (!canExportExcel) { showToast("Tính năng Xuất Excel báo cáo chỉ dành cho gói VVIP (100k) và PREMIUM!", "error"); return; }
        if (!detailData) return; let csv = "STT,Ngay Ban,Ten San Pham,Link SP,SL Nhap,SL Ban,SL Con,Von Uoc Tinh,Doanh Thu,So Tien Loi\n"; 
        enrichedDaily.forEach((row) => { csv += `${row.stt || ''},${formatDateDisplay(row.ngay_ban)},"${row.ten_san_pham || ''}","${row.link_san_pham || ''}",${row.sl_nhap},${row.so_luong || 0},${row.sl_con},${row.tien_ton},${Math.round(row.so_tien_ban_duoc || 0)},${row.loi}\n`; }); 
        csv += `\n,,,,,,,,,TONG LOI: ${Math.round(detailProfit)}\n`; saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${getSessionName(detailData.name, actualStartDate, actualEndDate)}.csv`); 
    };

    if (!authUser || isExpiredState) {
        return <Auth onLoginSuccess={(u, rememberMe) => { setAuthUser(u); if (rememberMe) { localStorage.setItem('authUser', JSON.stringify(u)); sessionStorage.removeItem('authUser'); } else { sessionStorage.setItem('authUser', JSON.stringify(u)); localStorage.removeItem('authUser'); } }} expiredEmail={isExpiredState ? authUser?.email : null} onLogout={handleLogout} />;
    }

    // ============================================================================
    // GIAO DIỆN CHÍNH
    // ============================================================================
    return (
        <div className="flex h-screen w-full bg-[#f4f7fa] overflow-hidden font-sans text-[#1D1D1F] selection:bg-[#26D0CE]/30 relative">
            {showFireworks && <Confetti />}
            <Toast toast={toast} />
            <BlockModal blockModal={blockModal} />

            <style dangerouslySetInnerHTML={{ __html: `
                .tabular-nums { font-variant-numeric: tabular-nums; }
                .liquid-glass { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(24px) saturate(150%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 8px 32px rgba(0,0,0,0.05); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
            `}} />

            <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#e0f2fe] to-[#87CEEB] pointer-events-none overflow-hidden opacity-40">
                <div className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-white/20 rounded-[43%] animate-[spin_12s_linear_infinite] -bottom-[180vw] sm:-bottom-[130vw] left-1/2 -translate-x-1/2"></div>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.03)] transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex-shrink-0`}>
                <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm bg-white overflow-hidden shrink-0 border border-gray-100">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-black text-[16px] text-gray-800 leading-tight truncate">Dolphin_97ers</h2>
                            <p className="text-[11px] font-bold text-gray-500 truncate">Chào, {authUser?.name || 'bạn'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
                    {canEdit && (
                        <div className="mb-2">
                            <button 
                                onClick={handleCreateAutoSession} disabled={isProcessingCreate}
                                className="w-full bg-[#26D0CE] hover:bg-[#1DB2A0] text-white px-4 py-3.5 rounded-[16px] font-bold text-[14px] tracking-wide shadow-[0_8px_20px_rgba(38,208,206,0.25)] hover:shadow-[0_10px_25px_rgba(38,208,206,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessingCreate ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />}
                                <span>TẠO THỐNG KÊ</span>
                            </button>
                        </div>
                    )}

                    <div>
                        <p className="px-3 mb-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tổng quan</p>
                        <button onClick={() => handleNavigate('DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'DASHBOARD' || view === 'DETAIL' ? 'bg-blue-50 text-[#1A5B82] font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                            <LayoutDashboard size={20} className={view === 'DASHBOARD' || view === 'DETAIL' ? 'text-[#1A5B82]' : 'text-gray-400'} />
                            <span className="text-[14px]">Thống kê</span>
                        </button>
                    </div>

                    {isAdmin && (
                        <div>
                            <p className="px-3 mb-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">Quản lý</p>
                            <button onClick={() => handleNavigate('USERS')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'USERS' ? 'bg-blue-50 text-[#1A5B82] font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                                <Users size={20} className={view === 'USERS' ? 'text-[#1A5B82]' : 'text-gray-400'} />
                                <span className="text-[14px]">Tài khoản</span>
                            </button>
                        </div>
                    )}

                    <div>
                        <p className="px-3 mb-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">Công việc</p>
                        <button onClick={() => handleNavigate('CALENDAR')} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${view === 'CALENDAR' ? 'bg-blue-50 text-[#1A5B82] font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                            <div className="flex items-center gap-3">
                                <CalendarDays size={20} className={view === 'CALENDAR' ? 'text-[#1A5B82]' : 'text-gray-400'} />
                                <span className="text-[14px]">Lịch cá nhân</span>
                            </div>
                            {pendingTasksCount > 0 && (
                                <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                    {pendingTasksCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 shrink-0">
                    {timeLeftDisplay && (
                        <div className="mb-4 px-2 flex items-center gap-2 text-[11px] font-bold text-amber-600 bg-amber-50 py-2 rounded-lg justify-center border border-amber-100">
                            <Clock size={14} /> {timeLeftDisplay}
                        </div>
                    )}
                    
                    <div className="flex justify-center">
                        <button onClick={handleLogout} className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-3 rounded-[14px] transition-colors w-full flex justify-center items-center gap-2 shadow-sm" title="Đăng xuất">
                            <LogOut size={20} strokeWidth={2.5}/>
                            <span className="font-bold text-[14px]">Đăng Xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <div className="flex-1 flex flex-col h-screen w-full relative z-10 overflow-hidden">
                <button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="md:hidden fixed top-4 left-4 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md text-[#1A5B82] border border-gray-200 active:scale-95 transition-all"
                >
                    <Menu size={24} />
                </button>

                <main className="flex-1 w-full overflow-y-auto custom-scrollbar p-3 pt-16 sm:p-6 md:pt-6 pb-24 relative z-10">
                    <ErrorBoundary>
                        <div className="w-full max-w-[1600px] mx-auto space-y-6">
                            
                            {view === 'DASHBOARD' && (
                                <DashboardView 
                                    activeTab={activeTab} dashboardProfit={dashboardProfit} globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} showTax={showTax} taxAmount={taxAmount} displayRevenueTr={displayRevenueTr} totalRevenueForTax={totalRevenueForTax} safeSessions={safeSessions} enrichedSessions={enrichedSessions} fetchDetail={fetchDetail} isAdmin={isAdmin} canEdit={canEdit} canDelete={canDelete} canPay={canPay} 
                                    
                                    setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal}
                                    
                                    // Trả về đúng tên gọi gốc, loại bỏ hết các alias gây nhiễu
                                    handleStartEditSession={handleStartEditSession}
                                    handleDeleteSession={handleDeleteSession}
                                />
                            )}
                            
                            {view === 'DETAIL' && detailData && (
                                <DetailView 
                                    detailData={detailData} handleBack={handleBack} handleExport={handleExport} actualStartDate={actualStartDate} actualEndDate={actualEndDate}
                                    isTargetReached={isTargetReached} detailProfit={detailProfit} dynamicTarget={dynamicTarget} progressPercent={progressPercent} detailAutoAdCost={detailAutoAdCost}
                                    canEdit={canEdit} canDelete={canDelete} handleAddBale={handleAddBale} baleName={baleName} setBaleName={setBaleName} baleCost={baleCost} setBaleCost={setBaleCost}
                                    baleQty={baleQty} setBaleQty={setBaleQty} importedBales={importedBales} handleDeleteBale={handleDeleteBale} updateSessionField={updateSessionField} handleAddItem={handleAddItem}
                                    newItem={newItem} setNewItem={setNewItem} isProcessingAdd={isProcessingAdd} enrichedDaily={enrichedDaily} mvpRowId={mvpRowId} 
                                    
                                    // Trả về đúng tên gọi gốc
                                    handleStartEdit={handleStartEdit}
                                    handleStartSync={handleStartSync}
                                    handleDeleteRow={handleDeleteRow}

                                    isProcessingEdit={isProcessingEdit} isProcessingDelete={isProcessingDelete} 
                                />
                            )}

                            {view === 'USERS' && isAdmin && ( 
                                <AdminPanel setView={handleNavigate} authUser={authUser} /> 
                            )}

                            {view === 'CALENDAR' && ( 
                                <PersonalCalendar 
                                    sessions={enrichedSessions} 
                                    onUpdatePendingCount={setPendingTasksCount} 
                                />
                            )}

                        </div>
                    </ErrorBoundary>
                </main>
            </div>

            <ChatBox authUser={authUser} />

            {/* HIỂN THỊ CÁC MODAL THEO CÁCH NGUYÊN BẢN CHUẨN XÁC VÀ BƠM THÊM CÁC TÙY CHỌN DỰ PHÒNG CHỐNG ẨN */}
            {showDeleteModal && <DeleteSessionModal onConfirm={confirmDeleteSession} onCancel={() => setShowDeleteModal(false)} isProcessing={isProcessingDelete} />}
            {showDeleteRowModal && <DeleteRowModal onConfirm={confirmDeleteRow} onCancel={() => setShowDeleteRowModal(false)} isProcessing={isProcessingDelete} />}
            
            {editingRow && (
                <EditRowModal 
                    row={editingRow} data={editingRow} item={editingRow} 
                    isOpen={true} show={true} visible={true} 
                    setRow={setEditingRow} onSave={handleSaveEdit} onCancel={() => setEditingRow(null)} isProcessing={isProcessingEdit} 
                />
            )}
            
            {editingSession && (
                <EditSessionModal 
                    session={editingSession} data={editingSession} item={editingSession} 
                    isOpen={true} show={true} visible={true} 
                    setSession={setEditingSession} onSave={handleSaveSession} onCancel={() => setEditingSession(null)} isProcessing={isProcessingEdit} 
                />
            )}
            
            {syncRow && <SyncModal syncRow={syncRow} setSyncRow={setSyncRow} syncText={syncText} setSyncText={setSyncText} syncManualQty={syncManualQty} setSyncManualQty={setSyncManualQty} syncManualRev={syncManualRev} setSyncManualRev={setSyncManualRev} onConfirm={handleConfirmSync} isProcessing={isProcessingEdit} />}
            {showSalaryModal && <SalaryModal session={salarySession} onClose={() => { setShowSalaryModal(false); setSalarySession(null); }} isAdmin={isAdmin} />}

        </div>
    );
}