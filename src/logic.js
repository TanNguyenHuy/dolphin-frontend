// Bộ não xử lý tính toán dữ liệu độc lập cho Dolphin

export const parseIGSyncText = (syncText) => {
    let q = 0; let r = 0;
    let matchQ = syncText.match(/(?:quét|có|tổng)[:\s]*(\d+)\s*món/i) || syncText.match(/(?:quét|có|tổng)[:\s]*(\d+)/i);
    let matchR = syncText.match(/(?:tổng|thu)[:\s]*([\d,\.]+)\s*(k|nghìn|nghin|đ|vnd)?/i);
    
    if (matchQ && matchR && syncText.toLowerCase().includes('tổng')) {
        q = Number(matchQ[1]);
        let num = Number(matchR[1].replace(/[^\d]/g, ''));
        if (matchR[2] && (matchR[2].toLowerCase() === 'k' || matchR[2].toLowerCase().includes('nghìn') || matchR[2].toLowerCase().includes('nghin'))) num *= 1000;
        else if (syncText.toLowerCase().includes('k')) num *= 1000;
        r = num;
    } else {
        try {
            let parsed = JSON.parse(syncText);
            let dataArray = [];
            if (Array.isArray(parsed)) { dataArray = parsed; } 
            else if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.data)) dataArray = parsed.data;
                else if (Array.isArray(parsed.items)) dataArray = parsed.items;
            }

            if (dataArray.length > 0) {
                q = dataArray.length; 
                dataArray.forEach(item => {
                    let itemPrice = 0;
                    if (typeof item === 'object' && item !== null) {
                        for (let key in item) {
                            let k = key.toLowerCase();
                            if (k.includes('price') || k.includes('gia') || k.includes('sale') || k.includes('amount') || k.includes('total') || k === 'p') {
                                let val = item[key];
                                if (typeof val === 'number') {
                                    itemPrice = val;
                                    if (itemPrice > 0 && itemPrice < 10000) itemPrice *= 1000; 
                                    break;
                                } else if (typeof val === 'string') {
                                    let p = Number(val.replace(/[^\d]/g, ''));
                                    if (p > 0) {
                                        itemPrice = p;
                                        if (val.toLowerCase().includes('k') || itemPrice < 10000) itemPrice *= 1000;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (itemPrice === 0 && typeof item === 'object' && item !== null) {
                        let itemStr = JSON.stringify(item).toLowerCase().replace(/\\[nr]/g, ' ');
                        itemStr = itemStr.replace(/https?:\/\/[^\s]+/g, '');
                        let matches = [...itemStr.matchAll(/(?:giá|gia|sale)\s*[:\-]?\s*([0-9\.\,]+)\s*(k|nghìn|nghin|đ|vnd|cành)?/gi)];
                        if (matches.length > 0) {
                            for (let m of matches) {
                                let p = Number(m[1].replace(/[^\d]/g, ''));
                                let unit = m[2] ? m[2].trim() : '';
                                if (unit === 'k' || unit.includes('nghìn') || unit.includes('nghin') || unit === 'cành') p *= 1000;
                                else if (p > 0 && p < 10000) p *= 1000; 
                                if (p > itemPrice && p < 10000000) itemPrice = p; 
                            }
                        } else {
                            let fallbackMatches = [...itemStr.matchAll(/([0-9\.\,]+)\s*(k|nghìn|nghin|cành)/gi)];
                            for (let m of fallbackMatches) {
                                let p = Number(m[1].replace(/[^\d]/g, ''));
                                if (p > 10 && p < 10000) {
                                    let tempPrice = p * 1000;
                                    if (tempPrice > itemPrice && tempPrice < 10000000) itemPrice = tempPrice;
                                }
                            }
                        }
                    }
                    r += itemPrice; 
                });
            }
        } catch (e) { console.error("Lỗi đọc JSON:", e); }
    }
    return { q, r };
};

export const calculateGlobalStats = (enrichedSessions) => {
    const dashboardProfit = enrichedSessions.reduce((sum, s) => sum + s.realProfit, 0);
    const totalRevenueForTax = enrichedSessions.reduce((sum, s) => sum + (s.tong_doanh_thu || 0), 0);
    const taxBase = totalRevenueForTax - 500000000; 
    const taxAmount = taxBase > 0 ? taxBase * 0.015 : 0; 
    const showTax = taxAmount > 0;
    const displayRevenueTr = (totalRevenueForTax / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    
    let globalTongNhap = 0; 
    let globalTongBan = 0; 
    let globalVonTon = 0;
    let hangBiLoai = 0; 

    enrichedSessions.forEach(ss => { 
        const nameLower = String(ss?.name || '').toLowerCase();
        const isSale = nameLower.includes('sale');
        const isDangLai = nameLower.includes('đăng lại') || nameLower.includes('dang lai');

        if (isSale) {
            hangBiLoai += (ss?.tong_sl_nhap || 0);
        } else if (isDangLai) {
            globalTongBan += (ss?.tong_sl_ban || 0);
        } else {
            globalTongNhap += (ss?.tong_sl_nhap || 0); 
            globalTongBan += (ss?.tong_sl_ban || 0);
            globalVonTon += (ss?.tong_tien_ton_computed || 0); 
        }
    });

    const globalTongCon = Math.max(0, globalTongNhap - globalTongBan - hangBiLoai);

    return { dashboardProfit, totalRevenueForTax, taxAmount, showTax, displayRevenueTr, globalTongNhap, globalTongBan, globalVonTon, globalTongCon };
};

export const calculateDetailStats = (detailData, importedBales, AD_COST_PER_SALE) => {
    let detailProfit = 0; let mvpRowId = null; let enrichedDaily = []; let detailAutoAdCost = 0;
    let actualStartDate = detailData?.start_date; let actualEndDate = detailData?.start_date;
    let dynamicTarget = 10000000; let isTargetReached = false;

    if (!detailData) return { detailProfit, mvpRowId, enrichedDaily, detailAutoAdCost, actualStartDate, actualEndDate, dynamicTarget, isTargetReached };

    const dailyList = Array.isArray(detailData.daily) ? detailData.daily : [];
    const itemCount = dailyList.length;
    dynamicTarget = Math.max(1, Math.ceil(itemCount / 4)) * 10000000;
    detailAutoAdCost = itemCount * AD_COST_PER_SALE;
    
    const computedGiatUi = Math.round((detailData.so_tien_cua_kien || 0) * 0.04);
    detailProfit = (detailData.computed?.tong_doanh_thu || 0) - (detailData.so_tien_cua_kien || 0) - computedGiatUi - detailAutoAdCost;
    isTargetReached = detailProfit >= dynamicTarget && itemCount > 0;

    const dates = dailyList.map(d => new Date(d.ngay_ban).getTime()).filter(t => !isNaN(t));
    if (dates.length > 0) { actualStartDate = new Date(Math.min(...dates)).toISOString().split('T')[0]; actualEndDate = new Date(Math.max(...dates)).toISOString().split('T')[0]; }

    const safeImportedBalesForSort = Array.isArray(importedBales) ? importedBales : [];
    let maxRevenue = -Infinity; const sortedBales = [...safeImportedBalesForSort].sort((a,b) => String(b.name || '').length - String(a.name || '').length);

    let chronologicalList = [...dailyList].map((item, idx) => ({...item, originalIdx: idx}));
    chronologicalList.sort((a, b) => {
        const dateA = new Date(a.ngay_ban || 0).getTime();
        const dateB = new Date(b.ngay_ban || 0).getTime();
        if (dateA === dateB) return a.originalIdx - b.originalIdx;
        return dateA - dateB;
    });

    chronologicalList = chronologicalList.map((row, index, arr) => {
        const matchedBale = sortedBales.find(b => String(row.ten_san_pham || '').toLowerCase().includes(String(b.name || '').toLowerCase()));
        let sl_nhap = row.so_luong_nhap || 0; let sl_con = sl_nhap - (row.so_luong || 0); let loi = 0; let tien_ton = 0; let avgCost = 0;
        
        if (matchedBale) {
            avgCost = (matchedBale.cost || 0) / (matchedBale.qty || 1); 
            tien_ton = Math.round(sl_con * avgCost);
            let cumulativeRevenue = 0;
            for (let i = 0; i <= index; i++) {
                if (String(arr[i].ten_san_pham || '').toLowerCase().includes(String(matchedBale.name || '').toLowerCase())) {
                    cumulativeRevenue += (arr[i].so_tien_ban_duoc || 0);
                }
            }
            loi = Math.round(cumulativeRevenue - (matchedBale.cost || 0)); 
        } else {
            avgCost = detailData.computed?.trung_binh || 0; 
            tien_ton = Math.round(sl_con * avgCost); 
            loi = Math.round(row.so_tien_ban_duoc || 0);
        }
        
        if ((row.so_tien_ban_duoc || 0) > maxRevenue && (row.so_tien_ban_duoc || 0) > 0) { maxRevenue = row.so_tien_ban_duoc; mvpRowId = row.id; }
        return { ...row, loi, sl_nhap, sl_con, tien_ton }; 
    });

    enrichedDaily = [...chronologicalList].sort((a, b) => {
        const dateA = new Date(a.ngay_ban || 0).getTime();
        const dateB = new Date(b.ngay_ban || 0).getTime();
        if (dateB === dateA) return b.originalIdx - a.originalIdx;
        return dateB - dateA;
    });

    enrichedDaily = enrichedDaily.map((row, idx) => ({ ...row, stt: enrichedDaily.length - idx }));

    return { detailProfit, mvpRowId, enrichedDaily, detailAutoAdCost, actualStartDate, actualEndDate, dynamicTarget, isTargetReached };
};