package com.scms.exception;

public class ResendCooldownException extends RuntimeException {
    public ResendCooldownException(String message) {
        super(message);
    }
}
