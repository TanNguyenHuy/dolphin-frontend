import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { createPortal } from 'react-dom';

import { LayoutDashboard, Users, CalendarDays, LogOut, Menu, Plus, Clock, RefreshCw, Settings } from 'lucide-react';

import Auth from './Auth';
import ChatBox from './components/ChatBox';
import Toast from './components/Toast';
import SettingsView from './components/SettingsView';
import { settingsKey, readSettings, writeSettings, appearanceVariables } from './settings';
import useToast from './hooks/useToast';
import { readAuthUser, readStoredText, writeStoredText } from './lib/browserStorage';
import { buildSessionSummary } from './lib/sessionSummary';
import MotionProvider from './components/motion/MotionProvider';
import { AppearanceContext } from './components/appearance/AppearanceContext';

import SyncModal from './components/modals/SyncModal';
import EditRowModal from './components/modals/EditRowModal';
import EditSessionModal from './components/modals/EditSessionModal';
import DeleteSessionModal from './components/modals/DeleteSessionModal';
import DeleteRowModal from './components/modals/DeleteRowModal';
import SalaryModal from './components/modals/SalaryModal';
import BlockModal from './components/modals/BlockModal';

import { API_URL, AD_COST_PER_SALE, parseInput, formatDateDisplay, getSessionName, getTodayString, Confetti } from './utils';
import { parseIGSyncText, calculateGlobalStats, calculateDetailStats, calculateProfitTarget } from './logic';


const AdminPanel = lazy(() => import('./components/AdminPanel'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const DetailView = lazy(() => import('./components/DetailView'));
const PersonalCalendar = lazy(() => import('./components/dashboard/PersonalCalendar'));

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Crash:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 md:p-10 bg-[#FFF5F5] border-2 border-red-200 rounded-[32px] shadow-2xl max-w-5xl mx-auto mt-20 relative z-50">
                    <h2 className="text-[24px] font-black text-red-600 mb-4 uppercase">🚨 Hệ thống phát hiện Crash!</h2>
                    <div className="bg-white p-5 rounded-2xl overflow-x-auto text-[13px] font-mono text-red-800 border border-red-100 shadow-inner max-h-[300px] overflow-y-auto">
                        <strong className="text-red-600 text-[15px]">{this.state.error?.toString()}</strong>
                        <br/><br/>{this.state.errorInfo?.componentStack}
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-8 bg-red-500 text-white font-bold py-3 px-8 rounded-xl shadow-md">Tải lại trang</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    const [authUser, setAuthUser] = useState(readAuthUser);

    const preferenceKey = settingsKey(authUser);
    const [savedPreferences, setSavedPreferences] = useState({});
    const preferences = useMemo(() => savedPreferences[preferenceKey] || readSettings(preferenceKey), [preferenceKey, savedPreferences]);
    const savePreferences = (draft) => {
        const saved = writeSettings(preferenceKey, draft);
        setSavedPreferences(previous => ({ ...previous, [preferenceKey]: saved }));
        return saved;
    };
    useEffect(() => {
        document.documentElement.dataset.dolphinMotion = preferences.reduceMotion ? 'reduced' : 'normal';
        const variables = appearanceVariables(preferences);
        Object.entries(variables).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
        return () => {
            delete document.documentElement.dataset.dolphinMotion;
            Object.keys(variables).forEach(name => document.documentElement.style.removeProperty(name));
        };
    }, [preferences]);

    const [view, setView] = useState('DASHBOARD');
    const [sessions, setSessions] = useState([]);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [dashboardError, setDashboardError] = useState('');
    const dashboardRequest = useRef(0);
    const detailRequest = useRef(0);
    const [currentId, setCurrentId] = useState(null);
    const [detailData, setDetailData] = useState(null);

    const mainRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [showDeleteRowModal, setShowDeleteRowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    const [editingRow, setEditingRow] = useState(null);
    const [editingSession, setEditingSession] = useState(null);
    const [syncRow, setSyncRow] = useState(null);

    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [salarySession, setSalarySession] = useState(null);

    const [syncText, setSyncText] = useState('');
    const [syncManualQty, setSyncManualQty] = useState('');
    const [syncManualRev, setSyncManualRev] = useState('');
    const [isProcessingCreate, setIsProcessingCreate] = useState(false);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [isProcessingAdd, setIsProcessingAdd] = useState(false);
    const [isProcessingEdit, setIsProcessingEdit] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);

    const [momoPhone, setMomoPhone] = useState(() => readStoredText('momoPhone'));
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
    const [blockModal] = useState({ show: false, message: '' });
    const { toast, showToast } = useToast();

    useEffect(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [view, currentId]);

    const handleNavigate = (newView) => {
        detailRequest.current++;
        setIsLoadingDetail(false);
        if (view !== newView) {
            window.history.pushState({ view: newView }, '');
            setView(newView);
        }
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        if (!authUser || authUser.role === 'admin' || authUser.plan === 'premium' || !authUser.planExpiry) { setIsExpiredState(false); setTimeLeftDisplay(''); return; }
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

    useEffect(() => { writeStoredText('momoPhone', momoPhone); }, [momoPhone]);

    const handleLogout = () => { dashboardRequest.current++; detailRequest.current++; setSessions([]); setDetailData(null); setImportedBales([]); setAuthUser(null); localStorage.removeItem('authUser'); sessionStorage.removeItem('authUser'); handleNavigate('DASHBOARD'); setDetailData(null); setIsExpiredState(false); };

    const fetchDashboard = useCallback(async () => {
        const request = ++dashboardRequest.current;
        setIsLoadingDashboard(true);
        setDashboardError('');
        try {
            const { data } = await axios.get(`${API_URL}/sessions`);
            if (!Array.isArray(data)) throw new Error('Invalid session response');
            const summaries = await Promise.all(data.map(async (session, originalIndex) => {
                const [detail, bales] = await Promise.all([
                    axios.get(`${API_URL}/data/${session.id}`),
                    axios.get(`${API_URL}/bales/${session.id}`),
                ]);
                return { ...buildSessionSummary(session, detail.data, bales.data, AD_COST_PER_SALE), originalIndex };
            }));
            summaries.sort((a, b) => new Date(b.actual_start_date) - new Date(a.actual_start_date) || b.originalIndex - a.originalIndex);
            if (request === dashboardRequest.current) setSessions(summaries);
        } catch {
            if (request === dashboardRequest.current) setDashboardError('Không tải được thống kê. Kiểm tra kết nối và thử lại.');
        } finally {
            if (request === dashboardRequest.current) setIsLoadingDashboard(false);
        }
    }, []);

    const fetchDetail = useCallback(async (id, { navigate = true } = {}) => {
        if (!canViewDetail) { showToast('Gói của bạn không hỗ trợ xem chi tiết!', 'error'); return; }
        const request = ++detailRequest.current;
        setIsLoadingDetail(true);
        try {
            const [detail, bales] = await Promise.all([
                axios.get(`${API_URL}/data/${id}`),
                axios.get(`${API_URL}/bales/${id}`),
            ]);
            if (!detail.data || typeof detail.data !== 'object' || Array.isArray(detail.data)) throw new Error('Invalid detail response');
            if (request !== detailRequest.current) return;
            setDetailData({ ...detail.data, daily: Array.isArray(detail.data.daily) ? detail.data.daily : [] });
            setImportedBales(Array.isArray(bales.data) ? bales.data : []);
            setCurrentId(id);
            if (navigate) window.history.pushState({ view: 'DETAIL', id }, '');
            setView('DETAIL');
            setIsSidebarOpen(false);
        } catch {
            if (request === detailRequest.current) {
                showToast('Không tải được chi tiết. Vui lòng thử lại.', 'error');
                if (!navigate) setView('DASHBOARD');
            }
        } finally {
            if (request === detailRequest.current) setIsLoadingDetail(false);
        }
    }, [canViewDetail, showToast]);

    useEffect(() => {
        if (authUser) fetchDashboard();
        return () => { dashboardRequest.current++; detailRequest.current++; };
    }, [authUser, fetchDashboard]);

    useEffect(() => { window.history.replaceState({ view: 'DASHBOARD' }, ''); }, []);

    useEffect(() => {
        const handlePopState = event => {
            const destination = event.state?.view || 'DASHBOARD';
            detailRequest.current++;
            setIsLoadingDetail(false);
            setIsSidebarOpen(false);
            if (destination === 'DETAIL' && event.state?.id) {
                fetchDetail(event.state.id, { navigate: false });
            } else {
                setView(destination);
                if (destination === 'DASHBOARD' && authUser) fetchDashboard();
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [authUser, fetchDashboard, fetchDetail]);


    const handleStartEditSession = useCallback((e, session) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setEditingSession({ ...session, name: session.name === 'Thống kê tự động' ? '' : session.name });
    }, []);

    const handleDeleteSession = useCallback((e, id) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setDeleteId(id);
        setShowDeleteModal(true);
    }, []);

    const handleStartEdit = useCallback((row) => {
        setEditingRow({ ...row });
    }, []);

    const handleDeleteRow = useCallback((id) => {
        setRowToDelete(id);
        setShowDeleteRowModal(true);
    }, []);

    const handleStartSync = useCallback((row) => {
        setSyncRow({ ...row });
    }, []);


    const refreshDetail = async () => {
        const request = detailRequest.current;
        const { data } = await axios.get(`${API_URL}/data/${currentId}`);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid detail response');
        if (request === detailRequest.current) setDetailData({ ...data, daily: Array.isArray(data.daily) ? data.daily : [] });
    };

    const handleCreateAutoSession = async () => {
        if (!canEdit || isProcessingCreate) return;
        setIsProcessingCreate(true);
        try {
            const { data } = await axios.post(`${API_URL}/sessions`, { name: 'Thống kê tự động', start_date: getTodayString() });
            await fetchDashboard();
            if (data?.id) await fetchDetail(data.id);
        } catch { showToast('Không tạo được đợt bán. Vui lòng thử lại.', 'error'); }
        finally { setIsProcessingCreate(false); }
    };

    const confirmDeleteSession = async () => {
        if (!canDelete || !deleteId || isProcessingDelete) return;
        setIsProcessingDelete(true);
        try {
            await axios.delete(`${API_URL}/sessions/${deleteId}`);
            await fetchDashboard();
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch { showToast('Không xóa được đợt bán. Vui lòng thử lại.', 'error'); }
        finally { setIsProcessingDelete(false); }
    };

    const confirmDeleteRow = async () => {
        if (!canDelete || !rowToDelete || isProcessingDelete) return;
        setIsProcessingDelete(true);
        try {
            await axios.delete(`${API_URL}/daily/${rowToDelete}`);
            await refreshDetail();
            setShowDeleteRowModal(false);
            setRowToDelete(null);
        } catch { showToast('Không xóa được sản phẩm. Vui lòng thử lại.', 'error'); }
        finally { setIsProcessingDelete(false); }
    };

    const updateSessionField = async (field, value) => {
        if (!canEdit || !detailData) return;
        try {
            await axios.put(`${API_URL}/sessions/${currentId}`, { [field]: value });
            setDetailData(previous => ({ ...previous, [field]: value }));
            showToast('Đã cập nhật đợt bán.');
        } catch { showToast('Không lưu được thay đổi. Vui lòng thử lại.', 'error'); }
    };

    const handleAddBale = async (e) => {
        e.preventDefault(); if(!canEdit) return; const cost = parseInput(baleCost); const qty = parseInput(baleQty); if (!baleName.trim() || cost <= 0 || qty <= 0) { showToast('Nhập tên lô hàng, giá vốn và số lượng lớn hơn 0.', 'error'); return; }
        try {
            const res = await axios.post(`${API_URL}/bales`, { session_id: currentId, name: baleName, cost: cost, qty: qty });
            const updated = [...(Array.isArray(importedBales) ? importedBales : []), res.data]; setImportedBales(updated);
            const newCost = updated.reduce((sum, b) => sum + (Number(b.cost) || 0), 0); const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
            setBaleName(''); setBaleCost(''); setBaleQty('');
        } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); }
    };

    const handleDeleteBale = async (id) => {
        if(!canDelete) return;
        try {
            await axios.delete(`${API_URL}/bales/${id}`);
            const safeBales = Array.isArray(importedBales) ? importedBales : []; const updated = safeBales.filter(b => b._id !== id); setImportedBales(updated);
            const newCost = updated.reduce((sum, b) => sum + (Number(b.cost) || 0), 0); const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
        } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); }
    };

    const handleAddItem = async (e) => {
        e.preventDefault(); if (!canEdit || isProcessingAdd) return; setIsProcessingAdd(true);
        try { await axios.post(`${API_URL}/daily`, { session_id: currentId, ten_san_pham: newItem.ten_san_pham, link_san_pham: newItem.link_san_pham, ngay_ban: newItem.ngay_ban, so_luong_nhap: parseInput(newItem.so_luong_nhap), so_luong: parseInput(newItem.so_luong), so_tien_ban_duoc: parseInput(newItem.so_tien_ban_duoc), updatedAt: new Date().toISOString() }); await refreshDetail(); setNewItem({ ten_san_pham: '', link_san_pham: '', so_luong: '', so_luong_nhap: '', so_tien_ban_duoc: '', ngay_ban: getTodayString() }); } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); } finally { setIsProcessingAdd(false); }
    };

    const handleSaveEdit = async () => {
        if (!canEdit || !editingRow || isProcessingEdit) return; setIsProcessingEdit(true);
        try { const updatedRow = { ...editingRow, so_luong_nhap: parseInput(editingRow.so_luong_nhap), so_luong: parseInput(editingRow.so_luong), so_tien_ban_duoc: parseInput(editingRow.so_tien_ban_duoc), updatedAt: new Date().toISOString() }; await axios.put(`${API_URL}/daily/${updatedRow.id}`, updatedRow); await refreshDetail(); setEditingRow(null); } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); } finally { setIsProcessingEdit(false); }
    };

    useEffect(() => {
        if (typeof syncText !== 'string' || !syncText.trim()) { setSyncManualQty(''); setSyncManualRev(''); return; }
        const { q, r } = parseIGSyncText(syncText);
        setSyncManualQty(q > 0 ? q.toString() : ''); setSyncManualRev(String(r));
    }, [syncText]);

    const handleConfirmSync = async () => {
        if (!canEdit || !syncRow || isProcessingEdit) return; setIsProcessingEdit(true);
        try {
            const newQty = syncManualQty !== '' ? parseInput(syncManualQty) : (Number(syncRow.so_luong) || 0);
            const newRev = syncManualRev !== '' ? parseInput(syncManualRev) : (Number(syncRow.so_tien_ban_duoc) || 0);
            const updatedRow = { ...syncRow, so_luong: newQty, so_tien_ban_duoc: newRev, updatedAt: new Date().toISOString() };
            await axios.put(`${API_URL}/daily/${syncRow.id}`, updatedRow);
            await refreshDetail();
            setSyncRow(null); setSyncText(''); setSyncManualQty(''); setSyncManualRev('');
        } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); } finally { setIsProcessingEdit(false); }
    };

    const handleSaveSession = async () => {
        if (!canEdit || !editingSession) return;
        try {
            const newKien = parseInput(editingSession.so_tien_cua_kien); const newGiatUi = Math.round(newKien * 0.04);
            await axios.put(`${API_URL}/sessions/${editingSession.id}`, { name: editingSession.name || 'Thống kê tự động', end_date: editingSession.end_date, so_tien_cua_kien: newKien, so_tien_giat_ui: newGiatUi });
            await fetchDashboard();
            if (view === 'DETAIL' && currentId === editingSession.id) fetchDetail(currentId, { navigate: false });
            setEditingSession(null);
        } catch { showToast('Không thể hoàn tất thao tác. Kiểm tra kết nối và thử lại.', 'error'); }
    };

    const handleBack = () => {
        if (window.history.state) { window.history.back(); }
        else { handleNavigate('DASHBOARD'); fetchDashboard(); setDetailData(null); setImportedBales([]); }
    };

    const enrichedSessions = useMemo(() => sessions.map(session => {
        const autoAdCost = Number(session.quang_cao) || 0;
        const cost = Number(session.so_tien_cua_kien) || 0;
        const computedGiatUi = Math.round(cost * 0.04);
        return { ...session, autoAdCost, computedGiatUi, realProfit: (Number(session.tong_doanh_thu) || 0) - cost - computedGiatUi - autoAdCost };
    }), [sessions]);
    const { taxAmount, globalTongNhap, globalVonTon, globalTongCon } = useMemo(
        () => calculateGlobalStats(enrichedSessions.filter(session => session.is_completed === true)), [enrichedSessions],
    );
    const { detailProfit, mvpRowId, enrichedDaily, detailAutoAdCost, actualStartDate, actualEndDate } = useMemo(
        () => calculateDetailStats(detailData, importedBales, AD_COST_PER_SALE), [detailData, importedBales],
    );

    const { dynamicTarget, targetSession, isTargetReached, progressPercent } = useMemo(
        () => calculateProfitTarget(enrichedSessions, detailData, detailProfit), [enrichedSessions, detailData, detailProfit],
    );

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

    return (
        <AppearanceContext.Provider value={preferences}>
        <MotionProvider reduced={preferences.reduceMotion}>
        <div data-dolphin-theme={preferences.theme} data-layout={preferences.layout} data-density={preferences.density} data-lunar={preferences.showLunar} className="dolphin-app flex h-screen w-full bg-[#f4f7fa] overflow-hidden font-sans text-[#1D1D1F] selection:bg-[#26D0CE]/30 relative">
            {showFireworks && !preferences.reduceMotion && <Confetti />}
            <Toast toast={toast} />
            <BlockModal blockModal={blockModal} />

            <div className="dolphin-background fixed inset-0 z-0 bg-gradient-to-b from-[#e0f2fe] to-[#87CEEB] pointer-events-none overflow-hidden opacity-40">
                <div className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-white/20 rounded-[43%] animate-[spin_45s_linear_infinite] -bottom-[180vw] sm:-bottom-[130vw] left-1/2 -translate-x-1/2"></div>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.03)] transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex-shrink-0`}>
                <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm bg-white overflow-hidden shrink-0 border border-gray-100">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                        <div className="min-w-0">
                            <h2 title={preferences.storeName} className="font-black text-[16px] text-gray-800 leading-tight truncate">{preferences.storeName}</h2>
                            <p className="text-[11px] font-bold text-gray-500 truncate">Chào, {authUser?.name || 'bạn'}</p>
                            {preferences.contactPhone && <p className="text-[11px] text-gray-500 truncate" title={preferences.contactPhone}>{preferences.contactPhone}</p>}
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
                    <button type="button" onClick={() => handleNavigate('SETTINGS')} aria-current={view === 'SETTINGS' ? 'page' : undefined} className={`mb-3 w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'SETTINGS' ? 'bg-blue-50 text-[#1A5B82] font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                        <Settings size={20} />
                        <span className="text-[14px]">Cài đặt</span>
                    </button>
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

            <div className="app-workspace flex-1 flex flex-col h-screen w-full min-w-0 relative z-10 overflow-hidden">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md text-[#1A5B82] border border-gray-200 active:scale-95 transition-all"
                >
                    <Menu size={24} aria-label="Mở menu" />
                </button>

                <main ref={mainRef} className="dolphin-main flex-1 w-full overflow-y-auto custom-scrollbar p-3 pt-16 sm:p-6 md:pt-6 pb-24 relative z-10">
                    <Suspense fallback={<div role="status" className="loading-indicator">Đang mở trang…</div>}>
                    <ErrorBoundary>
                        <div className="w-full max-w-[1600px] mx-auto space-y-6">

                            {isLoadingDetail && <div role="status" className="loading-indicator"><RefreshCw size={16} className="animate-spin" /> Đang tải chi tiết…</div>}
                            {view === 'DASHBOARD' && isLoadingDashboard && (
                                <div role="status" aria-label="Đang tải thống kê" className="dashboard-skeleton grid gap-5 md:grid-cols-3">
                                    <span className="sr-only">Đang tải thống kê…</span>
                                    {[0, 1, 2].map(item => <div key={item} className="skeleton-panel h-40 rounded-3xl" />)}
                                    <div className="skeleton-panel h-80 rounded-3xl md:col-span-3" />
                                </div>
                            )}
                            {view === 'DASHBOARD' && dashboardError && !isLoadingDashboard && (
                                <div role="alert" className="bg-white border border-rose-100 rounded-3xl p-6 text-center">
                                    <p className="text-gray-700 mb-4">{dashboardError}</p>
                                    <button type="button" onClick={fetchDashboard} className="bg-teal-700 text-white rounded-xl px-5 py-3 font-bold">Thử lại</button>
                                </div>
                            )}
                            {view === 'DASHBOARD' && !isLoadingDashboard && !dashboardError && (
                                <DashboardView
                                    globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} taxAmount={taxAmount} enrichedSessions={enrichedSessions} fetchDetail={fetchDetail} canEdit={canEdit} canDelete={canDelete} canPay={canPay}

                                    setSalarySession={setSalarySession}
                                    setShowSalaryModal={setShowSalaryModal}
                                    handleStartEditSession={handleStartEditSession}
                                    handleDeleteSession={handleDeleteSession}
                                />
                            )}

                            {view === 'DETAIL' && detailData && (
                                <DetailView
                                    detailData={detailData} handleBack={handleBack} handleExport={handleExport} actualStartDate={actualStartDate} actualEndDate={actualEndDate}
                                    isTargetReached={isTargetReached} detailProfit={detailProfit} dynamicTarget={dynamicTarget} targetSession={targetSession} progressPercent={progressPercent} detailAutoAdCost={detailAutoAdCost}
                                    canEdit={canEdit} canDelete={canDelete} handleAddBale={handleAddBale} baleName={baleName} setBaleName={setBaleName} baleCost={baleCost} setBaleCost={setBaleCost}
                                    baleQty={baleQty} setBaleQty={setBaleQty} importedBales={importedBales} handleDeleteBale={handleDeleteBale} updateSessionField={updateSessionField} handleAddItem={handleAddItem}
                                    newItem={newItem} setNewItem={setNewItem} isProcessingAdd={isProcessingAdd} enrichedDaily={enrichedDaily} mvpRowId={mvpRowId}

                                    handleStartEdit={handleStartEdit}
                                    handleStartSync={handleStartSync}
                                    handleDeleteRow={handleDeleteRow}

                                    isProcessingEdit={isProcessingEdit} isProcessingDelete={isProcessingDelete}
                                />
                            )}

                            {view === 'SETTINGS' && (
                                <SettingsView key={preferenceKey} settings={preferences} onSave={savePreferences} onBack={() => handleNavigate('DASHBOARD')} />
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
                    </Suspense>
                </main>
            </div>

            {preferences.showChat && <ChatBox authUser={authUser} />}

            {/* CÁC MODAL HỆ THỐNG - ĐÃ ĐƯỢC BỌC ĐIỀU KIỆN HIỂN THỊ ĐỂ CHẮC CHẮN ĐÓNG ĐƯỢC */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {showDeleteModal && (
                        <DeleteSessionModal
                            showDeleteModal={showDeleteModal}
                            setShowDeleteModal={setShowDeleteModal}
                            confirmDeleteSession={confirmDeleteSession}
                        />
                    )}

                    {showDeleteRowModal && (
                        <DeleteRowModal
                            showDeleteRowModal={showDeleteRowModal}
                            setShowDeleteRowModal={setShowDeleteRowModal}
                            confirmDeleteRow={confirmDeleteRow}
                            isProcessingDelete={isProcessingDelete}
                        />
                    )}

                    {editingRow && (
                        <EditRowModal
                            editingRow={editingRow}
                            setEditingRow={setEditingRow}
                            handleSaveEdit={handleSaveEdit}
                            isProcessingEdit={isProcessingEdit}
                        />
                    )}

                    {editingSession && (
                        <EditSessionModal
                            editingSession={editingSession}
                            setEditingSession={setEditingSession}
                            handleSaveSession={handleSaveSession}
                        />
                    )}

                    {syncRow && (
                        <SyncModal
                            syncRow={syncRow}
                            setSyncRow={setSyncRow}
                            syncText={syncText}
                            setSyncText={setSyncText}
                            syncManualQty={syncManualQty}
                            setSyncManualQty={setSyncManualQty}
                            syncManualRev={syncManualRev}
                            setSyncManualRev={setSyncManualRev}
                            handleConfirmSync={handleConfirmSync}
                            isProcessingEdit={isProcessingEdit}
                        />
                    )}

                    {showSalaryModal && (
                        <SalaryModal
                            salarySession={salarySession}
                            setShowSalaryModal={setShowSalaryModal}
                            momoPhone={momoPhone}
                            setMomoPhone={setMomoPhone}
                        />
                    )}
                </>,
                document.body
            )}
        </div>
        </MotionProvider>
        </AppearanceContext.Provider>
    );
}
