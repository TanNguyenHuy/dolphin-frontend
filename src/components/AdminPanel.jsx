import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../utils';

// Import các Module đã bóc tách
import Toast from './Toast';
import ConfirmModal from './admin/ConfirmModal';
import BillModal from './admin/BillModal';
import UserCard from './admin/UserCard';

export default function AdminPanel({ setView, authUser }) {
    const [users, setUsers] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    const [editExpiryId, setEditExpiryId] = useState(null);
    const [expiryVal, setExpiryVal] = useState(1);
    const [expiryUnit, setExpiryUnit] = useState('minutes'); 

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, isDanger: false });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const confirmAction = (title, message, onConfirm, isDanger = false) => {
        setConfirmModal({ show: true, title, message, onConfirm, isDanger });
    };

    useEffect(() => { 
        fetchUsers(); 
        const adminRadar = setInterval(fetchUsers, 5000); 
        return () => clearInterval(adminRadar);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data);
        } catch (error) { console.error(error); }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`${API_URL}/users/${id}/approve`);
            fetchUsers();
            showToast("Đã duyệt thành công!", "success");
        } catch (e) { showToast("Lỗi duyệt tài khoản!", "error"); }
    };

    const togglePermission = async (id, currentPermissions, field) => {
        const updated = { ...currentPermissions, [field]: !currentPermissions[field] };
        await axios.put(`${API_URL}/users/${id}`, { permissions: updated });
        fetchUsers();
        showToast("Đã cập nhật quyền!", "success");
    };

    const handleChangePlan = (id, newPlan, currentPermissions) => {
        const planName = newPlan === 'premium' ? '💎 PREMIUM' : newPlan === '100k' ? '🥇 VVIP' : newPlan === '50k' ? '🥈 VIP' : '🥉 CƠ BẢN';
        
        confirmAction("Xác Nhận Đổi Gói", `Sếp có chắc chắn đổi khách hàng này sang gói ${planName}? Hạn sử dụng sẽ được tính lại từ hôm nay!`, async () => {
            let canViewDetail = currentPermissions?.canViewDetail || false;
            if (newPlan === '50k' || newPlan === '100k' || newPlan === 'premium') canViewDetail = true;
            else canViewDetail = false;

            const updatedPermissions = { ...currentPermissions, canViewDetail };
            const updatePayload = { plan: newPlan, permissions: updatedPermissions };

            if (newPlan === 'premium') {
                updatePayload.planExpiry = null;
                updatePayload.isApproved = true;
            }

            try {
                await axios.put(`${API_URL}/users/${id}/change-plan`, updatePayload);
                fetchUsers();
                setConfirmModal({ show: false });
                showToast(`Đã nâng cấp lên ${planName}!`, "success");
            } catch (e) { showToast("Lỗi khi cập nhật gói!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const submitCustomExpiry = (id) => {
        if (!expiryVal || expiryVal <= 0) return showToast("Vui lòng nhập số lượng hợp lệ!", "error");
        
        let seconds = 0;
        const val = parseInt(expiryVal);
        if (expiryUnit === 'seconds') seconds = val;
        if (expiryUnit === 'minutes') seconds = val * 60;
        if (expiryUnit === 'hours') seconds = val * 3600;
        if (expiryUnit === 'days') seconds = val * 86400;

        const unitName = expiryUnit === 'seconds' ? 'Giây' : expiryUnit === 'minutes' ? 'Phút' : expiryUnit === 'hours' ? 'Giờ' : 'Ngày';
        
        confirmAction("Xác Nhận Ép Hạn", `Sếp chắc chắn ép hạn sử dụng còn đúng ${val} ${unitName}?`, async () => {
            try {
                const exactExpiryDate = new Date(Date.now() + seconds * 1000).toISOString();
                await axios.put(`${API_URL}/users/${id}/force-expiry`, { expiryDate: exactExpiryDate });
                fetchUsers();
                setEditExpiryId(null); 
                setConfirmModal({ show: false });
                showToast("Đã cập nhật hạn sử dụng thành công!", "success");
            } catch (e) { showToast("Lỗi ép ngày!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const handleDeleteUser = (id) => {
        confirmAction("Xóa Tài Khoản", "Xóa vĩnh viễn tài khoản này? Hành động không thể hoàn tác!", async () => {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
                setConfirmModal({ show: false });
                showToast("Đã xóa tài khoản thành công!", "success");
            } catch (e) { showToast("Lỗi xóa tài khoản!", "error"); setConfirmModal({ show: false }); }
        }, true);
    };

    const handleRestrict = async (id, days) => {
        let restrictedUntil = null;
        let isBanned = false;
        
        if (days === 'forever') {
            isBanned = true;
        } else if (days !== '0' && days !== 'restricted') {
            restrictedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
        }

        try {
            await axios.put(`${API_URL}/users/${id}`, { restrictedUntil, isBanned });
            fetchUsers();
            showToast(days === '0' ? "Đã gỡ bỏ hạn chế!" : "Đã cập nhật trạng thái hạn chế!", "success");
        } catch (error) { showToast("Lỗi cập nhật trạng thái!", "error"); }
    };

    const handleRestrictChat = async (id, days) => {
        try {
            await axios.put(`${API_URL}/users/${id}/restrict-chat`, { days });
            fetchUsers();
            showToast(days === '0' ? "Đã gỡ lệnh cấm chat!" : "Đã cấm chat thành công!", "success");
        } catch (error) { showToast("Lỗi cập nhật cấm chat!", "error"); }
    };

    const getRestrictStatus = (u) => {
        if (u.isBanned) return 'forever';
        if (u.restrictedUntil && new Date(u.restrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    const getChatRestrictStatus = (u) => {
        if (u.isChatBanned) return 'forever';
        if (u.chatRestrictedUntil && new Date(u.chatRestrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return null;
        const now = new Date(); const exp = new Date(expiryDate);
        if (now > exp) return "Đã hết hạn";
        
        const diff = Math.abs(exp - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
        if (hours > 0) return `Còn ${hours} giờ ${mins} phút`;
        if (mins > 0) return `Còn ${mins} phút ${secs} giây`;
        return `Còn ${secs} giây`;
    };

    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="animate-fade-in-up pb-20">
            <Toast toast={toast} />
            <ConfirmModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} />
            <BillModal selectedBill={selectedBill} setSelectedBill={setSelectedBill} />

            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-gray-500 font-bold bg-white px-6 py-3 rounded-full shadow-sm border hover:text-[#26D0CE] transition-all"><ArrowLeft size={18} /> Dashboard</button>
                <h2 className="text-[28px] font-black text-gray-800">Cài Đặt Hệ Thống</h2>
            </div>

            <div className="space-y-4">
                {users.map(u => (
                    <UserCard 
                        key={u._id}
                        u={u}
                        getRestrictStatus={getRestrictStatus}
                        getChatRestrictStatus={getChatRestrictStatus}
                        getRemainingTime={getRemainingTime}
                        handleDeleteUser={handleDeleteUser}
                        setSelectedBill={setSelectedBill}
                        handleApprove={handleApprove}
                        togglePermission={togglePermission}
                        handleChangePlan={handleChangePlan}
                        editExpiryId={editExpiryId}
                        setEditExpiryId={setEditExpiryId}
                        expiryVal={expiryVal}
                        setExpiryVal={setExpiryVal}
                        expiryUnit={expiryUnit}
                        setExpiryUnit={setExpiryUnit}
                        submitCustomExpiry={submitCustomExpiry}
                        handleRestrictChat={handleRestrictChat}
                        handleRestrict={handleRestrict}
                    />
                ))}
            </div>
        </div>
    );
}