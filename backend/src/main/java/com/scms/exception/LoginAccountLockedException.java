package com.scms.exception;

public class LoginAccountLockedException extends TooManyRequestsException {

    public LoginAccountLockedException() {
        super("Too many failed login attempts. Please try again later.");
    }
}
