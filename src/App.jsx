import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Plus, Power, Save, Upload, X, AlertTriangle, RefreshCw, LogOut, Users, Wallet, Fish, Crown } from 'lucide-react';
import { saveAs } from 'file-saver';
import Auth from './Auth';
import AdminPanel from './components/AdminPanel';
import DashboardView from './components/DashboardView';
import DetailView from './components/DetailView';
import { API_URL, AD_COST_PER_SALE, formatCurrency, formatInput, parseInput, formatDateDisplay, getSessionName, getTodayString, Confetti } from './utils';

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
    
    const [sessions, setSessions] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const fileInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteRowModal, setShowDeleteRowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [isShutdown, setIsShutdown] = useState(false);
    const [showShutdownConfirm, setShowShutdownConfirm] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [editingSession, setEditingSession] = useState(null);
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

    useEffect(() => { localStorage.setItem('momoPhone', momoPhone); }, [momoPhone]);
    useEffect(() => { if(authUser) { fetchDashboard(); } }, [authUser]);

    const handleLogout = () => { 
        setAuthUser(null); 
        localStorage.removeItem('authUser'); 
        sessionStorage.removeItem('authUser');
        setView('DASHBOARD'); 
        setDetailData(null); 
    };

    const fetchDashboard = async () => { 
        try { 
            const res = await axios.get(`${API_URL}/sessions`); 
            const sessionsData = Array.isArray(res.data) ? res.data : [];
            let enrichedSessions = await Promise.all(sessionsData.map(async (ss) => {
                try {
                    const detailRes = await axios.get(`${API_URL}/data/${ss.id}`);
                    const dailyList = detailRes.data?.daily || [];
                    
                    ss.quang_cao = dailyList.length * AD_COST_PER_SALE;
                    let balesData = [];
                    try { balesData = (await axios.get(`${API_URL}/bales/${ss.id}`)).data; } catch(e) {}
                    const sortedBales = [...balesData].sort((a,b) => String(b.name || '').length - String(a.name || '').length);
                    let computedVonTon = 0; let trungBinh = ss.tong_sl_nhap > 0 ? (ss.so_tien_cua_kien / ss.tong_sl_nhap) : 0;

                    dailyList.forEach((row) => {
                        const matchedBale = sortedBales.find(b => String(row.ten_san_pham || '').toLowerCase().includes(String(b.name || '').toLowerCase()));
                        let sl_con = (row.so_luong_nhap || 0) - (row.so_luong || 0);
                        if (matchedBale) { computedVonTon += Math.round(sl_con * ((matchedBale.cost || 0) / (matchedBale.qty || 1))); } 
                        else { computedVonTon += Math.round(sl_con * trungBinh); }
                    });
                    ss.tong_tien_ton_computed = computedVonTon;
                    
                    const dates = dailyList.map(d => new Date(d.ngay_ban).getTime()).filter(t => !isNaN(t));
                    if (dates.length > 0) {
                        ss.actual_start_date = new Date(Math.min(...dates)).toISOString().split('T')[0];
                        ss.actual_end_date = new Date(Math.max(...dates)).toISOString().split('T')[0];
                    } else { ss.actual_start_date = ss.start_date; ss.actual_end_date = ss.start_date; }
                } catch(e) { ss.quang_cao = 0; ss.tong_tien_ton_computed = 0; ss.actual_start_date = ss.start_date; ss.actual_end_date = ss.start_date; }
                return ss;
            }));

            // SẮP XẾP ĐỢT BÁN: MỚI NHẤT LÊN TRÊN
            enrichedSessions.forEach((ss, idx) => ss.originalIndex = idx);
            enrichedSessions.sort((a, b) => {
                const dateA = new Date(a.actual_start_date || a.start_date || 0).getTime();
                const dateB = new Date(b.actual_start_date || b.start_date || 0).getTime();
                if (dateB === dateA) return b.originalIndex - a.originalIndex;
                return dateB - dateA;
            });

            setSessions(enrichedSessions); 
        } catch (err) {} 
    };

    const fetchDetail = async (id) => { 
        try { 
            const res = await axios.get(`${API_URL}/data/${id}`); 
            let balesData = [];
            try { balesData = (await axios.get(`${API_URL}/bales/${id}`)).data; } catch(e) {}
            if(res.data) { setDetailData(res.data); setImportedBales(balesData); setCurrentId(id); setView('DETAIL'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        } catch (err) { alert("Lỗi tải dữ liệu. Vui lòng thử lại."); } 
    };
    
    const handleCreateAutoSession = async () => { 
        if (!canEdit || isProcessingCreate) return; setIsProcessingCreate(true);
        try { const res = await axios.post(`${API_URL}/sessions`, { name: 'Thống kê tự động' }); await fetchDashboard(); if(res.data && res.data.id) fetchDetail(res.data.id); } 
        catch (err) { alert("Lỗi tạo mới."); } finally { setIsProcessingCreate(false); }
    };

    const handleDeleteSession = (e, id) => { if(!canDelete) return; e.stopPropagation(); setDeleteId(id); setShowDeleteModal(true); };
    const confirmDeleteSession = async () => { if (!deleteId) return; try { await axios.delete(`${API_URL}/sessions/${deleteId}`); fetchDashboard(); setShowDeleteModal(false); setDeleteId(null); } catch(err) {} };
    const handleDeleteRow = (id) => { if (!canDelete) return; setRowToDelete(id); setShowDeleteRowModal(true); };
    const confirmDeleteRow = async () => { const id = rowToDelete; if (!id || isProcessingDelete) return; setIsProcessingDelete(true); setRowToDelete(null); try { await axios.delete(`${API_URL}/daily/${id}`); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData(freshRes.data); setShowDeleteRowModal(false); } catch (err) { setShowDeleteRowModal(false); } finally { setIsProcessingDelete(false); } };

    const triggerRestore = () => { if(isAdmin) setShowRestoreModal(true); };
    const confirmRestore = () => { setShowRestoreModal(false); if(fileInputRef.current) fileInputRef.current.click(); };
    const handleRestoreFile = async (e) => { 
        const file = e.target.files[0]; if (!file) return; 
        const formData = new FormData(); formData.append('backup_file', file); setIsRestoring(true); 
        const checkServerStatus = () => { let retries = 0; const interval = setInterval(async () => { retries++; try { await axios.get(`${API_URL}/sessions`); clearInterval(interval); window.location.reload(); } catch (error) { if(retries > 8) { clearInterval(interval); alert("Máy chủ Backend bị tắt. Hãy bật lại."); } } }, 1500); };
        try { await axios.post(`${API_URL}/restore`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); checkServerStatus(); } catch (err) { checkServerStatus(); } 
    };
    
    const updateSessionField = async (field, value) => { if(!canEdit || !detailData) return; const newData = { ...detailData, [field]: value }; setDetailData(newData); try { await axios.put(`${API_URL}/sessions/${currentId}`, { [field]: value }); } catch (err) {} };
    const handleAddBale = async (e) => { e.preventDefault(); if(!canEdit) return; const cost = parseInput(baleCost); const qty = parseInput(baleQty); if(!baleName || cost === 0) return; try { const res = await axios.post(`${API_URL}/bales`, { session_id: currentId, name: baleName, cost: cost, qty: qty }); const updated = [...importedBales, res.data]; setImportedBales(updated); updateSessionField('so_tien_cua_kien', updated.reduce((sum, b) => sum + (b.cost || 0), 0)); setBaleName(''); setBaleCost(''); setBaleQty(''); } catch (err) { alert("Lỗi DB Lô hàng."); } };
    const handleDeleteBale = async (id) => { if(!canDelete) return; try { await axios.delete(`${API_URL}/bales/${id}`); const updated = importedBales.filter(b => b.id !== id); setImportedBales(updated); updateSessionField('so_tien_cua_kien', updated.reduce((sum, b) => sum + (b.cost || 0), 0)); } catch (err) {} };

    const handleAddItem = async (e) => { 
        e.preventDefault(); if (!canEdit || isProcessingAdd) return; setIsProcessingAdd(true);
        try { await axios.post(`${API_URL}/daily`, { session_id: currentId, ten_san_pham: newItem.ten_san_pham, link_san_pham: newItem.link_san_pham, ngay_ban: newItem.ngay_ban, so_luong_nhap: parseInput(newItem.so_luong_nhap), so_luong: parseInput(newItem.so_luong), so_tien_ban_duoc: parseInput(newItem.so_tien_ban_duoc) }); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData(freshRes.data); setNewItem(prev => ({ ...prev, ten_san_pham: '', link_san_pham: '', so_luong: '', so_luong_nhap: '', so_tien_ban_duoc: '', ngay_ban: getTodayString() })); } catch (err) { alert(`Lỗi: ${err.message}`); } finally { setIsProcessingAdd(false); }
    };
    
    const handleStartEdit = (row) => { if(canEdit) setEditingRow({ ...row }); };
    const handleSaveEdit = async () => { if (!editingRow || isProcessingEdit) return; setIsProcessingEdit(true); try { const updatedRow = { ...editingRow, so_luong_nhap: parseInput(editingRow.so_luong_nhap), so_luong: parseInput(editingRow.so_luong), so_tien_ban_duoc: parseInput(editingRow.so_tien_ban_duoc) }; await axios.put(`${API_URL}/daily/${updatedRow.id}`, updatedRow); const freshRes = await axios.get(`${API_URL}/data/${currentId}`); if(freshRes.data) setDetailData(freshRes.data); setEditingRow(null); } catch (err) {} finally { setIsProcessingEdit(false); } };
    const handleStartEditSession = (e, session) => { if(!canEdit) return; e.stopPropagation(); setEditingSession({ ...session, name: session.name === 'Thống kê tự động' ? '' : session.name }); };
    const handleSaveSession = async () => { if (!editingSession) return; try { await axios.put(`${API_URL}/sessions/${editingSession.id}`, { name: editingSession.name || 'Thống kê tự động', end_date: editingSession.end_date, so_tien_cua_kien: parseInput(editingSession.so_tien_cua_kien), so_tien_giat_ui: parseInput(editingSession.so_tien_giat_ui) }); await fetchDashboard(); if (view === 'DETAIL' && currentId === editingSession.id) fetchDetail(currentId); setEditingSession(null); } catch (err) {} };
    
    const handleBack = () => { fetchDashboard(); setView('DASHBOARD'); setDetailData(null); setImportedBales([]); };
    const handleBackup = () => { if(isAdmin) window.open(`${API_URL}/backup`, '_blank'); };
    const triggerShutdown = () => setShowShutdownConfirm(true);
    const confirmShutdown = async () => { setShowShutdownConfirm(false); setIsShutdown(true); try { await axios.post(`${API_URL}/shutdown`); } catch (err) {} };

    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const enrichedSessions = safeSessions.map(ss => {
        const autoAdCost = ss.quang_cao || 0; 
        const realProfit = (ss.tong_doanh_thu || 0) - (ss.so_tien_cua_kien || 0) - (ss.so_tien_giat_ui || 0) - autoAdCost;
        return { ...ss, autoAdCost, realProfit };
    });

    const dashboardProfit = enrichedSessions.reduce((sum, s) => sum + s.realProfit, 0);
    const totalRevenueForTax = enrichedSessions.reduce((sum, s) => sum + (s.tong_doanh_thu || 0), 0);
    const taxBase = totalRevenueForTax - 500000000; const taxAmount = taxBase > 0 ? taxBase * 0.015 : 0; const showTax = taxAmount > 0;
    const displayRevenueTr = (totalRevenueForTax / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    
    let globalTongNhap = 0; let globalTongBan = 0; let globalVonTon = 0;
    enrichedSessions.forEach(ss => { if (!String(ss?.name || '').toLowerCase().includes('sale')) { globalTongNhap += (ss?.tong_sl_nhap || 0); globalVonTon += (ss?.tong_tien_ton_computed || 0); } globalTongBan += (ss?.tong_sl_ban || 0); });
    const globalTongCon = Math.max(0, globalTongNhap - globalTongBan);

    let detailProfit = 0; let mvpRowId = null; let enrichedDaily = []; let exactTotalVonTon = 0; let detailAutoAdCost = 0;
    let actualStartDate = detailData?.start_date; let actualEndDate = detailData?.start_date;
    let dynamicTarget = 10000000; let isTargetReached = false;

    if (detailData) { 
        const dailyList = Array.isArray(detailData.daily) ? detailData.daily : [];
        const itemCount = dailyList.length;
        dynamicTarget = Math.max(1, Math.ceil(itemCount / 4)) * 10000000;
        detailAutoAdCost = itemCount * AD_COST_PER_SALE;
        detailProfit = (detailData.computed?.tong_doanh_thu || 0) - (detailData.so_tien_cua_kien || 0) - (detailData.so_tien_giat_ui || 0) - detailAutoAdCost;
        isTargetReached = detailProfit >= dynamicTarget && itemCount > 0;

        const dates = dailyList.map(d => new Date(d.ngay_ban).getTime()).filter(t => !isNaN(t));
        if (dates.length > 0) { actualStartDate = new Date(Math.min(...dates)).toISOString().split('T')[0]; actualEndDate = new Date(Math.max(...dates)).toISOString().split('T')[0]; }

        let maxRevenue = -Infinity; const sortedBales = [...importedBales].sort((a,b) => String(b.name || '').length - String(a.name || '').length);

        enrichedDaily = dailyList.map((row, index) => {
            const matchedBale = sortedBales.find(b => String(row.ten_san_pham || '').toLowerCase().includes(String(b.name || '').toLowerCase()));
            let sl_nhap = row.so_luong_nhap || 0; let sl_con = sl_nhap - (row.so_luong || 0); let loi = 0; let tien_ton = 0; let avgCost = 0;
            if (matchedBale) {
                avgCost = (matchedBale.cost || 0) / (matchedBale.qty || 1); tien_ton = Math.round(sl_con * avgCost);
                let cumulativeRevenue = 0;
                for (let i = dailyList.length - 1; i >= index; i--) { if (String(dailyList[i].ten_san_pham || '').toLowerCase().includes(String(matchedBale.name || '').toLowerCase())) cumulativeRevenue += (dailyList[i].so_tien_ban_duoc || 0); }
                loi = Math.round(cumulativeRevenue - (matchedBale.cost || 0)); 
            } else {
                avgCost = detailData.computed?.trung_binh || 0; tien_ton = Math.round(sl_con * avgCost); loi = Math.round(row.so_tien_ban_duoc || 0);
            }
            if ((row.so_tien_ban_duoc || 0) > maxRevenue && (row.so_tien_ban_duoc || 0) > 0) { maxRevenue = row.so_tien_ban_duoc; mvpRowId = row.id; }
            return { ...row, loi, sl_nhap, sl_con, tien_ton, originalIndex: index }; // Lưu index gốc để sort ổn định
        });

        // SẮP XẾP SẢN PHẨM: MỚI NHẤT LÊN TRÊN
        enrichedDaily.sort((a, b) => {
            const dateA = new Date(a.ngay_ban || 0).getTime();
            const dateB = new Date(b.ngay_ban || 0).getTime();
            if (dateB === dateA) return b.originalIndex - a.originalIndex; // Cùng ngày thì cái mới nhập nhảy lên trên
            return dateB - dateA;
        });

        // ĐÁNH LẠI SỐ THỨ TỰ (STT) TỪ LỚN ĐẾN BÉ
        enrichedDaily = enrichedDaily.map((row, idx) => ({
            ...row,
            stt: enrichedDaily.length - idx
        }));
    }

    useEffect(() => {
        if (view === 'DETAIL' && isTargetReached) { setShowFireworks(true); const t = setTimeout(() => setShowFireworks(false), 5500); return () => clearTimeout(t); } 
        else { setShowFireworks(false); }
    }, [view, isTargetReached, currentId]);

    const progressPercent = Math.min(Math.max((detailProfit / dynamicTarget) * 100, 0), 100);

    const handleExport = () => { 
        if (!detailData) return; let csv = "STT,Ngay Ban,Ten San Pham,Link SP,SL Nhap,SL Ban,SL Con,Von Uoc Tinh,Doanh Thu,So Tien Loi\n"; 
        enrichedDaily.forEach((row) => { csv += `${row.stt || ''},${formatDateDisplay(row.ngay_ban)},"${row.ten_san_pham || ''}","${row.link_san_pham || ''}",${row.sl_nhap},${row.so_luong || 0},${row.sl_con},${row.tien_ton},${Math.round(row.so_tien_ban_duoc || 0)},${row.loi}\n`; }); 
        csv += `\n,,,,,,,,,TONG LOI: ${Math.round(detailProfit)}\n`; saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${getSessionName(detailData.name, actualStartDate, actualEndDate)}.csv`); 
    };

    if (!authUser) {
        return <Auth onLoginSuccess={(u, rememberMe) => { 
            setAuthUser(u); 
            if (rememberMe) {
                localStorage.setItem('authUser', JSON.stringify(u)); sessionStorage.removeItem('authUser'); 
            } else {
                sessionStorage.setItem('authUser', JSON.stringify(u)); localStorage.removeItem('authUser'); 
            }
        }} />;
    }

    return (
        <div className="min-h-screen font-sans text-[#1D1D1F] relative overflow-x-hidden selection:bg-[#26D0CE]/30 selection:text-[#0B3B60] pb-24 md:pb-12 pt-24 md:pt-32">
            {showFireworks && <Confetti />}
            <style>{`
                html, body, div, span, p, h1, h2, h3, h4, h5, h6 { -webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important; }
                .font-sans { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }
                .tabular-nums { font-variant-numeric: tabular-nums; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
                .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }
                .bg-aurora { background-color: #F0F8FA; }
                @keyframes orb-float-1 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(5vw, -5vh) scale(1.1); } 66% { transform: translate(-5vw, 5vh) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
                @keyframes orb-float-2 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-5vw, 5vh) scale(1.1); } 66% { transform: translate(5vw, -5vh) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
                .orb { position: absolute; border-radius: 50%; filter: blur(120px); z-index: -1; opacity: 0.45; }
                .orb-blue { background: #33A1FD; width: 65vw; height: 65vw; top: -15%; left: -15%; animation: orb-float-1 15s infinite ease-in-out; }
                .orb-teal { background: #26D0CE; width: 55vw; height: 55vw; top: 15%; right: -15%; animation: orb-float-2 18s infinite ease-in-out reverse; }
                .orb-light { background: #81E4DA; width: 60vw; height: 60vw; bottom: -15%; left: 5%; animation: orb-float-1 20s infinite ease-in-out 2s; opacity: 0.5; }
                .liquid-glass { background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(36px) saturate(160%); -webkit-backdrop-filter: blur(36px) saturate(160%); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 24px 48px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6); }
                .liquid-glass-dark { background: rgba(20, 20, 22, 0.35); backdrop-filter: blur(40px) saturate(150%); -webkit-backdrop-filter: blur(40px) saturate(150%); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 32px 64px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15); color: white; }
                .liquid-input { background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.03); backdrop-filter: blur(12px); }
                .liquid-input:focus { background: rgba(255, 255, 255, 0.6); border-color: #26D0CE; box-shadow: 0 0 0 4px rgba(38, 208, 206, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.01); }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
            `}</style>

            <div className="fixed inset-0 z-[-2] bg-aurora pointer-events-none"></div>
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"><div className="orb orb-blue"></div><div className="orb orb-teal"></div><div className="orb orb-light"></div></div>

            {/* HEADER */}
            <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[calc(100%-3rem)] max-w-6xl z-50 liquid-glass rounded-full px-5 py-3 md:py-3.5 flex justify-between items-center transition-all duration-500 hover:bg-white/40">
                <a href="https://www.instagram.com/dolphin_97ers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group active:opacity-60 transition-opacity min-w-0">
                    <div className="w-9 h-9 md:w-11 md:h-11 bg-white/60 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 border border-white/50"><img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} /><Fish size={18} className="text-[#33A1FD] hidden" /></div>
                    <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-[17px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight leading-tight truncate">{authUser.name}</h1>
                            {isAdmin && <Crown size={14} className="text-[#FF9500] shrink-0" title="Quản trị viên"/>}
                        </div>
                        <p className="text-[10px] md:text-[11px] font-semibold text-[#5c5c5c] tracking-wide truncate">
                            {isAdmin ? 'Quản trị viên' : (canEdit ? 'Có quyền chỉnh sửa' : 'Chỉ xem')}
                        </p>
                    </div>
                </a>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleRestoreFile} className="hidden" accept=".db" />
                    {view === 'DASHBOARD' && (
                        <>
                            {isAdmin && (
                                <>
                                    <button onClick={() => setView('USERS')} title="Quản lý Người dùng" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white/30 border border-white/40 text-[#1DB2A0] rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95 hidden md:flex"><Users size={16} className="md:w-[18px] md:h-[18px]"/></button>
                                    <button onClick={handleBackup} title="Sao lưu (.db)" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white/30 border border-white/40 text-[#1A5B82] rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95 hidden md:flex"><Save size={16} className="md:w-[18px] md:h-[18px]"/></button>
                                    <button onClick={triggerRestore} title="Khôi phục (.db)" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white/30 border border-white/40 text-[#1A5B82] rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95 hidden md:flex"><Upload size={16} className="md:w-[18px] md:h-[18px]"/></button>
                                </>
                            )}
                            {canEdit && (
                                <button onClick={handleCreateAutoSession} disabled={isProcessingCreate} className="px-4 md:px-5 py-2.5 md:py-3.5 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-semibold rounded-full hover:opacity-90 transition-all shadow-md flex items-center gap-2 text-[13px] md:text-[14px] disabled:opacity-50 active:scale-95 border border-white/20">{isProcessingCreate ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5}/>} <span className="hidden md:inline">Tạo Thống Kê</span><span className="md:hidden">Tạo Mới</span></button>
                            )}
                        </>
                    )}
                    <button onClick={handleLogout} title="Đăng xuất" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/20 transition-all shadow-sm active:scale-95 shrink-0"><LogOut size={16} className="md:w-[18px] md:h-[18px]"/></button>
                    <button onClick={triggerShutdown} title="Tắt Server" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-[#FF3B30]/15 text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/30 transition-all active:scale-95 border border-[#FF3B30]/10 shrink-0"><Power size={16} className="md:w-[18px] md:h-[18px]"/></button>
                </div>
            </div>

            {/* MODALS */}
            {isShutdown && (<div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-fade-in-up"><div className="w-24 h-24 bg-[#FF3B30] rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(255,59,48,0.6)]"><Power size={44} className="text-white" /></div><h1 className="text-[32px] font-bold mb-2 tracking-tight">Đã ngắt kết nối</h1><p className="text-white/80 text-[16px] mb-8 font-medium">Bạn có thể đóng trang này an toàn.</p></div>)}
            {isRestoring && (<div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-fade-in-up"><div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse-slow"><RefreshCw size={36} className="text-white animate-spin" /></div><h1 className="text-[28px] font-bold mb-2 tracking-tight">Đang tải lại dữ liệu...</h1><p className="text-white/80 text-[15px] font-medium text-center px-4 mb-8">Hệ thống đang khởi động lại.<br/>Vui lòng chờ trong giây lát.</p><button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white/20 hover:bg-white/40 border border-white/50 rounded-full font-semibold transition-all active:scale-95">Tải lại trang ngay</button></div>)}
            {showShutdownConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all"><div className="liquid-glass rounded-[32px] p-8 w-full max-w-[340px] animate-scale-up text-center"><div className="w-14 h-14 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-5 text-[#FF3B30] mx-auto"><Power size={28} /></div><h2 className="text-[20px] font-bold text-[#1D1D1F] mb-2 tracking-tight">Tắt máy chủ?</h2><p className="text-[14px] text-[#5c5c5c] mb-8 font-medium">Hành động này sẽ ngắt kết nối với điện thoại của bạn ngay lập tức.</p><div className="flex gap-3"><button onClick={() => setShowShutdownConfirm(false)} className="flex-1 py-3.5 rounded-full font-semibold text-[#1D1D1F] bg-white/40 hover:bg-white border border-white/50 transition-colors text-[16px] active:opacity-70">Hủy</button><button onClick={confirmShutdown} className="flex-1 bg-[#FF3B30] text-white py-3.5 rounded-full font-semibold hover:bg-[#D70015] transition-colors shadow-md text-[16px] active:opacity-70">Tắt ngay</button></div></div></div>)}
            {editingRow && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all"><div className="liquid-glass rounded-[32px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative"><button onClick={() => setEditingRow(null)} className="absolute top-5 right-5 text-[#5c5c5c] bg-white/60 hover:bg-white p-2 rounded-full transition-colors active:opacity-70"><X size={20}/></button><div className="mb-6"><h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">Sửa Bản Ghi</h2></div><div className="space-y-4"><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Ngày Bán</label><input type="date" className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all" value={editingRow.ngay_ban} onChange={e => setEditingRow({...editingRow, ngay_ban: e.target.value})} /></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tên Sản Phẩm</label><input type="text" className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all" value={editingRow.ten_san_pham} onChange={e => setEditingRow({...editingRow, ten_san_pham: e.target.value})} /></div><div className="grid grid-cols-2 gap-3 w-full"><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">SL Nhập</label><input className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-bold text-[#33A1FD] text-center tabular-nums outline-none transition-all" value={formatInput(editingRow.so_luong_nhap)} onChange={e => setEditingRow({...editingRow, so_luong_nhap: e.target.value})} /></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">SL Bán</label><input className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-bold text-[#1DB2A0] text-center tabular-nums outline-none transition-all" value={formatInput(editingRow.so_luong)} onChange={e => setEditingRow({...editingRow, so_luong: e.target.value})} /></div></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tổng Doanh Thu</label><input className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none transition-all tracking-tight" value={formatInput(editingRow.so_tien_ban_duoc)} onChange={e => setEditingRow({...editingRow, so_tien_ban_duoc: e.target.value})} /></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Link (Tùy chọn)</label><input type="text" className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-medium text-[#33A1FD] outline-none transition-all" value={editingRow.link_san_pham || ''} onChange={e => setEditingRow({...editingRow, link_san_pham: e.target.value})} /></div></div><div className="mt-8 flex gap-3"><button onClick={() => setEditingRow(null)} className="flex-1 py-3.5 rounded-full font-semibold text-[#1D1D1F] bg-white/40 hover:bg-white border border-white/50 transition-colors text-[15px] active:opacity-70">Hủy</button><button onClick={handleSaveEdit} disabled={isProcessingEdit} className="flex-1 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-colors disabled:opacity-50 text-[15px] shadow-md active:opacity-70">{isProcessingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button></div></div></div>)}
            {editingSession && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all"><div className="liquid-glass rounded-[32px] p-6 md:p-8 w-full max-w-[400px] animate-scale-up relative"><button onClick={() => setEditingSession(null)} className="absolute top-5 right-5 text-[#5c5c5c] bg-white/40 hover:bg-white p-2 rounded-full transition-colors active:opacity-70"><X size={20}/></button><div className="mb-6"><h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">Thiết lập đợt bán</h2></div><div className="space-y-4"><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tên hiển thị (Tùy chọn)</label><input type="text" className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all" value={editingSession.name === 'Thống kê tự động' ? '' : editingSession.name} placeholder="Để trống hệ thống sẽ lấy Ngày" onChange={e => setEditingSession({...editingSession, name: e.target.value})} /></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Chi phí Nhập Kiện</label><input className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none transition-all tracking-tight" value={formatInput(editingSession.so_tien_cua_kien)} onChange={e => setEditingSession({...editingSession, so_tien_cua_kien: e.target.value})} /></div><div><label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Chi phí khác (Giặt ủi, vận chuyển...)</label><input className="w-full px-4 py-3.5 liquid-input rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none transition-all tracking-tight" value={formatInput(editingSession.so_tien_giat_ui)} onChange={e => setEditingSession({...editingSession, so_tien_giat_ui: e.target.value})} /></div></div><div className="mt-8 flex gap-3"><button onClick={() => setEditingSession(null)} className="flex-1 py-3.5 rounded-full font-semibold text-[#1D1D1F] bg-white/40 hover:bg-white border border-white/50 transition-colors text-[15px] active:opacity-70">Hủy</button><button onClick={handleSaveSession} className="flex-1 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-colors shadow-md text-[15px] active:opacity-70">Cập nhật</button></div></div></div>)}
            {showDeleteModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all"><div className="liquid-glass rounded-[32px] p-6 md:p-8 w-full max-w-[340px] animate-scale-up relative text-center"><div className="w-14 h-14 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-5 text-[#FF3B30] mx-auto border border-[#FF3B30]/20"><AlertTriangle size={28} /></div><h2 className="text-[20px] font-bold text-[#1D1D1F] mb-2 tracking-tight">Xóa đợt thống kê?</h2><p className="text-[14px] text-[#5c5c5c] mb-8 font-medium">Hành động này <strong className="text-[#FF3B30]">vĩnh viễn</strong> và không thể khôi phục.</p><div className="flex flex-col gap-3"><button onClick={confirmDeleteSession} className="w-full bg-[#FF3B30] text-white py-3.5 rounded-full font-semibold hover:bg-[#D70015] transition-colors text-[15px] shadow-md active:opacity-70">Xóa Đợt Bán</button><button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 rounded-full font-semibold text-[#1D1D1F] bg-white/40 hover:bg-white border border-white/50 transition-colors text-[15px] active:opacity-70">Hủy thao tác</button></div></div></div>)}
            {showDeleteRowModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all"><div className="liquid-glass rounded-[32px] p-6 w-full max-w-[340px] animate-scale-up relative text-center"><div className="w-12 h-12 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-4 text-[#FF3B30] mx-auto border border-[#FF3B30]/20"><Trash2 size={24} /></div><h2 className="text-[20px] font-bold text-[#1D1D1F] mb-2 tracking-tight">Xóa sản phẩm này?</h2><p className="text-[14px] text-[#5c5c5c] mb-8 font-medium">Dữ liệu sẽ bị xóa ngay lập tức.</p><div className="flex gap-3"><button onClick={() => setShowDeleteRowModal(false)} className="flex-1 py-3.5 rounded-full font-semibold text-[#1D1D1F] bg-white/40 border border-white/50 hover:bg-white transition-colors text-[15px] active:opacity-70">Hủy</button><button onClick={confirmDeleteRow} disabled={isProcessingDelete} className="flex-1 bg-[#FF3B30] text-white py-3.5 rounded-full font-semibold text-[15px] hover:bg-[#D70015] transition-colors disabled:opacity-50 shadow-md active:opacity-70">{isProcessingDelete ? '...' : 'Xóa'}</button></div></div></div>)}

            {/* MODAL PHÁT LƯƠNG CHUẨN VIETQR (Napas 247) */}
            {showSalaryModal && salarySession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md transition-all">
                    <div className="liquid-glass rounded-[32px] p-6 md:p-8 w-full max-w-[380px] animate-scale-up relative flex flex-col items-center text-center">
                        <button onClick={() => setShowSalaryModal(false)} className="absolute top-5 right-5 text-[#5c5c5c] bg-white/60 hover:bg-white p-2 rounded-full transition-colors active:opacity-70"><X size={20}/></button>
                        
                        <div className="w-14 h-14 bg-[#1DB2A0]/10 rounded-full flex items-center justify-center mb-4 text-[#1DB2A0]"><Wallet size={28} /></div>
                        <h2 className="text-[22px] font-black text-[#1D1D1F] tracking-tight mb-1">Phát Lương Đợt Bán</h2>
                        <p className="text-[13px] text-[#5c5c5c] font-medium mb-6">Trích xuất 30% lợi nhuận</p>

                        {salarySession.realProfit <= 0 ? (
                            <div className="w-full p-4 bg-[#FF3B30]/10 rounded-2xl text-[#FF3B30] font-bold text-[14px]">
                                Lợi nhuận đợt này đang âm hoặc bằng 0.<br/>Chưa thể phát lương!
                            </div>
                        ) : (
                            <>
                                <div className="w-full bg-white/40 rounded-[20px] p-4 mb-4 shadow-sm text-left">
                                    <div className="flex justify-between text-[13px] font-semibold text-[#5c5c5c] mb-2"><span>Tổng lợi nhuận:</span> <span className="text-[#1D1D1F]">{formatCurrency(salarySession.realProfit)}đ</span></div>
                                    <div className="flex justify-between text-[15px] font-black text-[#1D1D1F] pt-2 border-t border-white/50"><span>Lương (30%):</span> <span className="text-[#1DB2A0]">{formatCurrency(Math.round(salarySession.realProfit * 0.3))}đ</span></div>
                                </div>
                                
                                <div className="w-full text-left mb-4">
                                    <label className="text-[12px] font-bold text-[#5c5c5c] mb-1.5 ml-1 block">SĐT MoMo người nhận:</label>
                                    <input type="text" className="w-full px-4 py-3 liquid-input rounded-[16px] text-[16px] font-bold text-[#1D1D1F] tracking-wider text-center outline-none transition-all" placeholder="Ví dụ: 0912345678" value={momoPhone} onChange={e => setMomoPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={11} />
                                </div>

                                {momoPhone.length >= 10 ? (
                                    <div className="p-2 bg-white rounded-[20px] shadow-sm mb-2">
                                        <img 
                                            src={`https://img.vietqr.io/image/momo-${momoPhone}-compact2.png?amount=${Math.round(salarySession.realProfit * 0.3)}&addInfo=PhatLuong`} 
                                            alt="VietQR MoMo" 
                                            className="w-48 h-48 mx-auto" 
                                        />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 mx-auto bg-white/30 rounded-[20px] border border-white/50 flex items-center justify-center text-[12px] text-[#5c5c5c] font-medium p-4 text-center mb-2">Nhập đủ SĐT MoMo để tạo mã QR</div>
                                )}
                                <span className="text-[11px] font-medium text-[#8E8E93] italic">Quét bằng MoMo, Zalo, hoặc App Ngân hàng</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 p-3 sm:p-6 md:p-8">
                
                {/* ADMIN PANEL */}
                {view === 'USERS' && isAdmin && (
                    <AdminPanel setView={setView} authUser={authUser} />
                )}

                {/* TRANG CHỦ DASHBOARD */}
                {view === 'DASHBOARD' && (
                    <DashboardView 
                        dashboardProfit={dashboardProfit} globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} 
                        globalVonTon={globalVonTon} showTax={showTax} taxAmount={taxAmount} displayRevenueTr={displayRevenueTr} 
                        totalRevenueForTax={totalRevenueForTax} 
                        safeSessions={safeSessions} enrichedSessions={enrichedSessions} fetchDetail={fetchDetail} 
                        isAdmin={isAdmin} canEdit={canEdit} canDelete={canDelete} setSalarySession={setSalarySession} 
                        setShowSalaryModal={setShowSalaryModal} handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession}
                    />
                )}

                {/* TRANG CHI TIẾT ĐỢT BÁN */}
                {view === 'DETAIL' && detailData && (
                    <DetailView 
                        detailData={detailData} handleBack={handleBack} handleExport={handleExport} actualStartDate={actualStartDate} actualEndDate={actualEndDate}
                        isTargetReached={isTargetReached} detailProfit={detailProfit} dynamicTarget={dynamicTarget} progressPercent={progressPercent} detailAutoAdCost={detailAutoAdCost}
                        canEdit={canEdit} canDelete={canDelete} handleAddBale={handleAddBale} baleName={baleName} setBaleName={setBaleName} baleCost={baleCost} setBaleCost={setBaleCost}
                        baleQty={baleQty} setBaleQty={setBaleQty} importedBales={importedBales} handleDeleteBale={handleDeleteBale} updateSessionField={updateSessionField} handleAddItem={handleAddItem}
                        newItem={newItem} setNewItem={setNewItem} isProcessingAdd={isProcessingAdd} enrichedDaily={enrichedDaily} mvpRowId={mvpRowId} handleStartEdit={handleStartEdit}
                        handleDeleteRow={handleDeleteRow} isProcessingEdit={isProcessingEdit} isProcessingDelete={isProcessingDelete}
                    />
                )}
            </div>
        </div>
    );
}