/**
 * GOOGLE APPS SCRIPT CODE TEMPLATE & SYNC UTILITY
 * Dành cho Google Apps Script kết nối Google Sheets
 */

export const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - TỰ ĐỘNG GHI KẾT QUẢ THI TỪ APP LÊN GOOGLE SHEET
 * Ứng dụng: AI LÀ TRIỆU PHÚ TOÁN HỌC 2027 (GV: CHÁNH THÀNH)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Nếu trang tính còn trống, tự động tạo dòng tiêu đề chuẩn
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Thời gian nộp",
        "Họ và tên",
        "Lớp",
        "Tên đề thi",
        "Điểm số (thang 10)",
        "Phần I (Trắc nghiệm)",
        "Phần II (Đúng/Sai)",
        "Phần III (Điền đáp án)",
        "Thời gian làm bài",
        "Số lần rời màn hình",
        "Ghi chú / Trạng thái"
      ];
      sheet.appendRow(headers);
      
      // Định dạng đẹp cho thanh tiêu đề
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#facc15");
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(11);
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    // Thời gian nộp bài theo giờ Việt Nam
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var playerName = data.playerName || data.name || "Thí sinh tự do";
    var className = data.className || "Tự do";
    var examTitle = data.examTitle || "Đề thi Toán THPT 2027";
    var score = data.score !== undefined ? Number(data.score).toFixed(2) : "0.00";
    
    var partI = (data.totalCorrectPartI !== undefined ? data.totalCorrectPartI + "/12 câu" : "") + 
                (data.partIScore !== undefined ? " (" + Number(data.partIScore).toFixed(2) + "đ)" : "");
                
    var partII = (data.totalCorrectPartII !== undefined ? data.totalCorrectPartII + "/4 câu" : "") + 
                 (data.partIIScore !== undefined ? " (" + Number(data.partIIScore).toFixed(2) + "đ)" : "");
                 
    var partIII = (data.totalCorrectPartIII !== undefined ? data.totalCorrectPartIII + "/6 câu" : "") + 
                  (data.partIIIScore !== undefined ? " (" + Number(data.partIIIScore).toFixed(2) + "đ)" : "");
    
    // Tính thời gian làm bài dạng MM:SS
    var timeSpent = "";
    if (data.timeSpentSeconds !== undefined) {
      var m = Math.floor(data.timeSpentSeconds / 60);
      var s = data.timeSpentSeconds % 60;
      timeSpent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    } else {
      timeSpent = data.timeSpent || "--:--";
    }

    var violations = (data.violationCount !== undefined) ? data.violationCount + " lần" : "0 lần";
    var note = (data.violationCount > 0) ? "⚠️ Rời màn hình " + data.violationCount + " lần" : "✅ Hoàn thành nghiêm túc";

    // Chèn dòng dữ liệu mới
    sheet.appendRow([
      timestamp,
      playerName,
      className,
      examTitle,
      score,
      partI,
      partII,
      partIII,
      timeSpent,
      violations,
      note
    ]);

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 11).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 2).setHorizontalAlignment("left"); // Tên căn trái
    sheet.getRange(lastRow, 4).setHorizontalAlignment("left"); // Đề thi căn trái
    sheet.getRange(lastRow, 5).setFontWeight("bold").setFontColor("#2563eb").setFontSize(12); // Điểm nổi bật

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã ghi nhận điểm số lên Google Sheet thành công!",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Google Apps Script Webhook kết nối Google Sheet cho App Toán THPT đang hoạt động rất tốt!"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

export interface SheetSubmissionData {
  playerName: string;
  className?: string;
  examTitle: string;
  score: number;
  partIScore?: number;
  partIIScore?: number;
  partIIIScore?: number;
  totalCorrectPartI?: number;
  totalCorrectPartII?: number;
  totalCorrectPartIII?: number;
  timeSpentSeconds: number;
  violationCount: number;
}

export async function sendScoreToGoogleSheet(
  webAppUrl: string,
  data: SheetSubmissionData
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Sheet Web App không hợp lệ.' };
  }

  try {
    // We send via POST text/plain to avoid CORS preflight issues with Google Apps Script
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      mode: 'no-cors', // Standard Google Apps Script Web App post method from browser
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });

    return {
      success: true,
      message: 'Đã gửi kết quả bài thi lên Google Sheet thành công!',
    };
  } catch (err: any) {
    console.error('Lỗi khi gửi lên Google Sheet:', err);
    return {
      success: false,
      message: `Lỗi kết nối: ${err?.message || 'Không thể gửi dữ liệu'}`,
    };
  }
}
