/**
 * 毛毛先生 — Google Apps Script Web App 範本
 * =============================================
 * 部署步驟：
 * 1. 開啟你的 Google Sheets → 上方選單「擴充功能」→「Apps Script」
 * 2. 將此檔案全部內容貼入，取代預設的 myFunction()
 * 3. 點右上角「部署」→「新增部署作業」
 * 4. 類型選「網路應用程式」
 * 5. 「以誰的身分執行」→ 選「我（你的 Google 帳號）」
 * 6. 「誰可以存取」→ 選「所有人」
 * 7. 點「部署」，授權後複製「網路應用程式網址」
 * 8. 將網址貼入毛毛先生設定頁面的「Apps Script 網址」欄位
 *
 * 注意：每次修改程式碼後，需重新「部署」→「管理部署作業」→「編輯」→
 *       版本選「新版本」→「部署」，才能讓修改生效。
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.openById(data.sheetId)
    const sheet = ss.getSheetByName(data.sheet)

    if (!sheet) {
      return respond({ error: '找不到工作表：' + data.sheet })
    }

    // 新增一列
    if (data.action === 'append') {
      sheet.appendRow(data.row)
      return respond({ success: true })
    }

    // 更新指定 ID 的欄位（依第一欄 ID 搜尋）
    if (data.action === 'update') {
      const rows = sheet.getDataRange().getValues()
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.getRange(i + 1, data.col).setValue(data.value)
          return respond({ success: true })
        }
      }
      return respond({ error: '找不到 ID：' + data.id })
    }

    // 刪除指定 ID 的列
    if (data.action === 'delete') {
      const rows = sheet.getDataRange().getValues()
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.deleteRow(i + 1)
          return respond({ success: true })
        }
      }
      return respond({ error: '找不到 ID：' + data.id })
    }

    return respond({ error: '未知操作：' + data.action })
  } catch (err) {
    return respond({ error: err.message })
  }
}

// GET 請求用於測試連線是否正常
function doGet(e) {
  return respond({ status: 'ok', message: '毛毛先生 Apps Script 服務運作正常 🐾' })
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
