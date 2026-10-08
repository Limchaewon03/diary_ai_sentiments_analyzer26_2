/**
 * ==============================================================================
 * 구글 스프레드시트 CRUD 연동용 Google Apps Script (GAS)
 * 
 * 시트 ID: 1XOzj2oi4rCz5HRmr7mTYAnZnGshKC5aMWYbpd9ZSwRc
 * 컬럼 구조: 
 *   - [A열] timestamp : 고유 ID 역할 (밀리초 타임스탬프 등)
 *   - [B열] datetime  : 사용자가 보기 쉬운 일시 문자열 (예: 2026-10-08 14:00:00)
 *   - [C열] content   : 일기 내용
 * ==============================================================================
 */

const SPREADSHEET_ID = "1XOzj2oi4rCz5HRmr7mTYAnZnGshKC5aMWYbpd9ZSwRc";
const SHEET_NAME = "시트1"; // 사용하는 시트 탭 이름 (다르면 변경)

/**
 * 시트 객체 가져오기 및 헤더 자동 초기화
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  
  // 첫 행이 비어있으면 헤더 자동 생성
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "datetime", "content"]);
  }
  return sheet;
}

/**
 * JSON 응답 생성 헬퍼 함수 (CORS 대응)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET 요청 핸들러 (Read / 조회)
 * 1) 전체 목록 조회:
 *    GET https://script.google.com/.../exec?action=read
 * 2) 단일 항목 조회:
 *    GET https://script.google.com/.../exec?action=read&timestamp=1728367200000
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    const action = e?.parameter?.action || "read";
    const targetTimestamp = e?.parameter?.timestamp;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: true, count: 0, items: [] });
    }

    const rows = data.slice(1); // 헤더 제외

    const items = rows.map((row, index) => ({
      rowIndex: index + 2,
      timestamp: String(row[0]),
      datetime: String(row[1]),
      content: String(row[2])
    }));

    // 단일 항목 조회
    if (targetTimestamp) {
      const item = items.find(it => it.timestamp === String(targetTimestamp));
      if (!item) {
        return createJsonResponse({ success: false, error: "해당 timestamp의 데이터를 찾을 수 없습니다." });
      }
      return createJsonResponse({ success: true, item: item });
    }

    // 전체 항목 조회 (최신순 정렬)
    items.reverse();

    return createJsonResponse({ success: true, count: items.length, items: items });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

/**
 * POST 요청 핸들러 (Create, Update, Delete)
 * 
 * 요청 Body (JSON):
 * 
 * 1) 생성 (Create):
 *    {
 *      "action": "create",
 *      "content": "오늘의 일기 본문",
 *      "datetime": "2026-10-08 15:00:00" (선택, 미입력 시 서버 현재 시각)
 *    }
 * 
 * 2) 수정 (Update):
 *    {
 *      "action": "update",
 *      "timestamp": "1728367200000",
 *      "content": "수정할 내용",
 *      "datetime": "수정할 일시" (선택)
 *    }
 * 
 * 3) 삭제 (Delete):
 *    {
 *      "action": "delete",
 *      "timestamp": "1728367200000"
 *    }
 */
function doPost(e) {
  try {
    const sheet = getSheet();
    let body = {};
    
    if (e?.postData?.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e?.parameter) {
      body = e.parameter;
    }

    const action = body.action || "create";

    // -------------------------------------------------------------
    // 1. Create (새 일기 추가)
    // -------------------------------------------------------------
    if (action === "create") {
      const now = new Date();
      const timestamp = body.timestamp ? String(body.timestamp) : String(now.getTime());
      const datetime = body.datetime || Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
      const content = body.content || "";

      sheet.appendRow([timestamp, datetime, content]);

      return createJsonResponse({
        success: true,
        message: "일기가 성공적으로 저장되었습니다.",
        item: { timestamp, datetime, content }
      });
    }

    // -------------------------------------------------------------
    // 2. Update (일기 수정)
    // -------------------------------------------------------------
    if (action === "update") {
      const targetTimestamp = String(body.timestamp || "");
      if (!targetTimestamp) {
        return createJsonResponse({ success: false, error: "수정할 대상의 timestamp가 필요합니다." });
      }

      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetTimestamp) {
          foundRow = i + 1; // 1-based index
          break;
        }
      }

      if (foundRow === -1) {
        return createJsonResponse({ success: false, error: "일치하는 timestamp 데이터를 찾을 수 없습니다." });
      }

      if (body.datetime !== undefined) {
        sheet.getRange(foundRow, 2).setValue(body.datetime);
      }
      if (body.content !== undefined) {
        sheet.getRange(foundRow, 3).setValue(body.content);
      }

      return createJsonResponse({
        success: true,
        message: "일기가 성공적으로 수정되었습니다.",
        timestamp: targetTimestamp
      });
    }

    // -------------------------------------------------------------
    // 3. Delete (일기 삭제)
    // -------------------------------------------------------------
    if (action === "delete") {
      const targetTimestamp = String(body.timestamp || "");
      if (!targetTimestamp) {
        return createJsonResponse({ success: false, error: "삭제할 대상의 timestamp가 필요합니다." });
      }

      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetTimestamp) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) {
        return createJsonResponse({ success: false, error: "일치하는 timestamp 데이터를 찾을 수 없습니다." });
      }

      sheet.deleteRow(foundRow);

      return createJsonResponse({
        success: true,
        message: "일기가 성공적으로 삭제되었습니다.",
        timestamp: targetTimestamp
      });
    }

    return createJsonResponse({
      success: false,
      error: "유효하지 않은 action입니다. (action: create | update | delete)"
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}
