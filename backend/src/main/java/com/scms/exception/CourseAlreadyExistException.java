package com.scms.exception;

public class CourseAlreadyExistException extends RuntimeException {
    public CourseAlreadyExistException(String message) {
        super(message);
    }
}
