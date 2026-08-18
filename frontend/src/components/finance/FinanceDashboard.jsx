import React, { useState } from 'react';
import InvoiceGrid from './InvoiceGrid';
import CreateInvoiceForm from './CreateInvoiceForm';

const FinanceDashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans antialiased text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Subsystem Navbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Operations Suite</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage system billing records, view student ledgers, and audit payment parameters.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-[0.98] transition-all"
                    >
                        + Create Student Invoice
                    </button>
                </div>

                {/* Primary Data Table Grid Context */}
                <div className="w-full">
                    <InvoiceGrid refreshTrigger={refreshTrigger} onSelectInvoice={(id) => console.log(`Selected Invoice Node ID: ${id}`)} />
                </div>
            </div>

            {/* Modal Form Overlay Canvas */}
            {showCreateModal && (
                <CreateInvoiceForm
                    onInvoiceCreated={triggerRefresh}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default FinanceDashboard;
