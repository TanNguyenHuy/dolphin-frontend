import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Trash2, Plus, Calendar, Download, Fish, Power, Save, Upload, Crown, X, AlertTriangle, RefreshCw, Pencil, Box, Package, Percent, Link as LinkIcon, BarChart3, ChevronRight, ChevronLeft, LogOut, Users, ShieldAlert, ShieldCheck, Ban, Wallet } from 'lucide-react';
import { saveAs } from 'file-saver';
import Auth from './Auth';

const API_URL = 'https://dolphin-backend-dkev.onrender.com/api';
const AD_COST_PER_SALE = 350000; 

const formatCurrency = (val) => { const num = Number(val); return isNaN(num) ? "0" : new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(Math.round(num)); };
const formatInput = (val) => { if (val === null || val === undefined) return ""; const num = val.toString().replace(/,/g, ""); return (isNaN(num) || num === "") ? "" : Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
const parseInput = (val) => { if (!val) return 0; const parsed = parseFloat(val.toString().replace(/,/g, "")); return isNaN(parsed) ? 0 : parsed; };
const formatDateDisplay = (dateStr) => { if(!dateStr || typeof dateStr !== 'string') return "..."; const parts = dateStr.split('-'); if (parts.length !== 3) return dateStr; return `${parts[2]}/${parts[1]}/${parts[0]}`; };
const getTodayString = () => { try { return new Date().toISOString().split('T')[0]; } catch { return "2026-01-01"; } };

const getSessionName = (name, start, end) => {
    const safeName = String(name || '').trim();
    if (!safeName || safeName === 'Thống kê tự động' || safeName.startsWith('Thống kê từ') || safeName.startsWith('Thống kê ngày') || safeName.includes('➔')) {
        const sStr = formatDateDisplay(start); const eStr = formatDateDisplay(end);
        if (sStr === eStr) return `Ngày ${sStr}`;
        if (sStr.slice(-4) === eStr.slice(-4) && sStr.slice(-4) !== "...") return `${sStr.slice(0, 5)} ➔ ${eStr}`;
        return `${sStr} ➔ ${eStr}`;
    }
    return safeName; 
};

const Confetti = () => {
    const pieces = useMemo(() => Array.from({ length: 120 }).map((_, i) => ({
        id: i, left: `${Math.random() * 100}%`, width: `${Math.random() * 8 + 6}px`, height: `${Math.random() * 14 + 8}px`,
        bg: ['#26D0CE', '#33A1FD', '#FF3B30', '#FF9500', '#1DB2A0', '#FF2D55'][Math.floor(Math.random() * 6)],
        dur: `${Math.random() * 3 + 2}s`, del: `${Math.random() * 1.5}s`, rot: `${Math.random() * 360}deg`
    })), []);
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            <style>{`@keyframes confettiFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(var(--rot)); opacity: 0; } }`}</style>
            {pieces.map(p => (<div key={p.id} className="absolute top-[-10%]" style={{ left: p.left, width: p.width, height: p.height, backgroundColor: p.bg, '--rot': p.rot, animation: `confettiFall ${p.dur} linear ${p.del} forwards` }} />))}
        </div>
    );
};

const AnimatedNumber = ({ value, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(Number(value) || 0);
    useEffect(() => {
        const end = Math.round(Number(value) || 0); if (isNaN(end)) return;
        let start = displayValue; if (start === end) return;
        const duration = 800; const startTime = performance.now(); let animationFrame;
        const update = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setDisplayValue(Math.round(start + (end - start) * (1 - Math.pow(1 - progress, 4))));
            if (progress < 1) animationFrame = requestAnimationFrame(update); else setDisplayValue(end);
        };
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);
    return <span className={`tabular-nums tracking-tight ${className}`}>{formatCurrency(displayValue)}</span>;
};

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
    const [usersList, setUsersList] = useState([]);
    
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
    useEffect(() => { if(authUser) { fetchDashboard(); if(isAdmin) fetchUsers(); } }, [authUser]);

    const handleLogout = () => { 
        setAuthUser(null); 
        localStorage.removeItem('authUser'); 
        sessionStorage.removeItem('authUser');
        setView('DASHBOARD'); 
        setDetailData(null); 
    };

    const fetchUsers = async () => { try { const res = await axios.get(`${API_URL}/users`); setUsersList(res.data); } catch(err){} };
    const handleUpdateUser = async (id, updateData) => { try { await axios.put(`${API_URL}/users/${id}`, updateData); fetchUsers(); } catch(err) { alert('Lỗi cập nhật user!'); } };
    const handleDeleteUser = async (id) => { if(window.confirm('Xóa vĩnh viễn tài khoản này?')) { try { await axios.delete(`${API_URL}/users/${id}`); fetchUsers(); } catch(err) {} } };

    const calculateDaysDiff = (start, end) => { 
        if (!start || !end) return 0; 
        const d1 = new Date(start); const d2 = new Date(end); 
        if (isNaN(d1) || isNaN(d2)) return 0;
        return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))); 
    };

    const fetchDashboard = async () => { 
        try { 
            const res = await axios.get(`${API_URL}/sessions`); 
            const sessionsData = Array.isArray(res.data) ? res.data : [];
            const enrichedSessions = await Promise.all(sessionsData.map(async (ss) => {
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
            exactTotalVonTon += tien_ton; return { ...row, loi, sl_nhap, sl_con, tien_ton };
        });
    }

    useEffect(() => {
        if (view === 'DETAIL' && isTargetReached) { setShowFireworks(true); const t = setTimeout(() => setShowFireworks(false), 5500); return () => clearTimeout(t); } 
        else { setShowFireworks(false); }
    }, [view, isTargetReached, currentId]);

    const handleExport = () => { 
        if (!detailData) return; let csv = "STT,Ngay Ban,Ten San Pham,Link SP,SL Nhap,SL Ban,SL Con,Von Uoc Tinh,Doanh Thu,So Tien Loi\n"; 
        enrichedDaily.forEach((row) => { csv += `${row.stt || ''},${formatDateDisplay(row.ngay_ban)},"${row.ten_san_pham || ''}","${row.link_san_pham || ''}",${row.sl_nhap},${row.so_luong || 0},${row.sl_con},${row.tien_ton},${Math.round(row.so_tien_ban_duoc || 0)},${row.loi}\n`; }); 
        csv += `\n,,,,,,,,,TONG LOI: ${Math.round(detailProfit)}\n`; saveAs(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${getSessionName(detailData.name, actualStartDate, actualEndDate)}.csv`); 
    };

    const progressPercent = Math.min(Math.max((detailProfit / dynamicTarget) * 100, 0), 100);

    if (!authUser) {
        return <Auth onLoginSuccess={(u, rememberMe) => { 
            setAuthUser(u); 
            if (rememberMe) {
                localStorage.setItem('authUser', JSON.stringify(u)); 
                sessionStorage.removeItem('authUser'); 
            } else {
                sessionStorage.setItem('authUser', JSON.stringify(u));
                localStorage.removeItem('authUser'); 
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

            {/* CÁC MODAL CỦA HỆ THỐNG */}
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
                
                {/* --- GIAO DIỆN QUẢN TRỊ USERS (ADMIN PANEL - NÂNG CẤP FULL QUYỀN LỰC) --- */}
                {view === 'USERS' && isAdmin && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
                            <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-1.5 text-[#1A5B82] hover:text-[#0B3B60] font-semibold bg-white/30 px-4 py-2 rounded-full border border-white/40 shadow-sm"><ChevronLeft size={18}/> Về Dashboard</button>
                            <h2 className="text-[20px] md:text-[24px] font-black text-[#1D1D1F]">Quản lý Tài Khoản</h2>
                        </div>
                        <div className="grid gap-4">
                            {usersList.map((user) => {
                                const id = user._id || user.id;
                                const perms = user.permissions || { canView: false, canEdit: false, canDelete: false };
                                const isMe = (authUser.id === id) || (authUser._id === id);

                                return (
                                    <div key={id} className={`liquid-glass p-4 rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${user.isBanned ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : ''}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-[#1D1D1F] text-[16px]">{user.name}</h3>
                                                {user.role === 'admin' && <Crown size={14} className="text-[#FF9500]" title="Chủ tịch"/>}
                                                {!user.isApproved && <span className="bg-[#FF9500] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">CHỜ DUYỆT</span>}
                                                {user.isBanned && <span className="bg-[#FF3B30] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">BỊ CẤM</span>}
                                            </div>
                                            <p className="text-[13px] text-[#5c5c5c] font-medium">{user.email}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* KHỐI DUYỆT */}
                                            {!user.isApproved ? (
                                                <button onClick={() => handleUpdateUser(id, { isApproved: true })} className="bg-[#1DB2A0] hover:bg-[#158f80] text-white text-[12px] font-bold px-4 py-2 rounded-xl transition shadow-sm">
                                                    Duyệt Vào
                                                </button>
                                            ) : (
                                                <button onClick={() => handleUpdateUser(id, { isApproved: false })} disabled={isMe} className="bg-white/40 hover:bg-white text-[#5c5c5c] text-[12px] font-bold px-3 py-2 rounded-xl transition border border-white/50 disabled:opacity-50">
                                                    Hủy Duyệt
                                                </button>
                                            )}

                                            {/* KHỐI PHÂN QUYỀN (Xem/Sửa/Xóa) */}
                                            <div className="flex gap-1 bg-white/30 p-1 rounded-xl border border-white/50 items-center">
                                                <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/40 rounded-lg transition'}`}>
                                                    <input type="checkbox" checked={perms.canView} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canView: e.target.checked } })} disabled={isMe} className="accent-[#33A1FD]" />
                                                    <span className="text-[12px] font-semibold text-[#1D1D1F]">Xem</span>
                                                </label>
                                                <div className="w-[1px] h-4 bg-white/60"></div>
                                                <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/40 rounded-lg transition'}`}>
                                                    <input type="checkbox" checked={perms.canEdit} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canEdit: e.target.checked } })} disabled={isMe} className="accent-[#26D0CE]" />
                                                    <span className="text-[12px] font-semibold text-[#1D1D1F]">Sửa</span>
                                                </label>
                                                <div className="w-[1px] h-4 bg-white/60"></div>
                                                <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#FF3B30]/10 rounded-lg transition'}`}>
                                                    <input type="checkbox" checked={perms.canDelete} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canDelete: e.target.checked } })} disabled={isMe} className="accent-[#FF3B30]" />
                                                    <span className="text-[12px] font-semibold text-[#1D1D1F]">Xóa</span>
                                                </label>
                                            </div>

                                            {/* KHỐI TRỪNG PHẠT (Cấm/Xóa) */}
                                            {!isMe && (
                                                <>
                                                    <button onClick={() => handleUpdateUser(id, { isBanned: !user.isBanned })} className={`px-3 py-2 text-[12px] font-bold rounded-xl transition border shadow-sm ${user.isBanned ? 'bg-[#1DB2A0]/10 text-[#1DB2A0] border-[#1DB2A0]/20 hover:bg-[#1DB2A0]/20' : 'bg-white/40 text-[#FF3B30] border-white/50 hover:bg-[#FF3B30]/10'}`}>
                                                        {user.isBanned ? 'Mở Khóa' : 'Cấm Cửa'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(id)} className="w-9 h-9 flex justify-center items-center bg-[#FF3B30]/10 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white rounded-xl transition-colors shadow-sm">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* --- GIAO DIỆN TRANG CHỦ --- */}
                {view === 'DASHBOARD' && (
                    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                            <div className="lg:col-span-7 liquid-glass-dark p-6 md:p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[180px] transition-transform duration-300 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 p-6 opacity-10"><BarChart3 size={120} strokeWidth={1} /></div>
                                <div className="relative z-10 flex items-center gap-2 mb-2"><h2 className="text-[13px] font-semibold uppercase tracking-widest text-white/70">Lợi Nhuận Ròng</h2></div>
                                <div className="relative z-10 mt-auto w-full min-w-0">
                                    <div className={`text-4xl md:text-[50px] font-bold tracking-tight mb-0.5 drop-shadow-sm whitespace-nowrap ${dashboardProfit >= 0 ? 'text-white' : 'text-[#FF453A]'}`}><AnimatedNumber value={dashboardProfit} /></div>
                                    <div className="text-[12px] text-[#81E4DA] font-semibold tracking-wider drop-shadow-sm mt-1">VIỆT NAM ĐỒNG</div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-5 grid grid-rows-2 gap-4 md:gap-6">
                                <div className="liquid-glass p-5 md:p-6 rounded-[28px] flex flex-col justify-between group hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 hover:bg-white/30 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 shrink-0"><div className="w-8 h-8 bg-white/40 rounded-full flex items-center justify-center border border-white/50"><Package size={15} className="text-[#1A5B82]"/></div><h2 className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider whitespace-nowrap">Kho & Vốn</h2></div>
                                        <div className="text-right pl-2"><div className="text-[12px] font-bold text-[#1D1D1F] tabular-nums whitespace-nowrap">{formatInput(globalTongCon)} <span className="text-[10px] text-[#5c5c5c] font-medium">/ {formatInput(globalTongNhap)}</span></div></div>
                                    </div>
                                    <div className="mt-auto flex justify-between items-end w-full min-w-0"><div className="text-[22px] md:text-[24px] font-bold text-[#1D1D1F] tabular-nums tracking-tight whitespace-nowrap">{formatCurrency(globalVonTon)}<span className="text-[13px] text-[#5c5c5c] ml-1 font-semibold">đ</span></div></div>
                                </div>
                                <div className="liquid-glass p-5 md:p-6 rounded-[28px] flex flex-col justify-between group hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 hover:bg-white/30 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 shrink-0"><div className="w-8 h-8 bg-white/40 rounded-full flex items-center justify-center border border-white/50"><Percent size={15} className="text-[#FF3B30]"/></div><h2 className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider whitespace-nowrap">Ước Tính Thuế</h2></div>
                                        <div className="text-right text-[11px] font-semibold text-[#5c5c5c] tabular-nums whitespace-nowrap pl-2">{displayRevenueTr} <span className="text-[#5c5c5c]">/ 500M</span></div>
                                    </div>
                                    <div className="mt-auto w-full min-w-0">
                                        <div className="text-[22px] md:text-[24px] font-bold text-[#1D1D1F] tabular-nums tracking-tight whitespace-nowrap">{showTax ? <AnimatedNumber value={taxAmount} /> : "0"}<span className="text-[13px] text-[#5c5c5c] ml-1 font-semibold">đ</span></div>
                                        <div className="w-full h-1.5 bg-white/40 rounded-full mt-2.5 overflow-hidden border border-white/50"><div className="h-full bg-gradient-to-r from-[#FF3B30] to-[#FF2D55] rounded-full" style={{width: `${Math.min((totalRevenueForTax/500000000)*100, 100)}%`}}></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="liquid-glass rounded-[32px] overflow-hidden min-w-0">
                            <div className="px-5 md:px-6 py-4 border-b border-white/30 flex justify-between items-center bg-white/10">
                                <h2 className="text-[17px] md:text-[18px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                                <span className="text-[12px] font-bold bg-white/40 text-[#1D1D1F] border border-white/40 px-2.5 py-0.5 rounded-full">{safeSessions.length}</span>
                            </div>
                            <div className="flex flex-col divide-y divide-white/30 w-full min-w-0 overflow-x-auto custom-scrollbar">
                                <div className="min-w-[850px]">
                                    {enrichedSessions.map((ss, index) => {
                                        if (!ss) return null;
                                        const sl_con = (ss.tong_sl_nhap || 0) - (ss.tong_sl_ban || 0);
                                        const isBanGreater = (ss.tong_sl_ban || 0) > sl_con;
                                        let displayVonTon = ss.tong_tien_ton_computed || 0;
                                        const sessionName = getSessionName(ss.name, ss.actual_start_date, ss.actual_end_date);
                                        return (
                                            <div key={ss.id || index} onClick={() => fetchDetail(ss.id)} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 cursor-pointer bg-transparent hover:bg-white/20 transition-colors duration-300 w-full min-w-0">
                                                
                                                {/* GIAO DIỆN MÁY TÍNH (FIXED COLUMNS) */}
                                                <div className="hidden lg:flex items-center w-full min-w-0">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{safeSessions.length - index}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 mb-0.5"><h3 className="font-bold text-[#1D1D1F] text-[13px] leading-snug truncate group-hover:text-[#1A5B82] transition-colors">{sessionName}</h3>{index === 0 && <span className="w-2 h-2 bg-[#1DB2A0] rounded-full shrink-0 shadow-[0_0_8px_rgba(29,178,160,0.6)]"></span>}</div>
                                                            <div className="text-[11px] text-[#5c5c5c] font-medium tabular-nums flex items-center gap-1"><Calendar size={11}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* GHIM CỐ ĐỊNH ĐỘ RỘNG CÁC Ô CHỈ SỐ */}
                                                    <div className="flex justify-center gap-2 shrink-0">
                                                        <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{ss.tong_sl_nhap || 0}</div></div>
                                                        <div className={`w-[60px] rounded-[14px] py-1.5 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/20 border-white/30'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[13px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{ss.tong_sl_ban || 0}</div></div>
                                                        <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{sl_con}</div></div>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-3 shrink-0 w-auto pl-2">
                                                        <div className="text-right space-y-0.5 hidden xl:block shrink-0 pr-1 min-w-[130px]">
                                                            <div className="flex justify-end gap-2 text-[11px]"><span className="text-[#5c5c5c] whitespace-nowrap">Chi phí</span> <span className="font-bold text-[#1D1D1F] tabular-nums">{formatCurrency((ss.so_tien_cua_kien || 0) + (ss.so_tien_giat_ui || 0) + ss.quang_cao)}</span></div>
                                                            <div className="flex justify-end gap-2 text-[10px] text-[#5c5c5c]"><span className="whitespace-nowrap">Vốn tồn</span> <span className="font-medium tabular-nums">{formatCurrency(displayVonTon)}</span></div>
                                                        </div>
                                                        <div className="text-right shrink-0 min-w-[110px]">
                                                            <div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                            <div className={`text-[16px] font-black tabular-nums tracking-tight whitespace-nowrap ${parseFloat(ss.realProfit) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(ss.realProfit)}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/40 ml-1">
                                                            {isAdmin && (
                                                                <button onClick={(e) => { e.stopPropagation(); setSalarySession(ss); setShowSalaryModal(true); }} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#1DB2A0] rounded-full transition-colors shadow-sm" title="Phát lương (30%)">
                                                                    <Wallet size={14}/>
                                                                </button>
                                                            )}
                                                            {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={14}/></button>}
                                                            {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={14}/></button>}
                                                            <ChevronRight size={18} className="text-[#8E8E93] ml-1 hidden xl:block" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* GIAO DIỆN ĐIỆN THOẠI */}
                                                <div className="flex flex-col gap-3.5 w-full lg:hidden min-w-0">
                                                    <div className="flex items-start gap-3 w-full min-w-0">
                                                        <div className="w-10 h-10 mt-0.5 rounded-full flex items-center justify-center font-bold text-[14px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{safeSessions.length - index}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 mb-1"><h3 className="font-bold text-[#1D1D1F] text-[15px] leading-snug break-words whitespace-normal group-hover:text-[#1A5B82] transition-colors">{sessionName}</h3>{index === 0 && <span className="w-2 h-2 bg-[#1DB2A0] rounded-full shrink-0 shadow-[0_0_8px_rgba(29,178,160,0.6)]"></span>}</div>
                                                            <div className="text-[12px] text-[#5c5c5c] font-medium tabular-nums flex items-center gap-1 mb-1.5"><Calendar size={12}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày</div>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5c5c5c]">
                                                                <span>C.phí: <strong className="text-[#1D1D1F]">{formatCurrency((ss.so_tien_cua_kien || 0) + (ss.so_tien_giat_ui || 0) + ss.quang_cao)}</strong></span>
                                                                <span>V.tồn: <strong className="text-[#1D1D1F]">{formatCurrency(displayVonTon)}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-white/20 pt-3 min-w-0">
                                                        <div className="flex gap-1.5 shrink-0">
                                                            <div className="w-[42px] bg-white/20 border border-white/30 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[11px] tabular-nums">{ss.tong_sl_nhap || 0}</div></div>
                                                            <div className={`w-[42px] rounded-[10px] py-1 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/20 border-white/30'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[11px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{ss.tong_sl_ban || 0}</div></div>
                                                            <div className="w-[42px] bg-white/20 border border-white/30 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[11px] tabular-nums">{sl_con}</div></div>
                                                        </div>
                                                        <div className="text-right shrink-1 min-w-0 flex-1 px-1.5">
                                                            <div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                            <div className={`text-[14px] sm:text-[15px] font-black tabular-nums tracking-tighter whitespace-nowrap ${parseFloat(ss.realProfit) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(ss.realProfit)}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/40 ml-1">
                                                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); setSalarySession(ss); setShowSalaryModal(true); }} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white hover:text-[#1DB2A0] rounded-full transition-colors shadow-sm"><Wallet size={12}/></button>}
                                                            {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={12}/></button>}
                                                            {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={12}/></button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GIAO DIỆN TRANG CHI TIẾT SẢN PHẨM --- */}
                {view === 'DETAIL' && detailData && (
                    <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/60 pb-4">
                            <button onClick={handleBack} className="flex items-center gap-1.5 text-[#1A5B82] hover:text-[#0B3B60] transition-colors font-semibold text-[15px] active:opacity-70 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm"><ChevronLeft size={18} strokeWidth={2.5}/> Trở về</button>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button onClick={handleExport} className="w-full sm:w-auto px-4 py-2 liquid-glass text-[#1D1D1F] font-semibold rounded-full shadow-sm hover:bg-white/50 transition-all text-[13px] flex items-center justify-center gap-2 active:opacity-70"><Download size={14}/> Xuất Excel</button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-[28px] md:text-[36px] font-black text-[#1D1D1F] tracking-tight leading-tight drop-shadow-sm break-words whitespace-normal">{getSessionName(detailData?.name, actualStartDate, actualEndDate)}</h2>
                                <p className="text-[13px] text-[#5c5c5c] font-medium mt-1 tabular-nums whitespace-nowrap">Thời gian hoạt động: {calculateDaysDiff(actualStartDate, actualEndDate)} ngày</p>
                            </div>
                            
                            <div className="flex flex-col md:items-end liquid-glass p-4 rounded-[20px] w-full md:w-auto min-w-[240px] shrink-0 relative overflow-hidden">
                                {isTargetReached && <div className="absolute inset-0 bg-[#1DB2A0]/10 animate-pulse-slow"></div>}
                                <div className="relative z-10 text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 flex items-center gap-1 whitespace-nowrap">
                                    {isTargetReached ? 'MỤC TIÊU: ĐÃ ĐẠT MỐC 🎉' : 'MỤC TIÊU LEO RANK'}
                                </div>
                                <div className="relative z-10 flex items-baseline w-full">
                                    <span className={`text-[32px] md:text-[40px] font-black tracking-tight tabular-nums drop-shadow-sm whitespace-nowrap block ${parseFloat(detailProfit) >= 0 ? (isTargetReached ? 'text-[#1DB2A0] drop-shadow-[0_0_10px_rgba(29,178,160,0.5)]' : 'text-[#1DB2A0]') : 'text-[#FF453A]'}`}>
                                        <AnimatedNumber value={detailProfit} />
                                    </span>
                                </div>
                                <div className="relative z-10 flex justify-between items-center w-full mt-1 mb-1 text-[10px] font-bold text-[#5c5c5c]">
                                    <span>Tiến độ</span>
                                    <span>Đích: {formatCurrency(dynamicTarget)}đ</span>
                                </div>
                                <div className="relative z-10 w-full md:w-48 h-2 bg-white/40 border border-white/50 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                            <div className="lg:col-span-4 space-y-6">
                                <div className="liquid-glass rounded-[28px] overflow-hidden flex flex-col h-full min-w-0">
                                    <div className="px-5 py-4 border-b border-white/40 flex items-center gap-2 bg-white/10"><Box size={18} className="text-[#1A5B82]" /><h3 className="text-[15px] font-bold text-[#1D1D1F] tracking-tight whitespace-nowrap">Chi phí Vốn</h3></div>
                                    <div className="p-5 flex-1 flex flex-col space-y-5 min-w-0">
                                        <div className="liquid-glass-dark p-5 rounded-[20px] relative overflow-hidden min-w-0">
                                            <div className="absolute right-0 top-0 opacity-10"><Package size={80} className="transform translate-x-1/4 -translate-y-1/4" /></div>
                                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1 whitespace-nowrap">Tổng Vốn Nhập</span>
                                            <div className="font-black text-white text-[28px] md:text-[30px] tabular-nums tracking-tight drop-shadow-sm whitespace-nowrap">{formatCurrency((detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + detailAutoAdCost)}<span className="text-[14px] text-white/70 ml-1 font-semibold">đ</span></div>
                                        </div>
                                        {canEdit && (
                                            <form onSubmit={handleAddBale} className="bg-white/20 p-4 rounded-[20px] space-y-3 shadow-sm border border-white/40 backdrop-blur-md">
                                                <input required placeholder="Tên lô hàng..." className="w-full min-w-0 liquid-input rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-[#1D1D1F] focus:border-[#26D0CE] outline-none transition-all" value={baleName} onChange={e=>setBaleName(e.target.value)} />
                                                <div className="flex gap-2 w-full">
                                                    <input required placeholder="Giá (VNĐ)" className="flex-1 min-w-0 liquid-input rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-[#1D1D1F] text-right focus:border-[#26D0CE] outline-none transition-all tabular-nums" value={formatInput(baleCost)} onChange={e => setBaleCost(e.target.value)} />
                                                    <input required placeholder="SL" className="w-[60px] shrink-0 liquid-input rounded-[12px] px-2 py-2.5 text-[14px] font-bold text-[#33A1FD] text-center focus:border-[#26D0CE] outline-none transition-all tabular-nums" value={formatInput(baleQty)} onChange={e => setBaleQty(e.target.value)} />
                                                </div>
                                                <button type="submit" className="w-full min-w-0 bg-white/60 text-[#1A5B82] border border-white/80 shadow-sm py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white transition-colors active:opacity-70 mt-1 whitespace-nowrap">Thêm Vốn Nhập</button>
                                            </form>
                                        )}
                                        {(importedBales || []).length > 0 && (
                                            <div className="space-y-2">
                                                {(importedBales || []).map(b => {
                                                    if (!b) return null;
                                                    return (
                                                    <div key={b.id} className="p-3 bg-white/30 border border-white/40 rounded-[14px] flex items-center justify-between group shadow-sm min-w-0">
                                                        <div className="flex-1 min-w-0 pr-2"><div className="text-[13px] font-bold text-[#1D1D1F] truncate">{b.name || ''}</div><div className="text-[11px] text-[#5c5c5c] mt-0.5 font-medium truncate">SL: <span className="font-semibold text-[#1D1D1F]">{b.qty || 0}</span> • TB: {formatCurrency((b.cost || 0) / (b.qty || 1))}</div></div>
                                                        <div className="flex items-center gap-2 shrink-0"><span className="font-bold text-[#1D1D1F] text-[14px] tabular-nums whitespace-nowrap">{formatCurrency(b.cost || 0)}</span>{canDelete && <button type="button" onClick={() => handleDeleteBale(b.id)} className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors bg-white/40 hover:bg-[#FF3B30]/10 p-1.5 rounded-full border border-white/50 shadow-sm"><X size={12}/></button>}</div>
                                                    </div>
                                                )})}
                                            </div>
                                        )}
                                        <div className="mt-auto space-y-4 pt-4 border-t border-white/40 min-w-0">
                                            <div className="min-w-0"><label className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1.5 block pl-1 whitespace-nowrap">Chi phí Giặt ủi / Khác</label><input disabled={!canEdit} className="w-full min-w-0 liquid-input rounded-[16px] px-4 py-3 font-bold text-right text-[#1D1D1F] text-[18px] focus:border-[#33A1FD] outline-none transition-all tabular-nums shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" value={formatInput(detailData?.so_tien_giat_ui || 0)} onFocus={e => e.target.select()} onChange={e => updateSessionField('so_tien_giat_ui', parseInput(e.target.value))} /></div>
                                            <div className="bg-white/20 border border-white/30 p-4 rounded-[16px] space-y-2.5 text-[13px] backdrop-blur-md min-w-0">
                                                <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tổng Hàng Nhập</span><span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatInput(detailData?.computed?.tong_sl_nhap || 0)}</span></div>
                                                <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tổng Đã Bán</span><span className="font-bold text-[#1DB2A0] tabular-nums shrink-0 whitespace-nowrap">{formatInput(detailData?.computed?.tong_sl_ban || 0)}</span></div>
                                                <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tồn Kho</span><span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatInput((detailData?.computed?.tong_sl_nhap || 0) - (detailData?.computed?.tong_sl_ban || 0))}</span></div>
                                                <div className="flex justify-between gap-2 text-[#5c5c5c] pt-2.5 border-t border-white/30 mt-1">
                                                    <span className="whitespace-nowrap">Quảng cáo (Auto)</span>
                                                    <span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatCurrency(detailAutoAdCost)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 flex flex-col h-auto gap-6 md:gap-8 min-w-0">
                                {canEdit && (
                                    <form onSubmit={handleAddItem} className="liquid-glass p-5 md:p-6 rounded-[28px] mb-2 min-w-0">
                                        <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-white/60 border border-white/80 rounded-full flex items-center justify-center text-[#1A5B82] shadow-sm shrink-0"><Plus size={16} strokeWidth={2.5}/></div><h3 className="text-[16px] font-bold text-[#1D1D1F] tracking-tight truncate">Ghi nhận giao dịch mới</h3></div>
                                        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                                            <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Ngày</label><input type="date" required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[12px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F]" value={newItem.ngay_ban} onChange={e => setNewItem({...newItem, ngay_ban: e.target.value})}/></div>
                                            <div className="col-span-2 md:col-span-3 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Sản Phẩm</label><input required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[12px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F]" placeholder="VD: Sơ mi..." value={newItem.ten_san_pham} onChange={e => setNewItem({...newItem, ten_san_pham: e.target.value})}/></div>
                                            <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Link</label><input className="w-full min-w-0 px-3 py-3 text-[14px] font-medium liquid-input rounded-[12px] focus:border-[#26D0CE] outline-none transition-all text-[#1A5B82]" placeholder="Opt..." value={newItem.link_san_pham} onChange={e => setNewItem({...newItem, link_san_pham: e.target.value})}/></div>
                                            <div className="col-span-1 md:col-span-1 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Nhập</label><input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1A5B82] liquid-input rounded-[12px] text-center focus:border-[#26D0CE] outline-none transition-all tabular-nums" placeholder="0" value={formatInput(newItem.so_luong_nhap)} onChange={e => setNewItem({...newItem, so_luong_nhap: e.target.value})}/></div>
                                            <div className="col-span-1 md:col-span-1 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Bán</label><input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1DB2A0] liquid-input rounded-[12px] text-center focus:border-[#1DB2A0] outline-none transition-all tabular-nums" placeholder="0" value={formatInput(newItem.so_luong)} onChange={e => setNewItem({...newItem, so_luong: e.target.value})}/></div>
                                            <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-right pr-1 whitespace-nowrap">Tổng thu</label><input required className="w-full min-w-0 px-3 py-3 text-[15px] font-bold liquid-input rounded-[12px] text-right focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] tabular-nums" placeholder="0" value={formatInput(newItem.so_tien_ban_duoc)} onChange={e => setNewItem({...newItem, so_tien_ban_duoc: e.target.value})}/></div>
                                            <div className="col-span-2 md:col-span-1 min-w-0"><button type="submit" disabled={isProcessingAdd} className="w-full min-w-0 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3 rounded-[12px] font-bold hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 h-[44px] shadow-md active:opacity-70"><Plus size={18} strokeWidth={2.5}/></button></div>
                                        </div>
                                    </form>
                                )}

                                <div className="liquid-glass rounded-[28px] overflow-hidden min-w-0 mt-2">
                                    <div className="px-5 md:px-6 py-4 border-b border-white/40 flex justify-between items-center bg-white/10">
                                        <h2 className="text-[16px] font-bold text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                                        <span className="text-[12px] font-bold bg-white/40 border border-white/50 text-[#1D1D1F] px-2.5 py-0.5 rounded-full">{(detailData?.daily || []).length}</span>
                                    </div>
                                    <div className="flex flex-col divide-y divide-white/30 pb-6 min-w-0 overflow-x-auto custom-scrollbar">
                                        <div className="min-w-[850px]">
                                            {(enrichedDaily || []).map((row, index) => {
                                                if (!row) return null;
                                                const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                                                return (
                                                    <div key={row.id || index} className={`p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors hover:bg-white/30 w-full min-w-0 ${index === 0 ? 'bg-white/40' : ''} ${row.id === mvpRowId && index !== 0 ? 'bg-[#FF9500]/10' : ''}`}>
                                                        
                                                        {/* GIAO DIỆN MÁY TÍNH (FIXED COLUMNS) */}
                                                        <div className="hidden lg:flex items-center w-full min-w-0">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{row.stt || 0}</div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-1 mb-0.5">
                                                                        {row.id === mvpRowId && <Crown size={14} className="text-[#FF9500] shrink-0" />}
                                                                        <h3 className="font-bold text-[#1D1D1F] text-[13px] leading-snug truncate group-hover:text-[#1A5B82] transition-colors">{row.ten_san_pham || ''}</h3>
                                                                        {row.link_san_pham && <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#1A5B82] bg-white/50 border border-white/60 shadow-sm p-1 rounded-full hover:bg-white transition-colors shrink-0 ml-1"><LinkIcon size={10}/></a>}
                                                                    </div>
                                                                    <div className="text-[11px] text-[#5c5c5c] font-medium tabular-nums whitespace-nowrap">{formatDateDisplay(row.ngay_ban)}</div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* GHIM CỐ ĐỊNH ĐỘ RỘNG CÁC Ô CHỈ SỐ TRANG CHI TIẾT */}
                                                            <div className="flex justify-center gap-2 shrink-0">
                                                                <div className="w-[60px] bg-white/30 border border-white/40 rounded-[12px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div></div>
                                                                <div className={`w-[60px] rounded-[12px] py-1.5 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/30 border-white/40'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[13px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{formatInput(row.so_luong || 0)}</div></div>
                                                                <div className="w-[60px] bg-white/30 border border-white/40 rounded-[12px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{formatInput(row.sl_con || 0)}</div></div>
                                                            </div>

                                                            <div className="flex items-center justify-end gap-3 shrink-0 w-auto pl-2">
                                                                <div className="text-right space-y-0.5 hidden xl:block shrink-0 pr-1 min-w-[130px]">
                                                                    <div className="flex justify-end gap-2 text-[11px]"><span className="text-[#5c5c5c] whitespace-nowrap">Doanh thu</span> <span className="font-bold text-[#1D1D1F] tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span></div>
                                                                    <div className="flex justify-end gap-2 text-[10px] text-[#5c5c5c]"><span className="whitespace-nowrap">Vốn tồn</span> <span className="font-medium tabular-nums">{formatCurrency(row.tien_ton || 0)}</span></div>
                                                                </div>
                                                                <div className="text-right shrink-0 min-w-[110px]">
                                                                    <div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                                    <div className={`text-[16px] font-black tabular-nums tracking-tight whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(row.loi || 0)}</div>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/40 ml-1">
                                                                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={14}/></button>}
                                                                    {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={14}/></button>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* GIAO DIỆN ĐIỆN THOẠI */}
                                                        <div className="flex flex-col gap-3 w-full lg:hidden min-w-0">
                                                            <div className="flex items-start gap-3 w-full min-w-0">
                                                                <div className="w-8 h-8 mt-0.5 rounded-full bg-white/60 border border-white/80 text-[#1D1D1F] flex items-center justify-center font-bold text-[10px] shrink-0 tabular-nums shadow-sm">{row.stt || 0}</div>
                                                                <div className="min-w-0 flex-1 pr-2">
                                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                                        {row.id === mvpRowId && <Crown size={14} className="text-[#FF9500] shrink-0" />}
                                                                        <h3 className="font-bold text-[#1D1D1F] text-[11px] leading-snug break-words">{row.ten_san_pham || ''}</h3>
                                                                        {row.link_san_pham && <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#1A5B82] bg-white/50 border border-white/60 shadow-sm p-1 rounded-full hover:bg-white transition-colors shrink-0"><LinkIcon size={8}/></a>}
                                                                    </div>
                                                                    <div className="text-[8px] text-[#5c5c5c] font-medium tabular-nums whitespace-nowrap">{formatDateDisplay(row.ngay_ban)}</div>
                                                                    
                                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-[#5c5c5c] mt-1">
                                                                        <span>D.thu: <strong className="text-[#1D1D1F]">+{formatCurrency(row.so_tien_ban_duoc || 0)}</strong></span>
                                                                        <span>V.tồn: <strong className="text-[#1D1D1F]">{formatCurrency(row.tien_ton || 0)}</strong></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center border-t border-white/20 pt-2.5 min-w-0">
                                                                <div className="flex gap-1.5 shrink-0">
                                                                    <div className="w-[40px] bg-white/30 border border-white/40 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[7px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[10px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div></div>
                                                                    <div className={`w-[40px] rounded-[10px] py-1 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/30 border-white/40'}`}><div className={`text-[7px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[10px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{formatInput(row.so_luong || 0)}</div></div>
                                                                    <div className="w-[40px] bg-white/30 border border-white/40 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[7px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[10px] tabular-nums">{formatInput(row.sl_con || 0)}</div></div>
                                                                </div>
                                                                <div className="text-right shrink-1 min-w-0 flex-1 px-1.5">
                                                                    <div className="text-[7px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                                    <div className={`text-[13px] sm:text-[14px] font-black tabular-nums tracking-tighter whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(row.loi || 0)}</div>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/40">
                                                                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="p-1.5 text-[#5c5c5c] bg-white/40 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={12}/></button>}
                                                                    {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="p-1.5 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={12}/></button>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}