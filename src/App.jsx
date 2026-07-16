import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

// Import các Component giao diện
import Auth from './Auth';
import AdminPanel from './components/AdminPanel';
import DashboardView from './components/DashboardView';
import DetailView from './components/DetailView';
import ChatBox from './components/ChatBox';
import Header from './components/Header';
import Toast from './components/Toast';

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

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        if (!authUser || authUser.role === 'admin' || authUser.plan === 'premium' || !authUser.planExpiry) {
            setIsExpiredState(false);
            return;
        }
        const checkExpiry = () => {
            const now = new Date();
            const exp = new Date(authUser.planExpiry);
            if (now >= exp) {
                if (!isExpiredState) setIsExpiredState(true);
            } else {
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
                    setBlockModal({ show: true, message: 'Tài khoản của bạn đã bị khóa hoặc mất quyền truy cập!' });
                    return;
                }
                
                if (
                    JSON.stringify(authUser.permissions) !== JSON.stringify(latestData.permissions) || 
                    authUser.role !== latestData.role || authUser.planExpiry !== latestData.planExpiry ||
                    authUser.plan !== latestData.plan || authUser.isApproved !== latestData.isApproved ||
                    authUser.isChatBanned !== latestData.isChatBanned || authUser.chatRestrictedUntil !== latestData.chatRestrictedUntil
                ) {
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

    const handleLogout = () => { setAuthUser(null); localStorage.removeItem('authUser'); sessionStorage.removeItem('authUser'); setView('DASHBOARD'); setDetailData(null); setIsExpiredState(false); };

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

                    ss.tong_sl_nhap = computedTongNhap;
                    ss.tong_sl_ban = computedTongBan;
                    ss.tong_doanh_thu = computedDoanhThu;
                    ss.quang_cao = dailyList.length * AD_COST_PER_SALE;

                    let balesData = []; try { balesData = (await axios.get(`${API_URL}/bales/${ss.id}`)).data; } catch(e) {}
                    const safeBalesData = Array.isArray(balesData) ? balesData : [];
                    const sortedBales = [...safeBalesData].sort((a,b) => String(b.name || '').length - String(a.name || '').length);
                    let computedVonTon = 0; let trungBinh = ss.tong_sl_nhap > 0 ? (ss.so_tien_cua_kien / ss.tong_sl_nhap) : 0;
                    
                    dailyList.forEach((row) => {
                        const matchedBale = sortedBales.find(b => String(row.ten_san_pham || '').toLowerCase().includes(String(b.name || '').toLowerCase()));
                        let sl_con = (Number(row.so_luong_nhap) || 0) - (Number(row.so_luong) || 0);
                        if (matchedBale) { computedVonTon += Math.round(sl_con * ((matchedBale.cost || 0) / (matchedBale.qty || 1))); } 
                        else { computedVonTon += Math.round(sl_con * trungBinh); }
                    });
                    ss.tong_tien_ton_computed = computedVonTon;
                    
                    const dates = dailyList.map(d => new Date(d.ngay_ban).getTime()).filter(t => !isNaN(t));
                    if (dates.length > 0) { 
                        ss.actual_start_date = new Date(Math.min(...dates)).toISOString().split('T')[0]; 
                        ss.actual_end_date = new Date(Math.max(...dates)).toISOString().split('T')[0]; 
                    } else { 
                        ss.actual_start_date = ss.start_date || getTodayString(); 
                        ss.actual_end_date = ss.end_date || ss.actual_start_date; 
                    }
                } catch(e) { ss.quang_cao = 0; ss.tong_tien_ton_computed = 0; ss.actual_start_date = ss.start_date || getTodayString(); ss.actual_end_date = ss.start_date || getTodayString(); }
                return ss;
            }));
            enrichedSessions.forEach((ss, idx) => ss.originalIndex = idx);
            enrichedSessions.sort((a, b) => {
                const dateA = new Date(a.actual_start_date || a.start_date || Date.now()).getTime();
                const dateB = new Date(b.actual_start_date || b.start_date || Date.now()).getTime();
                if (dateB === dateA) return b.originalIndex - a.originalIndex;
                return dateB - dateA;
            });
            setSessions(enrichedSessions); 
        } catch (err) {} 
    };

    const fetchDetail = async (id) => { 
        if (!canViewDetail) { showToast("Gói của bạn không hỗ trợ xem chi tiết. Vui lòng nâng cấp lên gói VIP hoặc cao hơn!", "error"); return; }
        try { 
            const res = await axios.get(`${API_URL}/data/${id}`); 
            let balesData = []; try { balesData = (await axios.get(`${API_URL}/bales/${id}`)).data; } catch(e) {}
            if(res.data) { 
                // BỌC ÁO GIÁP BẢO VỆ: Đảm bảo daily luôn là một mảng dù API có trả về undefined
                const safeData = { ...res.data, daily: Array.isArray(res.data.daily) ? res.data.daily : [] };
                setDetailData(safeData); 
                setImportedBales(Array.isArray(balesData) ? balesData : []); 
                setCurrentId(id); 
                setView('DETAIL'); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
        } catch (err) { showToast("Lỗi tải dữ liệu. Vui lòng thử lại.", "error"); } 
    };
    
    const handleCreateAutoSession = async () => { 
        if (!canEdit || isProcessingCreate) return; 
        setIsProcessingCreate(true); 
        try { 
            const res = await axios.post(`${API_URL}/sessions`, { name: 'Thống kê tự động', start_date: getTodayString() }); 
            await fetchDashboard(); 
            if(res.data && res.data.id) fetchDetail(res.data.id); 
        } catch (err) {} finally { setIsProcessingCreate(false); } 
    };

    const handleDeleteSession = (e, id) => { if(!canDelete) return; e.stopPropagation(); setDeleteId(id); setShowDeleteModal(true); };
    const confirmDeleteSession = async () => { if (!deleteId) return; try { await axios.delete(`${API_URL}/sessions/${deleteId}`); fetchDashboard(); setShowDeleteModal(false); setDeleteId(null); } catch(err) {} };
    const handleDeleteRow = (id) => { if (!canDelete) return; setRowToDelete(id); setShowDeleteRowModal(true); };
    const confirmDeleteRow = async () => { const id = rowToDelete; if (!id || isProcessingDelete) return; setIsProcessingDelete(true); setRowToDelete(null); try { await axios.delete(`${API_URL}/daily/${id}`); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setShowDeleteRowModal(false); } catch (err) { setShowDeleteRowModal(false); } finally { setIsProcessingDelete(false); } };
    
    const updateSessionField = async (field, value) => { 
        if(!canEdit || !detailData) return; 
        const newData = { ...detailData, [field]: value }; setDetailData(newData); 
        try { await axios.put(`${API_URL}/sessions/${currentId}`, { [field]: value }); } catch (err) {} 
    };

    const handleAddBale = async (e) => { 
        e.preventDefault(); if(!canEdit) return; 
        const cost = parseInput(baleCost); const qty = parseInput(baleQty); 
        if(!baleName || cost === 0) return; 
        try { 
            const res = await axios.post(`${API_URL}/bales`, { session_id: currentId, name: baleName, cost: cost, qty: qty }); 
            const updated = [...(Array.isArray(importedBales) ? importedBales : []), res.data]; setImportedBales(updated); 
            const newCost = updated.reduce((sum, b) => sum + (b.cost || 0), 0);
            const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
            setBaleName(''); setBaleCost(''); setBaleQty(''); 
        } catch (err) {} 
    };

    const handleDeleteBale = async (id) => { 
        if(!canDelete) return; 
        try { 
            await axios.delete(`${API_URL}/bales/${id}`); 
            const safeBales = Array.isArray(importedBales) ? importedBales : []; 
            const updated = safeBales.filter(b => b._id !== id); 
            setImportedBales(updated); 
            const newCost = updated.reduce((sum, b) => sum + (b.cost || 0), 0);
            const newGiatUi = Math.round(newCost * 0.04);
            await axios.put(`${API_URL}/sessions/${currentId}`, { so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi });
            setDetailData(prev => ({...prev, so_tien_cua_kien: newCost, so_tien_giat_ui: newGiatUi}));
        } catch (err) {} 
    };

    const handleAddItem = async (e) => { 
        e.preventDefault(); if (!canEdit || isProcessingAdd) return; setIsProcessingAdd(true);
        try { await axios.post(`${API_URL}/daily`, { session_id: currentId, ten_san_pham: newItem.ten_san_pham, link_san_pham: newItem.link_san_pham, ngay_ban: newItem.ngay_ban, so_luong_nhap: parseInput(newItem.so_luong_nhap), so_luong: parseInput(newItem.so_luong), so_tien_ban_duoc: parseInput(newItem.so_tien_ban_duoc), updatedAt: new Date().toISOString() }); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setNewItem(prev => ({ ...prev, ten_san_pham: '', link_san_pham: '', so_luong: '', so_luong_nhap: '', so_tien_ban_duoc: '', ngay_ban: getTodayString() })); } catch (err) {} finally { setIsProcessingAdd(false); }
    };
    
    const handleStartEdit = (row) => { if(canEdit) setEditingRow({ ...row }); };
    const handleSaveEdit = async () => { 
        if (!editingRow || isProcessingEdit) return; setIsProcessingEdit(true); 
        try { const updatedRow = { ...editingRow, so_luong_nhap: parseInput(editingRow.so_luong_nhap), so_luong: parseInput(editingRow.so_luong), so_tien_ban_duoc: parseInput(editingRow.so_tien_ban_duoc), updatedAt: new Date().toISOString() }; await axios.put(`${API_URL}/daily/${updatedRow.id}`, updatedRow); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData({ ...freshRes.data, daily: Array.isArray(freshRes.data.daily) ? freshRes.data.daily : [] }); setEditingRow(null); } catch (err) {} finally { setIsProcessingEdit(false); } 
    };

    useEffect(() => {
        if (typeof syncText !== 'string' || !syncText.trim()) {
            setSyncManualQty(''); setSyncManualRev(''); return;
        }
        const { q, r } = parseIGSyncText(syncText);
        setSyncManualQty(q > 0 ? q.toString() : '');
        setSyncManualRev(r > 0 ? r.toString() : (q > 0 ? '0' : '0'));
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

    const handleStartEditSession = (e, session) => { if(!canEdit) return; e.stopPropagation(); setEditingSession({ ...session, name: session.name === 'Thống kê tự động' ? '' : session.name }); };
    const handleSaveSession = async () => { 
        if (!editingSession) return; 
        try { 
            const newKien = parseInput(editingSession.so_tien_cua_kien);
            const newGiatUi = Math.round(newKien * 0.04);
            await axios.put(`${API_URL}/sessions/${editingSession.id}`, { name: editingSession.name || 'Thống kê tự động', end_date: editingSession.end_date, so_tien_cua_kien: newKien, so_tien_giat_ui: newGiatUi }); 
            await fetchDashboard(); 
            if (view === 'DETAIL' && currentId === editingSession.id) fetchDetail(currentId); 
            setEditingSession(null); 
        } catch (err) {} 
    };
    
    const handleBack = () => { fetchDashboard(); setView('DASHBOARD'); setDetailData(null); setImportedBales([]); };

    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const enrichedSessions = safeSessions.map(ss => {
        const autoAdCost = ss.quang_cao || 0; 
        const computedGiatUi = Math.round((ss.so_tien_cua_kien || 0) * 0.04); 
        const realProfit = (ss.tong_doanh_thu || 0) - (ss.so_tien_cua_kien || 0) - computedGiatUi - autoAdCost;
        return { ...ss, autoAdCost, realProfit, computedGiatUi };
    });

    const { dashboardProfit, totalRevenueForTax, taxAmount, showTax, displayRevenueTr, globalTongNhap, globalTongBan, globalVonTon, globalTongCon } = calculateGlobalStats(enrichedSessions);
    
    // TĂNG CƯỜNG BẢO VỆ: Đảm bảo biến detailData và enrichedDaily không bao giờ sập
    const safeDetailData = detailData ? { ...detailData, daily: Array.isArray(detailData.daily) ? detailData.daily : [] } : null;
    const { detailProfit, mvpRowId, enrichedDaily, detailAutoAdCost, actualStartDate, actualEndDate, dynamicTarget, isTargetReached } = calculateDetailStats(safeDetailData, importedBales, AD_COST_PER_SALE);
    const safeEnrichedDaily = Array.isArray(enrichedDaily) ? enrichedDaily : [];
    const progressPercent = dynamicTarget > 0 ? Math.min(Math.max((detailProfit / dynamicTarget) * 100, 0), 100) : 0;

    useEffect(() => {
        if (view === 'DETAIL' && isTargetReached) { setShowFireworks(true); const t = setTimeout(() => setShowFireworks(false), 5500); return () => clearTimeout(t); } 
        else { setShowFireworks(false); }
    }, [view, isTargetReached, currentId]);

    const handleExport = () => { 
        if (!canExportExcel) { showToast("Tính năng Xuất Excel báo cáo chỉ dành cho gói VVIP (100k) và PREMIUM!", "error"); return; }
        if (!detailData) return; let csv = "STT,Ngay Ban,Ten San Pham,Link SP,SL Nhap,SL Ban,SL Con,Von Uoc Tinh,Doanh Thu,So Tien Loi\n"; 
        safeEnrichedDaily.forEach((row) => { csv += `${row.stt || ''},${formatDateDisplay(row.ngay_ban)},"${row.ten_san_pham || ''}","${row.link_san_pham || ''}",${row.sl_nhap},${row.so_luong || 0},${row.sl_con},${row.tien_ton},${Math.round(row.so_tien_ban_duoc || 0)},${row.loi}\n`; }); 
        csv += `\n,,,,,,,,,TONG LOI: ${Math.round(detailProfit)}\n`; saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${getSessionName(detailData.name, actualStartDate, actualEndDate)}.csv`); 
    };

    if (!authUser || isExpiredState) {
        return <Auth onLoginSuccess={(u, rememberMe) => { setAuthUser(u); if (rememberMe) { localStorage.setItem('authUser', JSON.stringify(u)); sessionStorage.removeItem('authUser'); } else { sessionStorage.setItem('authUser', JSON.stringify(u)); localStorage.removeItem('authUser'); } }} expiredEmail={isExpiredState ? authUser?.email : null} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen font-sans text-[#1D1D1F] relative overflow-x-hidden selection:bg-[#26D0CE]/30 selection:text-[#0B3B60] pb-24 md:pb-12 pt-24 md:pt-36">
            {showFireworks && <Confetti />}

            <Toast toast={toast} />
            <BlockModal blockModal={blockModal} />

            <style dangerouslySetInnerHTML={{ __html: `
                html, body, div, span, p, h1, h2, h3, h4, h5, h6 { -webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important; }
                .font-sans { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }
                .tabular-nums { font-variant-numeric: tabular-nums; }
                @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .bg-aurora { background: linear-gradient(135deg, #E0F7FA 0%, #E0F2FE 50%, #F0FDFA 100%); }
                .liquid-glass { background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(24px) saturate(150%); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 8px 32px rgba(0,0,0,0.05); }
                .liquid-glass-dark { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(24px) saturate(150%); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.2); color: white; }
                .liquid-input { background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); transition: all 0.3s; }
                .liquid-input:focus { background: rgba(255, 255, 255, 0.8); border-color: #26D0CE; box-shadow: 0 0 0 4px rgba(38, 208, 206, 0.2); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
            `}} />
            <div className="fixed inset-0 z-[-2] bg-aurora pointer-events-none"></div>

            <Header 
                authUser={authUser} isAdmin={isAdmin} canEdit={canEdit} timeLeftDisplay={timeLeftDisplay}
                view={view} setView={setView} handleCreateAutoSession={handleCreateAutoSession}
                isProcessingCreate={isProcessingCreate} handleLogout={handleLogout}
                activeTab={activeTab} setActiveTab={setActiveTab} 
            />

            <SyncModal syncRow={syncRow} setSyncRow={setSyncRow} syncText={syncText} setSyncText={setSyncText} syncManualQty={syncManualQty} setSyncManualQty={setSyncManualQty} syncManualRev={syncManualRev} setSyncManualRev={setSyncManualRev} handleConfirmSync={handleConfirmSync} isProcessingEdit={isProcessingEdit} />
            <EditRowModal editingRow={editingRow} setEditingRow={setEditingRow} handleSaveEdit={handleSaveEdit} isProcessingEdit={isProcessingEdit} />
            <EditSessionModal editingSession={editingSession} setEditingSession={setEditingSession} handleSaveSession={handleSaveSession} />
            <DeleteSessionModal showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} confirmDeleteSession={confirmDeleteSession} />
            <DeleteRowModal showDeleteRowModal={showDeleteRowModal} setShowDeleteRowModal={setShowDeleteRowModal} confirmDeleteRow={confirmDeleteRow} isProcessingDelete={isProcessingDelete} />
            <SalaryModal salarySession={salarySession} setShowSalaryModal={setShowSalaryModal} momoPhone={momoPhone} setMomoPhone={setMomoPhone} />
            
            <div className="w-[96%] max-w-[1600px] mx-auto space-y-6 md:space-y-8 p-3 sm:p-6 md:p-8">
                {view === 'USERS' && isAdmin && ( <AdminPanel setView={setView} authUser={authUser} /> )}
                
                {view === 'DASHBOARD' && (
                    <DashboardView 
                        activeTab={activeTab}
                        dashboardProfit={dashboardProfit} globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} showTax={showTax} taxAmount={taxAmount} displayRevenueTr={displayRevenueTr} totalRevenueForTax={totalRevenueForTax} safeSessions={safeSessions} enrichedSessions={enrichedSessions} fetchDetail={fetchDetail} isAdmin={isAdmin} canEdit={canEdit} canDelete={canDelete} canPay={canPay} setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal} handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession}
                    />
                )}
                
                {view === 'DETAIL' && safeDetailData && (
                    <DetailView 
                        detailData={safeDetailData} handleBack={handleBack} handleExport={handleExport} actualStartDate={actualStartDate} actualEndDate={actualEndDate}
                        isTargetReached={isTargetReached} detailProfit={detailProfit} dynamicTarget={dynamicTarget} progressPercent={progressPercent} detailAutoAdCost={detailAutoAdCost}
                        canEdit={canEdit} canDelete={canDelete} handleAddBale={handleAddBale} baleName={baleName} setBaleName={setBaleName} baleCost={baleCost} setBaleCost={setBaleCost}
                        baleQty={baleQty} setBaleQty={setBaleQty} importedBales={importedBales} handleDeleteBale={handleDeleteBale} updateSessionField={updateSessionField} handleAddItem={handleAddItem}
                        newItem={newItem} setNewItem={setNewItem} isProcessingAdd={isProcessingAdd} enrichedDaily={safeEnrichedDaily} mvpRowId={mvpRowId} handleStartEdit={handleStartEdit}
                        handleDeleteRow={handleDeleteRow} isProcessingEdit={isProcessingEdit} isProcessingDelete={isProcessingDelete} handleStartSync={setSyncRow}
                    />
                )}
            </div>
            <ChatBox authUser={authUser} />
        </div>
    );
}