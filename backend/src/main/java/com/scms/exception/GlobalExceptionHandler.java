
package com.scms.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles UserAlreadyExistException
     * HTTP 409 - Conflict
     */
    @ExceptionHandler(UserAlreadyExistException.class)
    public ResponseEntity<Object> handleUserAlreadyExists(
            UserAlreadyExistException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "User already exists",
                request
        );
    }

    /**
     * Handles UserNotFoundException
     * HTTP 404 - Not Found
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(
            UserNotFoundException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "User not found",
                request
        );
    }

    /**
     * Handles CourseAlreadyExistException
     * HTTP 409 - Conflict
     */
    @ExceptionHandler(CourseAlreadyExistException.class)
    public ResponseEntity<Object> handleCourseAlreadyExists(
            CourseAlreadyExistException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Course already exists",
                request
        );
    }

    /**
     * Handles ResourceNotFoundException
     * HTTP 404 - Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(
            ResourceNotFoundException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Resource not found",
                request
        );
    }

    /**
     * Handles BusinessRuleViolationException
     * HTTP 409 - Conflict
     */
    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<Object> handleBusinessRuleViolation(
            BusinessRuleViolationException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Business rule violation",
                request
        );
    }

    /**
     * Handles DuplicateResourceException
     * HTTP 409 - Conflict
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Object> handleDuplicateResource(
            DuplicateResourceException ex,
            WebRequest request) {

        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Resource already exists",
                request
        );
    }

    /**
     * Handles @Valid / @Validated request body validation errors.
     *
     * Example:
     * {
     *   "timestamp": "...",
     *   "status": 400,
     *   "error": "Bad Request",
     *   "message": "Validation failed",
     *   "details": {
     *      "username": "Username is required",
     *      "email": "Invalid email address"
     *   },
     *   "path": "/api/users"
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(
            MethodArgumentNotValidException ex,
            WebRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(
                    error.getField(),
                    error.getDefaultMessage() != null
                            ? error.getDefaultMessage()
                            : "Invalid value"
            );
        }

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                errors,
                request
        );
    }

    /**
     * Handles validation errors caused by
     * @RequestParam, @PathVariable, etc.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolation(
            ConstraintViolationException ex,
            WebRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();

        ex.getConstraintViolations().forEach(violation -> {

            String propertyPath = violation.getPropertyPath().toString();

            String message = violation.getMessage() != null
                    ? violation.getMessage()
                    : "Invalid value";

            errors.put(propertyPath, message);
        });

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                errors,
                request
        );
    }

    /**
     * Handles all unexpected exceptions.
     *
     * IMPORTANT:
     * Do not expose ex.getMessage() to the client here.
     * Internal exception messages may reveal:
     * - database information
     * - SQL queries
     * - file paths
     * - framework details
     * - internal implementation information
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(
            Exception ex,
            WebRequest request) {

        // Log the real exception internally.
        // Use your project's logger here.
        //
        // Example:
        // log.error("Unexpected error occurred", ex);

        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request
        );
    }

    /**
     * Builds a standardized error response.
     */
    private ResponseEntity<Object> buildErrorResponse(
            HttpStatus status,
            String message,
            WebRequest request) {

        return buildErrorResponse(
                status,
                message,
                null,
                request
        );
    }

    /**
     * Builds a standardized error response
     * with validation or additional details.
     */
    private ResponseEntity<Object> buildErrorResponse(
            HttpStatus status,
            String message,
            Map<String, String> details,
            WebRequest request) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now().toString()
        );

        body.put(
                "status",
                status.value()
        );

        body.put(
                "error",
                status.getReasonPhrase()
        );

        body.put(
                "message",
                message
        );

        if (details != null && !details.isEmpty()) {
            body.put(
                    "details",
                    details
            );
        }

        body.put(
                "path",
                extractPath(request)
        );

        return ResponseEntity
                .status(status)
                .body(body);
    }

    /**
     * Extracts the request URI from WebRequest.
     */
    private String extractPath(WebRequest request) {

        if (request == null) {
            return null;
        }

        String description = request.getDescription(false);

        if (description == null || description.isBlank()) {
            return null;
        }

        if (description.startsWith("uri=")) {
            return description.substring(4);
        }

        return description;
    }
}

