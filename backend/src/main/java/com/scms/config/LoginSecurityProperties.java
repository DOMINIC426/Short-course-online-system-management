package com.scms.config;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "security.login")
public class LoginSecurityProperties {

    @Min(1)
    private int maxFailedAttempts = 5;

    @Min(1)
    private long lockDurationMinutes = 5;
}
