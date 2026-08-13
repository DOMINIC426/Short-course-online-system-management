package com.scms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserAlreadyExistException.class)
    public ResponseEntity<Map<String,String>> userAlreadyExist(){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "message","User Already exist ",
                "time", LocalDateTime.now().toString()
        ));
    }
}
