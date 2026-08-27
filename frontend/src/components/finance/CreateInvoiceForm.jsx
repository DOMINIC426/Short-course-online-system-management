import React, { useState } from 'react';
import financeApi from './financeApi';

const CreateInvoiceForm = ({ onInvoiceCreated, onClose }) => {
    const [studentId, setStudentId] = useState('');
    const [intakeId, setIntakeId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ description: '', quantity: 1, unitAmount: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const addItemLine = () => {
        setItems([...items, { description: '', quantity: 1, unitAmount: '' }]);
    };

    const removeItemLine = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Format payloads accurately to align with our ModelMapper backend constraints
        const payload = {
            studentId: parseInt(studentId),
            intakeId: intakeId ? parseInt(intakeId) : null,
            notes: notes || null,
            items: items.map(item => ({
                description: item.description,
                quantity: parseInt(item.quantity),
                unitAmount: parseFloat(item.unitAmount)
            }))
        };

        try {
            await financeApi.post('/invoices', payload);
            onInvoiceCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit calculation block data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 text-lg">Generate Student Ledger Invoice</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
                    {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg font-medium">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Student ID Target</label>
                            <input type="number" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium" placeholder="e.g., 1" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Course Intake ID (Optional)</label>
                            <input type="number" value={intakeId} onChange={(e) => setIntakeId(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium" placeholder="e.g., 3" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Line Item Breakdowns</label>
                            <button type="button" onClick={addItemLine} className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition">+ Add Item Line</button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                    <div className="col-span-6">
                                        <input type="text" required placeholder="Item Description Detail" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md focus:outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" required min="1" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md focus:outline-none text-center" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" required placeholder="Price" value={item.unitAmount} onChange={(e) => handleItemChange(index, 'unitAmount', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md focus:outline-none text-right" />
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <button type="button" disabled={items.length === 1} onClick={() => removeItemLine(index)} className="text-rose-500 hover:text-rose-700 disabled:opacity-30 font-medium text-lg">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Administrative Memo / Notes</label>
                        <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none" placeholder="Enter invoice specific audit logs or remarks here..."></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
                            {loading ? 'Processing Billing...' : 'Compile & Post Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoiceForm;
