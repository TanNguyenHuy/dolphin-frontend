import React from 'react';
import DetailHeader from './detail/DetailHeader';
import CapitalManagement from './detail/CapitalManagement';
import TransactionForm from './detail/TransactionForm';
import TransactionList from './detail/TransactionList';

export default function DetailView({
    detailData, handleBack, handleExport, actualStartDate, actualEndDate, isTargetReached, detailProfit, 
    dynamicTarget, progressPercent, detailAutoAdCost, canEdit, canDelete, 
    handleAddBale, baleName, setBaleName, baleCost, setBaleCost, baleQty, setBaleQty, 
    importedBales, handleDeleteBale, updateSessionField, handleAddItem, newItem, setNewItem, 
    isProcessingAdd, enrichedDaily, mvpRowId, handleStartEdit, handleDeleteRow, isProcessingEdit, isProcessingDelete,
    handleStartSync
}) {
    return (
        <div className="relative animate-fade-in-up pb-24 max-w-[1400px] mx-auto pt-4">
            
            {/* AMBIENT GLOW: Không gian 3D mờ ảo chuẩn Glassmorphism */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-purple-300/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
            </div>

            <div className="space-y-8 md:space-y-10">
                {/* ---------- HEADER: THÔNG TIN TỔNG QUAN ---------- */}
                <DetailHeader 
                    detailData={detailData}
                    handleBack={handleBack}
                    handleExport={handleExport}
                    actualStartDate={actualStartDate}
                    actualEndDate={actualEndDate}
                    isTargetReached={isTargetReached}
                    detailProfit={detailProfit}
                    dynamicTarget={dynamicTarget}
                    progressPercent={progressPercent}
                    
                    // --- ĐÃ THÊM 2 DÒNG NÀY ĐỂ HEADER NHẬN LỆNH CHỐT SỔ ---
                    canEdit={canEdit}
                    updateSessionField={updateSessionField}
                />

                {/* ---------- LƯỚI BỐ CỤC CHUẨN 8DP RHYTHM ---------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                    
                    {/* CỘT TRÁI (Tỷ lệ 4/12): CHI PHÍ VỐN */}
                    <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
                        <CapitalManagement 
                            detailData={detailData}
                            detailAutoAdCost={detailAutoAdCost}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            handleAddBale={handleAddBale}
                            baleName={baleName} setBaleName={setBaleName}
                            baleCost={baleCost} setBaleCost={setBaleCost}
                            baleQty={baleQty} setBaleQty={setBaleQty}
                            importedBales={importedBales}
                            handleDeleteBale={handleDeleteBale}
                        />
                    </div>

                    {/* CỘT PHẢI (Tỷ lệ 8/12): TẠO MỚI & DANH SÁCH SP */}
                    <div className="lg:col-span-8 flex flex-col min-w-0 gap-8 md:gap-10">
                        <TransactionForm 
                            canEdit={canEdit}
                            handleAddItem={handleAddItem}
                            newItem={newItem} setNewItem={setNewItem}
                            isProcessingAdd={isProcessingAdd}
                        />

                        <TransactionList 
                            enrichedDaily={enrichedDaily}
                            detailData={detailData}
                            mvpRowId={mvpRowId}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            handleStartSync={handleStartSync}
                            isProcessingEdit={isProcessingEdit}
                            isProcessingDelete={isProcessingDelete}
                            handleStartEdit={handleStartEdit}
                            handleDeleteRow={handleDeleteRow}
                            importedBales={importedBales} /* <-- DÒNG NÀY VỪA ĐƯỢC THÊM VÀO NÈ */
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}