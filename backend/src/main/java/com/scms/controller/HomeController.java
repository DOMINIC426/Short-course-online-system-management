package com.scms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/home")
    public String greeting(){
        return "Hello World! Welcome to the short course online start point";
    }
}
