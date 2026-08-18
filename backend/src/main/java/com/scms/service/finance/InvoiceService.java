package com.scms.service.finance;

import com.scms.entity.Invoice;
import com.scms.entity.InvoiceItem;
import com.scms.entity.Student;
import com.scms.entity.CourseIntake;
import com.scms.entity.enums.InvoiceStatus;
import com.scms.repository.finance.InvoiceRepository;
import com.scms.repository.student.CourseIntakeRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final CourseIntakeRepository courseIntakeRepository;

    public synchronized String generateInvoiceNumber() {
        Long nextSequence = invoiceRepository.findMaxId() + 1;
        int currentYear = Year.now().getValue();
        return String.format("INV-%d-%05d", currentYear, nextSequence);
    }

    @Transactional
    public Invoice createInvoice(Long studentId, Long intakeId, List<InvoiceItem> items, String notes) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student record not found with ID: " + studentId));

        CourseIntake intake = null;
        if (intakeId != null) {
            intake = courseIntakeRepository.findById(intakeId)
                    .orElseThrow(() -> new IllegalArgumentException("Course intake cohort not found with ID: " + intakeId));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (InvoiceItem item : items) {
            BigDecimal itemTotal = item.getUnitAmount().multiply(BigDecimal.valueOf(item.getQuantity()));
            item.setTotalAmount(itemTotal);
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(tax).subtract(discount);

        // Standard setter-style initialization
        Invoice invoice = new Invoice();
        invoice.setStudent(student);
        invoice.setCourseIntake(intake);
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setSubtotalAmount(subtotal);
        invoice.setTaxAmount(tax);
        invoice.setDiscountAmount(discount);
        invoice.setTotalAmount(totalAmount);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setBalanceAmount(totalAmount);
        invoice.setNotes(notes);

        for (InvoiceItem item : items) {
            item.setInvoice(invoice);
        }
        invoice.setItems(items);

        return invoiceRepository.save(invoice);
    }

    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    public Page<Invoice> getAllInvoicesPaginated(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.DESC.name())
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return invoiceRepository.findAll(pageable);
    }
}
