// Export Utilities for TMVC E-Office
// Uses SheetJS (XLSX) and jsPDF via dynamic CDN loading

export const exportToExcel = (data, fileName = "export.xlsx") => {
    if (!window.XLSX) {
        console.error("SheetJS not loaded");
        alert("Excel 套件尚未載入，請稍後再試");
        return;
    }

    const worksheet = window.XLSX.utils.json_to_sheet(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    window.XLSX.writeFile(workbook, fileName);
};

// Simple PDF Export using window.print() approach or jsPDF
// Note: jsPDF with Chinese characters requires custom fonts. 
// For this Zero-Build, we use a structured HTML print view for best compatibility.

export const exportToPDF = (elementId, fileName = "export.pdf") => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // We can use window.print() with a temporary visible area or use a library
    // Here we'll provide a clean print version of the table
    window.print();
};

/**
 * Normalizes form data for Excel export
 */
export const prepareDataForExport = (forms) => {
    return forms.map(f => ({
        "提交日期": f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '未知',
        "申請人": f.userEmail,
        "種類": f.displayType,
        "事由": f.reason,
        "地點/目的地": f.location || f.destination || '-',
        "金額 (NTD)": f.displayAmount,
        "狀態": f.status || '待審核'
    }));
};
