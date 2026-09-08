import React, { useState, useEffect } from 'react';
import financeApi from './financeApi';

const InvoiceGrid = ({ refreshTrigger, onSelectInvoice }) => {
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, [page, refreshTrigger]);

    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            // Invokes our paginated, sorted backend API controller routing tier
            const response = await financeApi.get(`/invoices?page=${page}&size=${size}&sortBy=createdAt&direction=desc`);
            setInvoices(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to populate billing database arrays.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'PARTIALLY_PAID': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'ISSUED': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 text-lg">Billing & Invoice Tracking Registers</h3>
                {loading && <span className="text-sm text-blue-600 animate-pulse font-medium">Refreshing database...</span>}
            </div>

            {error && <div className="p-4 m-4 bg-rose-50 text-rose-600 text-sm rounded-lg font-medium">{error}</div>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Issue / Due Date</th>
                        <th className="p-4 text-right">Total Amount</th>
                        <th className="p-4 text-right">Outstanding Balance</th>
                        <th className="p-4 text-center">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {invoices.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400 font-medium bg-white">No historical billing invoices found matching current page index constraints.</td>
                        </tr>
                    ) : (
                        invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/70 transition cursor-pointer" onClick={() => onSelectInvoice(inv.id)}>
                                <td className="p-4 font-mono font-semibold text-blue-600">{inv.invoiceNumber}</td>
                                <td className="p-4 font-medium text-slate-800">
                                    {inv.student ? `${inv.student.firstName || ''} ${inv.student.lastName || 'Student'}` : 'N/A'}
                                </td>
                                <td className="p-4 text-slate-500 text-xs">
                                    <div>Issued: {inv.issueDate}</div>
                                    <div className="mt-0.5 text-rose-500 font-medium">Due: {inv.dueDate}</div>
                                </td>
                                <td className="p-4 text-right font-semibold text-slate-900">TZS {parseFloat(inv.totalAmount).toLocaleString()}</td>
                                <td className="p-4 text-right font-semibold text-rose-600">TZS {parseFloat(inv.balanceAmount).toLocaleString()}</td>
                                <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls Mapping Spring Metadata Elements */}
            <div className="p-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                <button
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-xs text-slate-500 font-medium">Page <strong className="text-slate-800">{page + 1}</strong> of {totalPages || 1}</span>
                <button
                    disabled={page >= totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default InvoiceGrid;
