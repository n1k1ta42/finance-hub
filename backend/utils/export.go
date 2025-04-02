package utils

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"time"

	"github.com/gocarina/gocsv"
	"github.com/jung-kurt/gofpdf"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/xuri/excelize/v2"
)

// TransactionExport структура для экспорта транзакций
type TransactionExport struct {
	ID           uint      `csv:"ID"`
	Amount       float64   `csv:"Сумма"`
	Description  string    `csv:"Описание"`
	Date         string    `csv:"Дата"`
	CategoryName string    `csv:"Категория"`
	CategoryType string    `csv:"Тип"`
	CreatedAt    time.Time `csv:"Дата создания"`
}

// StatsSummary структура с данными статистики для экспорта
type StatsSummary struct {
	TotalIncome  float64
	TotalExpense float64
	Balance      float64
	StartDate    time.Time
	EndDate      time.Time
	Categories   []CategorySummary
}

// CategorySummary структура для категорий в отчете
type CategorySummary struct {
	Name       string
	Amount     float64
	Percentage float64
	Type       string
}

// ConvertTransactionsToExport конвертирует транзакции в формат для экспорта
func ConvertTransactionsToExport(transactions []models.Transaction) []TransactionExport {
	result := make([]TransactionExport, len(transactions))
	for i, t := range transactions {
		categoryType := "Расход"
		if t.Category.Type == models.Income {
			categoryType = "Доход"
		}
		result[i] = TransactionExport{
			ID:           t.ID,
			Amount:       t.Amount,
			Description:  t.Description,
			Date:         t.Date.Format("02.01.2006"),
			CategoryName: t.Category.Name,
			CategoryType: categoryType,
			CreatedAt:    t.CreatedAt,
		}
	}
	return result
}

// ExportTransactionsToCSV экспортирует транзакции в CSV
func ExportTransactionsToCSV(transactions []models.Transaction) ([]byte, error) {
	exportData := ConvertTransactionsToExport(transactions)
	
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)
	writer.Comma = ';' // Разделитель для поддержки русских символов
	
	err := gocsv.MarshalCSV(exportData, writer)
	if err != nil {
		return nil, err
	}
	
	writer.Flush()
	return buf.Bytes(), nil
}

// ExportTransactionsToExcel экспортирует транзакции в Excel
func ExportTransactionsToExcel(transactions []models.Transaction) ([]byte, error) {
	exportData := ConvertTransactionsToExport(transactions)
	
	f := excelize.NewFile()
	
	// Создаем новый лист для транзакций
	sheet := "Транзакции"
	index, err := f.NewSheet(sheet)
	if err != nil {
		return nil, err
	}
	
	// Делаем наш лист активным
	f.SetActiveSheet(index)
	
	// Устанавливаем заголовки
	headers := []string{"ID", "Сумма", "Описание", "Дата", "Категория", "Тип", "Дата создания"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, header)
	}
	
	// Заполняем данными
	for i, t := range exportData {
		row := i + 2 // +2 потому что нумерация начинается с 1 и первая строка - заголовки
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), t.ID)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), t.Amount)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), t.Description)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), t.Date)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), t.CategoryName)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), t.CategoryType)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), t.CreatedAt.Format("02.01.2006 15:04:05"))
	}
	
	// Устанавливаем стили для заголовков
	style, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E0EBF5"},
			Pattern: 1,
		},
	})
	if err != nil {
		return nil, err
	}
	
	// Применяем стиль к заголовкам
	f.SetCellStyle(sheet, "A1", fmt.Sprintf("%c1", 'A'+len(headers)-1), style)
	
	// Автоматическая ширина столбцов
	for i := range headers {
		colName := string('A' + i)
		f.SetColWidth(sheet, colName, colName, 15)
	}
	
	// Удаляем дефолтный лист Sheet1
	f.DeleteSheet("Sheet1")
	
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
}

// ExportStatsToPDF экспортирует статистику в PDF
func ExportStatsToPDF(stats StatsSummary, userName string) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	
	// Устанавливаем шрифт с поддержкой русских символов
	pdf.AddUTF8Font("DejaVu", "", "fonts/dejavu-fonts-ttf/ttf/DejaVuSans.ttf")
	pdf.SetFont("DejaVu", "", 12)
	
	// Заголовок отчета
	pdf.SetFont("DejaVu", "", 16)
	pdf.Cell(190, 10, "Финансовый отчет")
	pdf.Ln(15)
	
	// Информация о пользователе и периоде
	pdf.SetFont("DejaVu", "", 12)
	pdf.Cell(190, 10, fmt.Sprintf("Пользователь: %s", userName))
	pdf.Ln(10)
	pdf.Cell(190, 10, fmt.Sprintf("Период: %s - %s", 
		stats.StartDate.Format("02.01.2006"), 
		stats.EndDate.Format("02.01.2006")))
	pdf.Ln(10)
	
	// Общая сводка
	pdf.SetFont("DejaVu", "", 14)
	pdf.Cell(190, 10, "Финансовая сводка")
	pdf.Ln(10)
	
	pdf.SetFont("DejaVu", "", 12)
	pdf.Cell(95, 10, "Общий доход:")
	pdf.Cell(95, 10, fmt.Sprintf("%.2f руб.", stats.TotalIncome))
	pdf.Ln(8)
	
	pdf.Cell(95, 10, "Общий расход:")
	pdf.Cell(95, 10, fmt.Sprintf("%.2f руб.", stats.TotalExpense))
	pdf.Ln(8)
	
	pdf.Cell(95, 10, "Баланс:")
	pdf.Cell(95, 10, fmt.Sprintf("%.2f руб.", stats.Balance))
	pdf.Ln(15)
	
	// Категории расходов
	pdf.SetFont("DejaVu", "", 14)
	pdf.Cell(190, 10, "Расходы по категориям")
	pdf.Ln(10)
	
	// Заголовки таблицы
	pdf.SetFont("DejaVu", "", 12)
	pdf.SetFillColor(200, 220, 255)
	pdf.CellFormat(95, 10, "Категория", "1", 0, "", true, 0, "")
	pdf.CellFormat(35, 10, "Сумма (руб.)", "1", 0, "", true, 0, "")
	pdf.CellFormat(60, 10, "Процент от общего", "1", 1, "", true, 0, "")
	
	// Данные по категориям расходов
	var expenseCategories []CategorySummary
	for _, category := range stats.Categories {
		if category.Type == "expense" {
			expenseCategories = append(expenseCategories, category)
		}
	}
	
	// Сортировка по убыванию суммы
	for i := 0; i < len(expenseCategories); i++ {
		if i%2 == 0 {
			pdf.SetFillColor(240, 240, 240)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		
		pdf.CellFormat(95, 10, expenseCategories[i].Name, "1", 0, "", true, 0, "")
		pdf.CellFormat(35, 10, fmt.Sprintf("%.2f", expenseCategories[i].Amount), "1", 0, "", true, 0, "")
		pdf.CellFormat(60, 10, fmt.Sprintf("%.2f%%", expenseCategories[i].Percentage), "1", 1, "", true, 0, "")
	}
	
	pdf.Ln(10)
	
	// Категории доходов
	pdf.SetFont("DejaVu", "", 14)
	pdf.Cell(190, 10, "Доходы по категориям")
	pdf.Ln(10)
	
	// Заголовки таблицы
	pdf.SetFont("DejaVu", "", 12)
	pdf.SetFillColor(200, 220, 255)
	pdf.CellFormat(95, 10, "Категория", "1", 0, "", true, 0, "")
	pdf.CellFormat(35, 10, "Сумма (руб.)", "1", 0, "", true, 0, "")
	pdf.CellFormat(60, 10, "Процент от общего", "1", 1, "", true, 0, "")
	
	// Данные по категориям доходов
	var incomeCategories []CategorySummary
	for _, category := range stats.Categories {
		if category.Type == "income" {
			incomeCategories = append(incomeCategories, category)
		}
	}
	
	for i := 0; i < len(incomeCategories); i++ {
		if i%2 == 0 {
			pdf.SetFillColor(240, 240, 240)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		
		pdf.CellFormat(95, 10, incomeCategories[i].Name, "1", 0, "", true, 0, "")
		pdf.CellFormat(35, 10, fmt.Sprintf("%.2f", incomeCategories[i].Amount), "1", 0, "", true, 0, "")
		pdf.CellFormat(60, 10, fmt.Sprintf("%.2f%%", incomeCategories[i].Percentage), "1", 1, "", true, 0, "")
	}
	
	// Дата и время создания отчета
	pdf.Ln(15)
	pdf.SetFont("DejaVu", "", 10)
	currentTime := time.Now().Format("02.01.2006 15:04:05")
	pdf.Cell(190, 10, fmt.Sprintf("Отчет сгенерирован: %s", currentTime))
	
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
} 