package com.scms.service;

import com.scms.dto.*;
import com.scms.entity.*;
import com.scms.entity.enums.AnnouncementStatus;
import com.scms.entity.enums.CourseStatus;
import com.scms.entity.enums.CertificateStatus;
import com.scms.entity.enums.PaymentStatus;
import com.scms.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstructorService {

    private final InstructorRepository instructorRepository;

    private final CourseInstructorRepository courseInstructorRepository;

    private final InstructorCourseEnrollmentRepository courseEnrollmentRepository;

    private final PaymentTransactionRepository paymentTransactionRepository;

    private final AnnouncementRepository announcementRepository;

    private final NotificationRepository notificationRepository;

    private final VenueRepository venueRepository;

    private final VenueChangeHistoryRepository venueChangeHistoryRepository;

    private final CourseProgressRepository courseProgressRepository;
    private final CertificateEligibilityRepository certificateEligibilityRepository;


    // =========================================================
    // 1. INSTRUCTOR PROFILE
    // =========================================================

    public InstructorProfileResponse getProfileByEmail(
            String email) {

        Instructor instructor =
                instructorRepository
                        .findByUser_Email(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Instructor profile not found"
                                )
                        );

        Users user =
                instructor.getUser();

        return new InstructorProfileResponse(
                instructor.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                null,
                null
        );
    }


    // =========================================================
    // 2. VIEW ASSIGNED COURSES
    // =========================================================

    public List<InstructorCourseResponse> getMyCourses(
            String email) {

        return courseInstructorRepository
                .findByInstructor_User_Email(email)
                .stream()
                .map(this::mapCourse)
                .toList();
    }


    private InstructorCourseResponse mapCourse(
            CourseInstructor assignment) {

        ShortCourse course =
                assignment.getCourse();

        return new InstructorCourseResponse(
                course.getId(),
                course.getCourseCode(),
                course.getTitle(),
                course.getStartDate(),
                course.getEndDate(),
                course.getCourseFee(),

                course.getStatus() == null
                        ? null
                        : course.getStatus().name(),

                assignment.getAssignedDate()
        );
    }


    // =========================================================
    // 3. VIEW REGISTERED STUDENTS
    //    + SEARCH
    //    + PAYMENT FILTER
    // =========================================================

    public List<InstructorStudentResponse> getStudents(
            String email,
            Long courseId,
            String search,
            String paymentStatus) {

        checkCourseAssignment(
                email,
                courseId
        );

        String normalizedSearch =
                search == null
                        ? ""
                        : search.trim()
                        .toLowerCase(Locale.ROOT);


        String normalizedPaymentStatus =
                paymentStatus == null
                        ? ""
                        : paymentStatus.trim()
                        .toUpperCase(Locale.ROOT);


        if (!normalizedPaymentStatus.isEmpty()) {

            try {

                PaymentStatus.valueOf(
                        normalizedPaymentStatus
                );

            } catch (IllegalArgumentException exception) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid payment status"
                );
            }
        }


        return courseEnrollmentRepository
                .findByCourse_Id(courseId)
                .stream()

                .filter(enrollment -> {

                    if (normalizedPaymentStatus.isEmpty()) {
                        return true;
                    }

                    return enrollment.getPaymentStatus() != null

                            && enrollment
                            .getPaymentStatus()
                            .name()
                            .equals(normalizedPaymentStatus);
                })

                .filter(enrollment ->
                        matchesSearch(
                                enrollment,
                                normalizedSearch
                        )
                )

                .map(this::mapStudent)

                .toList();
    }


    private boolean matchesSearch(
            CourseEnrollment enrollment,
            String search) {

        if (search.isEmpty()) {
            return true;
        }


        Users user =
                enrollment
                        .getStudent()
                        .getUser();


        String firstName =
                user.getFirstName() == null
                        ? ""
                        : user.getFirstName()
                        .toLowerCase(Locale.ROOT);


        String lastName =
                user.getLastName() == null
                        ? ""
                        : user.getLastName()
                        .toLowerCase(Locale.ROOT);


        String email =
                user.getEmail() == null
                        ? ""
                        : user.getEmail()
                        .toLowerCase(Locale.ROOT);


        String fullName =
                (firstName + " " + lastName)
                        .trim();


        return firstName.contains(search)
                || lastName.contains(search)
                || fullName.contains(search)
                || email.contains(search);
    }


    private InstructorStudentResponse mapStudent(
            CourseEnrollment enrollment) {

        Users user =
                enrollment
                        .getStudent()
                        .getUser();


        return new InstructorStudentResponse(

                enrollment.getId(),

                enrollment
                        .getStudent()
                        .getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                enrollment.getControlNumber(),

                enrollment.getRegistrationDate(),

                enrollment.getAmountRequired(),

                enrollment.getAmountPaid(),

                enrollment.getBalance(),

                enrollment.getPaymentStatus() == null
                        ? null
                        : enrollment
                        .getPaymentStatus()
                        .name()
        );
    }


    // =========================================================
    // 4. VIEW STUDENT DETAILS
    //    + PAYMENT HISTORY
    // =========================================================

    public InstructorStudentDetailsResponse getStudentDetails(
            String email,
            Long courseId,
            Long enrollmentId) {

        checkCourseAssignment(
                email,
                courseId
        );


        CourseEnrollment enrollment =
                courseEnrollmentRepository
                        .findByIdAndCourse_Id(
                                enrollmentId,
                                courseId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Student enrollment not found in this course"
                                )
                        );


        Users user =
                enrollment
                        .getStudent()
                        .getUser();


        ShortCourse course =
                enrollment.getCourse();


        List<InstructorPaymentHistoryResponse> paymentHistory =
                paymentTransactionRepository
                        .findByEnrollment_IdOrderByPaymentDateDesc(
                                enrollmentId
                        )
                        .stream()
                        .map(this::mapPayment)
                        .toList();


        return new InstructorStudentDetailsResponse(

                enrollment.getId(),

                enrollment
                        .getStudent()
                        .getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                enrollment.getControlNumber(),

                enrollment.getRegistrationDate(),

                enrollment.getEnrollmentStatus() == null
                        ? null
                        : enrollment
                        .getEnrollmentStatus()
                        .name(),

                course.getId(),

                course.getCourseCode(),

                course.getTitle(),

                enrollment.getAmountRequired(),

                enrollment.getAmountPaid(),

                enrollment.getBalance(),

                enrollment.getPaymentStatus() == null
                        ? null
                        : enrollment
                        .getPaymentStatus()
                        .name(),

                paymentHistory
        );
    }


    private InstructorPaymentHistoryResponse mapPayment(
            PaymentTransaction payment) {

        return new InstructorPaymentHistoryResponse(

                payment.getId(),

                payment.getControlNumber(),

                payment.getTransactionReference(),

                payment.getExternalTransactionId(),

                payment.getPaymentDate(),

                payment.getAmount(),

                payment.getPaymentMethod() == null
                        ? null
                        : payment
                        .getPaymentMethod()
                        .name(),

                payment.getPaymentStatus() == null
                        ? null
                        : payment
                        .getPaymentStatus()
                        .name()
        );
    }


    // =========================================================
    // 5. SEND ANNOUNCEMENT
    // =========================================================

    @Transactional
    public InstructorAnnouncementResponse sendAnnouncement(
            String email,
            Long courseId,
            InstructorAnnouncementRequest request) {

        CourseInstructor assignment =
                findCourseAssignment(
                        email,
                        courseId
                );


        List<CourseEnrollment> allEnrollments =
                courseEnrollmentRepository
                        .findByCourse_Id(courseId);


        List<CourseEnrollment> recipients;


        switch (request.getAudienceType()) {

            case ALL ->

                    recipients =
                            allEnrollments;


            case PAID ->

                    recipients =
                            allEnrollments
                                    .stream()

                                    .filter(enrollment ->
                                            enrollment.getPaymentStatus()
                                                    == PaymentStatus.PAID
                                    )

                                    .toList();


            case UNPAID ->

                    recipients =
                            allEnrollments
                                    .stream()

                                    .filter(enrollment -> {

                                        BigDecimal balance =
                                                enrollment.getBalance();


                                        if (balance != null) {

                                            return balance.compareTo(
                                                    BigDecimal.ZERO
                                            ) > 0;
                                        }


                                        return enrollment.getPaymentStatus()
                                                != PaymentStatus.PAID;
                                    })

                                    .toList();


            case SELECTED -> {

                if (request.getSelectedStudentIds() == null
                        || request.getSelectedStudentIds().isEmpty()) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "selectedStudentIds is required for SELECTED audience"
                    );
                }


                Set<Long> selectedIds =
                        new HashSet<>(
                                request.getSelectedStudentIds()
                        );


                recipients =
                        allEnrollments
                                .stream()

                                .filter(enrollment ->
                                        selectedIds.contains(
                                                enrollment
                                                        .getStudent()
                                                        .getId()
                                        )
                                )

                                .toList();


                Set<Long> foundIds =
                        recipients
                                .stream()

                                .map(enrollment ->
                                        enrollment
                                                .getStudent()
                                                .getId()
                                )

                                .collect(
                                        Collectors.toSet()
                                );


                if (!foundIds.containsAll(selectedIds)) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "One or more selected students are not enrolled in this course"
                    );
                }
            }


            default ->

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Unsupported audience type"
                    );
        }


        Announcement announcement =
                new Announcement();


        announcement.setCourse(
                assignment.getCourse()
        );


        announcement.setTitle(
                request.getTitle().trim()
        );


        announcement.setMessage(
                request.getMessage().trim()
        );


        announcement.setAudienceType(
                request.getAudienceType()
        );


        announcement.setCreatedBy(
                assignment.getInstructor()
        );


        announcement.setExpiryDate(
                request.getExpiryDate()
        );


        announcement.setStatus(
                AnnouncementStatus.SENT
        );


        announcement =
                announcementRepository
                        .save(announcement);


        String notificationMessage =
                announcement.getTitle()
                        + ": "
                        + announcement.getMessage();


        List<Notification> notifications =
                recipients
                        .stream()

                        .map(enrollment -> {

                            Notification notification =
                                    new Notification();


                            notification.setUser(
                                    enrollment
                                            .getStudent()
                                            .getUser()
                            );


                            notification.setMessage(
                                    notificationMessage
                            );


                            return notification;
                        })

                        .toList();


        notificationRepository
                .saveAll(notifications);


        return new InstructorAnnouncementResponse(

                announcement.getId(),

                assignment
                        .getCourse()
                        .getId(),

                announcement.getTitle(),

                announcement
                        .getAudienceType()
                        .name(),

                announcement
                        .getStatus()
                        .name(),

                recipients.size()
        );
    }


    // =========================================================
    // 6. UPDATE COURSE VENUE
    // =========================================================

    @Transactional
    public InstructorVenueUpdateResponse updateVenue(
            String email,
            Long courseId,
            InstructorVenueUpdateRequest request) {

        CourseInstructor assignment =
                findCourseAssignment(
                        email,
                        courseId
                );


        ShortCourse course =
                assignment.getCourse();


        Venue newVenue =
                venueRepository
                        .findById(
                                request.getVenueId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Venue not found"
                                )
                        );


        Venue oldVenue =
                course.getVenue();


        if (oldVenue != null
                && oldVenue
                .getId()
                .equals(newVenue.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This course is already assigned to this venue"
            );
        }


        String reason =
                request
                        .getReason()
                        .trim();


        if (reason.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reason for venue change is required"
            );
        }


        LocalDateTime changedAt =
                LocalDateTime.now();


        VenueChangeHistory history =
                new VenueChangeHistory();


        history.setCourse(
                course
        );


        history.setOldVenue(
                oldVenue
        );


        history.setNewVenue(
                newVenue
        );


        history.setChangedBy(
                assignment.getInstructor()
        );


        history.setChangeDate(
                changedAt
        );


        history.setReason(
                reason
        );


        course.setVenue(
                newVenue
        );


        venueChangeHistoryRepository
                .save(history);


        return new InstructorVenueUpdateResponse(

                course.getId(),

                course.getCourseCode(),

                oldVenue == null
                        ? null
                        : oldVenue.getId(),

                oldVenue == null
                        ? null
                        : oldVenue.getVenueName(),

                newVenue.getId(),

                newVenue.getVenueName(),

                reason,

                changedAt
        );
    }


    // =========================================================
    // 7. SUBMIT COURSE PROGRESS
    // =========================================================

    @Transactional
    public InstructorCourseProgressResponse submitCourseProgress(
            String email,
            Long courseId,
            InstructorCourseProgressRequest request) {

        CourseInstructor assignment =
                findCourseAssignment(
                        email,
                        courseId
                );


        CourseProgress progress =
                new CourseProgress();


        progress.setCourse(
                assignment.getCourse()
        );


        progress.setProgressPercentage(
                request.getProgressPercentage()
        );


        progress.setTopicsCompleted(
                request.getTopicsCompleted()
        );


        progress.setTopicsRemaining(
                request.getTopicsRemaining()
        );


        progress.setChallenges(
                request.getChallenges()
        );


        progress.setRemarks(
                request.getRemarks()
        );


        progress.setExpectedCompletionDate(
                request.getExpectedCompletionDate()
        );


        progress.setUpdatedBy(
                assignment.getInstructor()
        );


        progress =
                courseProgressRepository
                        .save(progress);


        return new InstructorCourseProgressResponse(

                progress.getId(),

                assignment
                        .getCourse()
                        .getId(),

                assignment
                        .getCourse()
                        .getCourseCode(),

                progress.getProgressPercentage(),

                progress.getTopicsCompleted(),

                progress.getTopicsRemaining(),

                progress.getChallenges(),

                progress.getRemarks(),

                progress.getExpectedCompletionDate(),

                assignment
                        .getInstructor()
                        .getId(),

                progress.getCreatedAt()
        );
    }


    // =========================================================
    // 8. SUBMIT COURSE COMPLETION
    // =========================================================

    @Transactional
    public InstructorCourseCompletionResponse completeCourse(
            String email,
            Long courseId) {

        CourseInstructor assignment =
                findCourseAssignment(
                        email,
                        courseId
                );


        ShortCourse course =
                assignment.getCourse();


        CourseStatus previousStatus =
                course.getStatus();


        if (previousStatus == CourseStatus.COMPLETED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Course is already completed"
            );
        }


        if (previousStatus == CourseStatus.CANCELLED
                || previousStatus == CourseStatus.ARCHIVED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancelled or archived course cannot be completed"
            );
        }


        course.setStatus(
                CourseStatus.COMPLETED
        );


        return new InstructorCourseCompletionResponse(

                course.getId(),

                course.getCourseCode(),

                course.getTitle(),

                previousStatus == null
                        ? null
                        : previousStatus.name(),

                CourseStatus.COMPLETED.name(),

                "Course marked as completed successfully"
        );
    }



    // =========================================================
    // 9. MANAGE CERTIFICATE ELIGIBILITY
    // =========================================================

    @Transactional
    public InstructorCertificateEligibilityResponse
    updateCertificateEligibility(
            String email,
            Long courseId,
            Long enrollmentId,
            InstructorCertificateEligibilityRequest request) {

        CourseInstructor assignment =
                findCourseAssignment(
                        email,
                        courseId
                );

        CourseEnrollment enrollment =
                courseEnrollmentRepository
                        .findByIdAndCourse_Id(
                                enrollmentId,
                                courseId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Student enrollment not found in this course"
                                )
                        );

        CertificateStatus requestedStatus =
                request.getStatus();

        if (requestedStatus != CertificateStatus.ELIGIBLE
                && requestedStatus != CertificateStatus.NOT_ELIGIBLE) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Instructor can only set ELIGIBLE or NOT_ELIGIBLE"
            );
        }

        CertificateEligibility eligibility =
                certificateEligibilityRepository
                        .findByEnrollment_Id(enrollmentId)
                        .orElseGet(() -> {

                            CertificateEligibility created =
                                    new CertificateEligibility();

                            created.setEnrollment(
                                    enrollment
                            );

                            return created;
                        });

        if (eligibility.getStatus() == CertificateStatus.APPROVED
                || eligibility.getStatus() == CertificateStatus.ISSUED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate eligibility can no longer be changed after approval or issuance"
            );
        }

        String reason =
                request.getReason() == null
                        ? null
                        : request.getReason().trim();

        if (reason != null && reason.isEmpty()) {
            reason = null;
        }

        eligibility.setStatus(
                requestedStatus
        );

        eligibility.setReason(
                reason
        );

        eligibility.setUpdatedBy(
                assignment.getInstructor()
        );

        eligibility =
                certificateEligibilityRepository
                        .saveAndFlush(eligibility);

        Users studentUser =
                enrollment
                        .getStudent()
                        .getUser();

        String studentName =
                (studentUser.getFirstName()
                        + " "
                        + studentUser.getLastName())
                        .trim();

        return new InstructorCertificateEligibilityResponse(

                eligibility.getId(),

                courseId,

                enrollment.getId(),

                enrollment
                        .getStudent()
                        .getId(),

                studentName,

                eligibility
                        .getStatus()
                        .name(),

                eligibility.getReason(),

                assignment
                        .getInstructor()
                        .getId(),

                eligibility.getUpdatedAt()
        );
    }


    // =========================================================
    // INTERNAL COURSE ASSIGNMENT
    // =========================================================

    private CourseInstructor findCourseAssignment(
            String email,
            Long courseId) {

        return courseInstructorRepository
                .findByInstructor_User_Email(email)
                .stream()

                .filter(assignment ->
                        assignment
                                .getCourse()
                                .getId()
                                .equals(courseId)
                )

                .findFirst()

                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "You are not assigned to this course"
                        )
                );
    }


    private void checkCourseAssignment(
            String email,
            Long courseId) {

        findCourseAssignment(
                email,
                courseId
        );
    }
}
