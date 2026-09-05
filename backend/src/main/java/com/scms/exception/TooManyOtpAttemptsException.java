package com.scms.exception;

public class TooManyOtpAttemptsException extends RuntimeException {
    public TooManyOtpAttemptsException(String message) {
        super(message);
    }
}
