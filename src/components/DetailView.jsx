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
        <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10">
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
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* ---------- CỘT TRÁI: CHI PHÍ VỐN ---------- */}
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

                {/* ---------- CỘT PHẢI: TẠO MỚI & DANH SÁCH SP ---------- */}
                <div className="lg:col-span-8 flex flex-col h-auto gap-6 md:gap-8 min-w-0">
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
                    />
                </div>
            </div>
        </div>
    );
}